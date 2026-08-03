/**
 * AnimoPulse Secure Frontend AI Bridge Module
 * Calls serverless API endpoints (/api/health-assistant & /api/emergency-triage).
 * No secret keys (GEMINI_API_KEY, LANGSMITH_API_KEY) are exposed to client bundle.
 * Authenticates all calls via Supabase Bearer JWT Token.
 */

import { supabase } from './supabase';
import { searchRelevantChunks } from './rag';

export const HEALTH_ASSISTANT_SYSTEM_PROMPT = `You are AnimoPulse AI Health Assistant, a specialized animal health information assistant.
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

export const EMERGENCY_ASSISTANT_SYSTEM_PROMPT = `You are AnimoPulse Emergency Animal First-Aid Assistant.
Guidelines:
1. Prioritize immediate life safety and calm, step-by-step guidance.
2. Classify urgency into one of four levels: Low, Moderate, High, or Critical.
3. NEVER advise users to perform dangerous invasive medical procedures.
4. NEVER provide medication dosages without veterinarian confirmation.
5. NEVER encourage inducing vomiting unless explicitly instructed by a poison-control professional or veterinarian.
6. Provide clear actions to avoid.
7. Always emphasize seeking immediate emergency veterinary care for critical cases.
8. Keep instructions concise, bulleted, and easy to read during a crisis.`;

/**
 * Health Assistant Query Handler
 * Securely calls /api/health-assistant with Bearer auth token
 */
export async function askPetHealthAssistant({
  pet,
  question,
  medicalRecords = [],
  vaccinations = [],
  userId = 'anonymous'
}) {
  // 1. Perform client RAG check for sources display
  const retrievedChunks = searchRelevantChunks(question, pet?.id, medicalRecords, 3, userId);
  const sourceTitles = Array.from(new Set(retrievedChunks.map(c => c.title)));

  // 2. Fetch Supabase Session Token
  let token = '';
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token || '';
  } catch (err) {
    console.warn('[Auth Token Fetch Warning]', err);
  }

  // 3. Call Serverless API Endpoint if authenticated
  if (token) {
    try {
      const response = await fetch('/api/health-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pet,
          question,
          medicalRecords,
          vaccinations
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          answer: data.answer,
          retrievedSources: data.retrievedSources || sourceTitles,
          retrievedChunks: data.retrievedChunks || retrievedChunks
        };
      }
    } catch (err) {
      console.warn('[Serverless API /api/health-assistant Warning, using local fallback]', err);
    }
  }

  // 4. Local Grounded Contextual Fallback Engine
  const answerText = generateContextualGroundedAnswer(question, pet, retrievedChunks, vaccinations);

  return {
    answer: answerText,
    retrievedSources: sourceTitles,
    retrievedChunks
  };
}

/**
 * Emergency First-Aid Triage Assistant
 * Securely calls /api/emergency-triage with Bearer auth token
 */
export async function classifyAndGuideEmergency({
  animalType = 'Dog',
  isStray = false,
  emergencyType = 'Wound',
  userDescription = '',
  triageAnswers = {},
  userId = 'anonymous',
  petId = null
}) {
  // 1. Fetch Supabase Session Token
  let token = '';
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token || '';
  } catch (err) {
    console.warn('[Auth Token Fetch Warning]', err);
  }

  // 2. Call Serverless API Endpoint if authenticated
  if (token) {
    try {
      const response = await fetch('/api/emergency-triage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          animalType,
          isStray,
          emergencyType,
          userDescription,
          triageAnswers,
          petId
        })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('[Serverless API /api/emergency-triage Warning, using local fallback]', err);
    }
  }

  // 3. Local Emergency Matrix Fallback Engine
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

  return generateEmergencyMatrixGuidance(emergencyType, userDescription, triageAnswers, urgencyLevel);
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
    medicalDisclaimer: "This emergency first-aid guidance is for immediate stabilization only. Transport the animal to an emergency veterinary hospital immediately."
  };
}
