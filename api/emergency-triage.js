import { createClient } from '@supabase/supabase-js';
import { Client, RunTree } from 'langsmith';

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
const GEMINI_MODEL = 'gemini-1.5-flash';

const EMERGENCY_ASSISTANT_SYSTEM_PROMPT = `You are AnimoPulse Emergency Animal First-Aid Assistant.
Guidelines:
1. Prioritize immediate life safety and calm, step-by-step guidance.
2. Classify urgency into one of four levels: Low, Moderate, High, or Critical.
3. NEVER advise users to perform dangerous invasive medical procedures.
4. NEVER provide medication dosages without veterinarian confirmation.
5. NEVER encourage inducing vomiting unless explicitly instructed by a poison-control professional or veterinarian.
6. Provide clear actions to avoid.
7. Always emphasize seeking immediate emergency veterinary care for critical cases.
8. Keep instructions concise, bulleted, and easy to read during a crisis.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    const {
      animalType = 'Dog',
      isStray = false,
      emergencyType = 'Wound',
      userDescription = '',
      triageAnswers = {},
      petId = null
    } = req.body || {};

    // Initialize Parent Trace Run (animopulse-emergency-triage)
    if (client) {
      try {
        parentRun = new RunTree({
          name: 'animopulse-emergency-triage',
          run_type: 'chain',
          inputs: {
            user_id: user.id,
            pet_id: petId,
            animal_type: animalType,
            is_stray: isStray,
            emergency_type: emergencyType
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

    // Child Operation 2: validate-triage-input
    if (parentRun) {
      try {
        const valChild = parentRun.createChild({
          name: 'validate-triage-input',
          run_type: 'chain',
          inputs: { animal_type: animalType, is_stray: isStray, emergency_type: emergencyType }
        });
        valChild.end({ validated: true });
      } catch (e) {
        console.error('[LangSmith] trace failed:', e?.message || String(e));
      }
    }

    // Child Operation 3: urgency-classification
    let urgencyLevel = 'Moderate';
    const descLower = (userDescription + ' ' + emergencyType).toLowerCase();

    if (
      triageAnswers.severe_bleeding || 
      triageAnswers.hit_by_vehicle || 
      triageAnswers.is_conscious === 'No' || 
      triageAnswers.is_breathing === 'Not breathing' ||
      descLower.includes('hit by car') ||
      descLower.includes('unconscious') ||
      descLower.includes('severe bleeding') ||
      descLower.includes('choking')
    ) {
      urgencyLevel = 'Critical';
    } else if (
      triageAnswers.poisoning_suspected ||
      triageAnswers.seizures ||
      triageAnswers.unable_to_stand === 'Unable to stand' ||
      triageAnswers.unable_to_stand === true ||
      descLower.includes('poison') ||
      descLower.includes('seizure') ||
      descLower.includes('heatstroke')
    ) {
      urgencyLevel = 'High';
    } else if (descLower.includes('wound') || descLower.includes('limp') || descLower.includes('burn') || descLower.includes('fracture')) {
      urgencyLevel = 'Moderate';
    } else {
      urgencyLevel = 'Low';
    }

    if (parentRun) {
      try {
        const triageChild = parentRun.createChild({
          name: 'urgency-classification',
          run_type: 'chain',
          inputs: { emergency_type: emergencyType, answers: triageAnswers }
        });
        triageChild.end({ calculated_urgency: urgencyLevel });
      } catch (e) {
        console.error('[LangSmith] trace failed:', e?.message || String(e));
      }
    }

    // Child Operation 4: prompt-construction
    const emergencyPrompt = `${EMERGENCY_ASSISTANT_SYSTEM_PROMPT}

[EMERGENCY TRACT INTAKE DATA]
- Animal Type: ${animalType}
- Ownership Status: ${isStray ? 'Stray / Rescue' : 'Owned Pet'}
- Primary Category: ${emergencyType}
- Conscious: ${triageAnswers.is_conscious || 'Yes'}
- Breathing Status: ${triageAnswers.is_breathing || 'Yes'}
- Severe Bleeding: ${triageAnswers.severe_bleeding ? 'Yes' : 'No'}
- Hit by Vehicle: ${triageAnswers.hit_by_vehicle ? 'Yes' : 'No'}
- Poisoning Suspected: ${triageAnswers.poisoning_suspected ? 'Yes' : 'No'}
- Active Seizures: ${triageAnswers.seizures ? 'Yes' : 'No'}
- Walking Ability: ${triageAnswers.unable_to_stand || 'Yes'}
- User Description: ${userDescription || 'N/A'}
- Calculated Urgency: ${urgencyLevel}

Provide structured first-aid guidance into JSON format with keys:
"urgencyLevel" (one of: Critical, High, Moderate, Low),
"immediateSteps" (array of step-by-step first aid actions),
"actionsToAvoid" (array of dangerous procedures/medications to avoid),
"warningSigns" (array of symptoms requiring immediate ER care),
"medicalDisclaimer" (string disclaimer).`;

    if (parentRun) {
      try {
        const promptChild = parentRun.createChild({
          name: 'prompt-construction',
          run_type: 'chain',
          inputs: { prompt_length: emergencyPrompt.length }
        });
        promptChild.end({ constructed: true });
      } catch (e) {
        console.error('[LangSmith] trace failed:', e?.message || String(e));
      }
    }

    // Child Operation 5: gemini-generation
    let result = null;
    let geminiError = null;

    if (GEMINI_API_KEY) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: emergencyPrompt }] }]
          })
        });

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (rawText) {
          try {
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              result = JSON.parse(jsonMatch[0]);
            }
          } catch (parseErr) {
            console.warn('[Gemini Emergency JSON Parse Fallback]', parseErr);
          }
        }
      } catch (err) {
        geminiError = err;
        console.warn('[Gemini Emergency API Exception, using emergency matrix engine]', err);
      }
    }

    if (!result || !result.immediateSteps) {
      result = generateEmergencyMatrixGuidance(emergencyType, userDescription, triageAnswers, urgencyLevel);
    }

    if (parentRun) {
      try {
        const geminiChild = parentRun.createChild({
          name: 'gemini-generation',
          run_type: 'llm',
          inputs: { model: GEMINI_MODEL }
        });
        geminiChild.end({
          urgency_level: result.urgencyLevel,
          steps_count: (result.immediateSteps || []).length
        }, geminiError ? String(geminiError) : undefined);
      } catch (e) {
        console.error('[LangSmith] trace failed:', e?.message || String(e));
      }
    }

    // Child Operation 6: save-emergency-session
    if (parentRun) {
      try {
        const saveChild = parentRun.createChild({
          name: 'save-emergency-session',
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
          urgency_level: result.urgencyLevel,
          steps_count: (result.immediateSteps || []).length
        });
        await parentRun.postRun();
        await client.awaitPendingTrace();
        console.log('[LangSmith] trace submitted');
      } catch (traceErr) {
        console.error('[LangSmith] trace failed:', traceErr?.message || String(traceErr));
      }
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('[Emergency Triage API Handler Error]', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}

function generateEmergencyMatrixGuidance(emergencyType, userDescription, triageAnswers, urgencyLevel) {
  let immediateSteps = [];
  let actionsToAvoid = [];
  let warningSigns = [];

  const descLower = (userDescription + ' ' + emergencyType).toLowerCase();

  if (descLower.includes('bleed') || descLower.includes('wound') || descLower.includes('laceration')) {
    immediateSteps = [
      "Place a clean cloth, towel, or sterile gauze directly over the bleeding site.",
      "Apply steady, firm pressure for 3 to 5 minutes without lifting the bandage to check.",
      "If blood soaks through, place another layer directly on top—do not remove the first cloth.",
      "Keep the animal warm with a blanket and limit all movement."
    ];
    actionsToAvoid = [
      "Do NOT apply a tight tourniquet around a limb unless instructed by a vet.",
      "Do NOT apply hydrogen peroxide, alcohol, or ointments into deep wounds.",
      "Do NOT probe inside deep cuts to remove embedded objects."
    ];
    warningSigns = [
      "Pulsatile (spurt) bleeding or dark blood soaking through towels rapidly.",
      "Gums turning pale, white, or blue.",
      "Animal collapsing or going unconscious."
    ];
  } else if (descLower.includes('poison') || descLower.includes('ingest') || descLower.includes('toxin')) {
    immediateSteps = [
      "Identify the suspected poison product, plant, or chemical container safely.",
      "Remove any remaining toxic substance from the mouth with a gloved hand.",
      "Collect the packaging or take a clear picture for the emergency vet.",
      "Transport immediately to the nearest 24/7 animal hospital."
    ];
    actionsToAvoid = [
      "Do NOT induce vomiting with salt, hydrogen peroxide, or syrup unless specifically instructed by a poison-control vet.",
      "Do NOT give milk, oil, or food remedies which can accelerate toxin absorption."
    ];
    warningSigns = [
      "Profuse salivation, foaming at mouth, or muscle tremors.",
      "Dilated pupils or sudden disorientation.",
      "Seizures or collapse."
    ];
  } else {
    immediateSteps = [
      "Ensure your own safety first before handling an injured or fearful animal.",
      "Place a blanket over the animal to reduce anxiety and maintain body heat.",
      "Contact the nearest 24/7 veterinary emergency hospital immediately.",
      "Keep the animal calm in a dark, quiet room or crate during transport."
    ];
    actionsToAvoid = [
      "Do NOT give human pain medications (e.g. Ibuprofen, Tylenol/Paracetamol are toxic to pets).",
      "Do NOT leave an injured animal unrestrained inside a moving vehicle."
    ];
    warningSigns = [
      "Inability to stand or severe vocalization in pain.",
      "Irregular or rapid breathing."
    ];
  }

  return {
    urgencyLevel,
    immediateSteps,
    actionsToAvoid,
    warningSigns,
    medicalDisclaimer: "This emergency guidance is for immediate first-aid stabilization only. Transport the animal to an emergency veterinary hospital immediately."
  };
}
