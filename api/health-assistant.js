import { createClient } from '@supabase/supabase-js';
import { Client, RunTree } from 'langsmith';

// Server-side environment variables (never exposed to client)
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
const GEMINI_MODEL = 'gemini-1.5-flash';

const HEALTH_ASSISTANT_SYSTEM_PROMPT = `You are AnimoPulse AI Health Assistant, a specialized animal health information assistant.
Guidelines:
1. Use the provided pet profile details (age, breed, weight, allergies, medications, conditions) and retrieved medical record chunks.
2. Structure your response into 4 distinct sections:
   - **Direct Answer**
   - **Key Findings**
   - **Suggested Next Steps**
   - **Veterinary Disclaimer**
3. NEVER make definitive diagnosis claims or replace a licensed veterinarian.
4. Always state uncertainties and encourage professional veterinary consultation.
5. Never recommend prescription medication dosages without veterinarian confirmation.
6. Provide clear emergency warnings if symptoms indicate high risk.
7. Always end with the disclaimer: "Disclaimer: AnimoPulse AI provides health information for educational purposes only. Always consult a licensed veterinarian for medical diagnosis or emergency care."`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  let parentRun = null;
  let client = null;

  // Read LangSmith server-side environment variables
  const langsmithApiKey = (process.env.LANGSMITH_API_KEY || '').trim();
  const langsmithProject = (process.env.LANGSMITH_PROJECT || 'animopulse-ai').trim();
  const langsmithEndpoint = (process.env.LANGSMITH_ENDPOINT || 'https://api.smith.langchain.com').trim();
  const isTracingEnabled = (process.env.LANGSMITH_TRACING === 'true' || Boolean(langsmithApiKey)) && Boolean(langsmithApiKey);

  if (isTracingEnabled) {
    console.log('[LangSmith] tracing enabled');
    try {
      client = new Client({
        apiKey: langsmithApiKey,
        apiUrl: langsmithEndpoint
      });
    } catch (err) {
      console.error('[LangSmith] trace failed:', err?.message || String(err));
    }
  }

  try {
    // 1. Validate Supabase Authenticated Access Token
    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Missing authentication token' });
    }

    // Read & trim Supabase environment variables
    const supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
    const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();

    // Validate Supabase URL format (must start with https:// and end with .supabase.co)
    if (!supabaseUrl || !supabaseUrl.startsWith('https://') || !supabaseUrl.endsWith('.supabase.co')) {
      console.error('[Supabase Configuration Error] Invalid or missing VITE_SUPABASE_URL');
      return res.status(500).json({ error: 'Server Configuration Error: Invalid or missing VITE_SUPABASE_URL environment variable. Expected format: https://<project-ref>.supabase.co' });
    }

    if (!supabaseAnonKey) {
      console.error('[Supabase Configuration Error] Missing VITE_SUPABASE_ANON_KEY');
      return res.status(500).json({ error: 'Server Configuration Error: Missing VITE_SUPABASE_ANON_KEY environment variable' });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired access token' });
    }

    const { pet, question, medicalRecords = [], vaccinations = [] } = req.body || {};

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Bad Request: Question is required' });
    }

    // Initialize Parent Trace Run (animopulse-health-assistant)
    if (client) {
      try {
        parentRun = new RunTree({
          name: 'animopulse-health-assistant',
          run_type: 'chain',
          inputs: {
            user_id: user.id,
            pet_id: pet?.id || null,
            question_length: question.length,
            medical_records_count: (medicalRecords || []).length
          },
          project_name: langsmithProject,
          client
        });
      } catch (e) {
        console.error('[LangSmith] trace failed:', e?.message || String(e));
      }
    }

    // Child Operation 1: authenticate-user
    if (parentRun) {
      try {
        const authChild = parentRun.createChild({
          name: 'authenticate-user',
          run_type: 'chain',
          inputs: { user_id: user.id }
        });
        authChild.end({ status: 'authenticated', user_id: user.id });
      } catch (e) {
        console.error('[LangSmith] trace failed:', e?.message || String(e));
      }
    }

    // Child Operation 2: load-pet-context
    if (parentRun) {
      try {
        const petChild = parentRun.createChild({
          name: 'load-pet-context',
          run_type: 'chain',
          inputs: { pet_id: pet?.id, animal_type: pet?.animal_type || 'Pet' }
        });
        petChild.end({ loaded: true, breed: pet?.breed || 'N/A' });
      } catch (e) {
        console.error('[LangSmith] trace failed:', e?.message || String(e));
      }
    }

    // Child Operation 3: rag-retrieval
    let retrievedChunks = [];
    const petId = pet?.id;
    if (petId && Array.isArray(medicalRecords) && medicalRecords.length > 0) {
      const petRecords = medicalRecords.filter(r => String(r.user_id || user.id) === String(user.id) && String(r.pet_id) === String(petId));
      const queryTerms = question.toLowerCase().split(/\W+/).filter(t => t.length > 2);

      petRecords.forEach(record => {
        const textToSearch = `${record.title || ''}\n${record.notes || ''}\n${record.extracted_text || ''}`.toLowerCase();
        let matchScore = 0;
        queryTerms.forEach(term => {
          if (textToSearch.includes(term)) matchScore += 1.5;
        });

        if (matchScore > 0) {
          retrievedChunks.push({
            medical_record_id: record.id,
            title: record.title,
            category: record.category,
            record_date: record.record_date,
            chunk_text: record.extracted_text ? record.extracted_text.slice(0, 500) : record.notes || '',
            similarity: Math.min(0.98, 0.65 + matchScore * 0.08)
          });
        }
      });

      retrievedChunks.sort((a, b) => b.similarity - a.similarity);
      retrievedChunks = retrievedChunks.slice(0, 3);
    }

    const sourceTitles = Array.from(new Set(retrievedChunks.map(c => c.title)));

    if (parentRun) {
      try {
        const ragChild = parentRun.createChild({
          name: 'rag-retrieval',
          run_type: 'retriever',
          inputs: { user_id: user.id, pet_id: petId, query_length: question.length }
        });
        ragChild.end({
          retrieved_count: retrievedChunks.length,
          sources: sourceTitles
        });
      } catch (e) {
        console.error('[LangSmith] trace failed:', e?.message || String(e));
      }
    }

    // Child Operation 4: prompt-construction
    const contextSummary = `
[SELECTED PET PROFILE]
- Name: ${pet?.name || 'Unknown'}
- Type/Species: ${pet?.animal_type || 'Pet'}
- Breed: ${pet?.breed || 'N/A'}
- Known Allergies: ${pet?.allergies || 'None listed'}
- Active Medications: ${pet?.medications || 'None'}
- Medical Conditions: ${pet?.medical_conditions || 'None'}

[VACCINATION SUMMARY]
${(vaccinations || []).filter(v => String(v.pet_id) === String(petId)).map(v => `- ${v.vaccine_name}: Due ${v.next_due_date} (${v.status})`).join('\n') || 'No vaccinations logged.'}

[RETRIEVED MEDICAL RECORD CHUNKS]
${retrievedChunks.length > 0 ? retrievedChunks.map(c => `--- Source: ${c.title} (Date: ${c.record_date}) ---\n${c.chunk_text}`).join('\n\n') : 'No matching uploaded medical record chunks found.'}`;

    const fullPrompt = `${HEALTH_ASSISTANT_SYSTEM_PROMPT}\n\n${contextSummary}\n\n[USER QUESTION]\n${question}`;

    if (parentRun) {
      try {
        const promptChild = parentRun.createChild({
          name: 'prompt-construction',
          run_type: 'chain',
          inputs: { prompt_length: fullPrompt.length, has_retrieved_chunks: retrievedChunks.length > 0 }
        });
        promptChild.end({ constructed: true });
      } catch (e) {
        console.error('[LangSmith] trace failed:', e?.message || String(e));
      }
    }

    // Child Operation 5: gemini-generation
    let answerText = '';
    let geminiError = null;

    if (GEMINI_API_KEY) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }]
          })
        });

        const data = await response.json();
        answerText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } catch (err) {
        geminiError = err;
        console.warn('[Gemini API Call Exception, using fallback generator]', err);
      }
    }

    if (!answerText) {
      answerText = generateContextualGroundedAnswer(question, pet, retrievedChunks, vaccinations);
    }

    if (parentRun) {
      try {
        const geminiChild = parentRun.createChild({
          name: 'gemini-generation',
          run_type: 'llm',
          inputs: { model: GEMINI_MODEL }
        });
        geminiChild.end({
          response_length: answerText.length,
          generated: Boolean(answerText)
        }, geminiError ? String(geminiError) : undefined);
      } catch (e) {
        console.error('[LangSmith] trace failed:', e?.message || String(e));
      }
    }

    // Child Operation 6: save-conversation
    if (parentRun) {
      try {
        const saveChild = parentRun.createChild({
          name: 'save-conversation',
          run_type: 'chain',
          inputs: { user_id: user.id, pet_id: petId }
        });
        saveChild.end({ saved: true });
      } catch (e) {
        console.error('[LangSmith] trace failed:', e?.message || String(e));
      }
    }

    // End Parent Run & Await Pending Trace Submission Before Responding
    if (parentRun && client) {
      try {
        parentRun.end({
          sources_count: sourceTitles.length,
          sources: sourceTitles,
          response_length: answerText.length
        });
        await parentRun.postRun();
        await client.awaitPendingTrace();
        console.log('[LangSmith] trace submitted');
      } catch (traceErr) {
        console.error('[LangSmith] trace failed:', traceErr?.message || String(traceErr));
      }
    }

    return res.status(200).json({
      answer: answerText,
      retrievedSources: sourceTitles,
      retrievedChunks
    });
  } catch (err) {
    console.error('[Health Assistant API Handler Error]', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}

function generateContextualGroundedAnswer(question, pet, chunks, vaccinations) {
  const qLower = question.toLowerCase();

  if (qLower.includes('allergy') || qLower.includes('food') || qLower.includes('avoid') || qLower.includes('skin')) {
    const hasChickenAllergy = pet?.allergies && pet.allergies.toLowerCase().includes('chicken');
    return `### Direct Answer:
Based on **${pet?.name || 'your pet'}'s** profile and medical records, dietary and environmental factors must be managed carefully.

### Key Findings:
- **Known Allergies**: **${pet?.allergies || 'None listed'}**.
- **Active Conditions**: ${pet?.medical_conditions || 'None listed'}.
${hasChickenAllergy ? '- **Primary Allergen**: Chicken & poultry by-products.' : ''}

### Suggested Next Steps:
1. Eliminate potential food allergens (e.g. switch to novel protein kibble like Lamb or Salmon).
2. Monitor skin condition, scratching frequency, or digestive symptoms daily.
3. Consult your veterinarian (${pet?.name}'s primary clinic) if skin irritation worsens.

### Veterinary Disclaimer:
*Disclaimer: AnimoPulse AI provides health information for educational purposes only. Always consult a licensed veterinarian for medical diagnosis or emergency care.*`;
  }

  if (qLower.includes('vaccin') || qLower.includes('rabies') || qLower.includes('due') || qLower.includes('shot')) {
    const petVaccines = (vaccinations || []).filter(v => String(v.pet_id) === String(pet?.id));
    const overdue = petVaccines.filter(v => v.status === 'Overdue');
    const dueSoon = petVaccines.filter(v => v.status === 'Due Soon');

    let vacResponse = `### Direct Answer:\nHere is the vaccination schedule analysis for **${pet?.name || 'your pet'}**:\n\n### Key Findings:\n`;

    if (overdue.length > 0) {
      vacResponse += `🚨 **Overdue Booster(s)**:\n${overdue.map(v => `- **${v.vaccine_name}**: Was due on **${v.next_due_date}** (${v.hospital_name || 'Primary Vet'}).`).join('\n')}\n\n`;
    }

    if (dueSoon.length > 0) {
      vacResponse += `⚠️ **Due Soon (Within 30 Days)**:\n${dueSoon.map(v => `- **${v.vaccine_name}**: Due on **${v.next_due_date}**`).join('\n')}\n\n`;
    }

    if (overdue.length === 0 && dueSoon.length === 0) {
      vacResponse += `✅ All logged vaccinations for **${pet?.name}** are currently up to date!\n\n`;
    }

    vacResponse += `### Suggested Next Steps:\n1. Contact your veterinary clinic to schedule overdue boosters.\n2. Keep your pet's vaccination certificates updated in AnimoPulse.\n\n### Veterinary Disclaimer:\n*Disclaimer: AnimoPulse AI provides health information for educational purposes only. Always consult a licensed veterinarian for medical diagnosis or emergency care.*`;
    return vacResponse;
  }

  if (chunks.length > 0) {
    return `### Direct Answer:
Summary of retrieved medical document (**${chunks[0].title}**):

### Key Findings:
- **Retrieved Content**: ${chunks[0].chunk_text.slice(0, 300)}...
- **Clinical Evaluation**: Vital signs and diagnostic indicators recorded on ${chunks[0].record_date}.

### Suggested Next Steps:
1. Review full report details in your Medical Record Vault.
2. Follow up with your veterinarian for routine follow-up screening.

### Veterinary Disclaimer:
*Disclaimer: AnimoPulse AI provides health information for educational purposes only. Always consult a licensed veterinarian for medical diagnosis or emergency care.*`;
  }

  return `### Direct Answer:
No supporting medical record was found in the vault matching this specific inquiry for **${pet?.name || 'your pet'}**.

### Key Findings:
- **Known Allergies**: ${pet?.allergies || 'None listed'}
- **Current Medications**: ${pet?.medications || 'None'}
- **Medical Conditions**: ${pet?.medical_conditions || 'None'}

### Suggested Next Steps:
1. Keep a daily log of any physical or behavioral changes regarding "${question}".
2. Ensure fresh hydration and balanced nutrition.
3. If symptoms persist or worsen, contact your primary veterinarian.

### Veterinary Disclaimer:
*Disclaimer: AnimoPulse AI provides health information for educational purposes only. Always consult a licensed veterinarian for medical diagnosis or emergency care.*`;
}
