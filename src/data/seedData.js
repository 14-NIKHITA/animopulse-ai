// AnimoPulse Initial Seed Data (Includes Section 16 Demo Data)

export const initialUser = {
  id: "demo-user-123",
  full_name: "Alex Morgan",
  email: "alex.morgan@animopulse.org",
  phone: "+1 (555) 382-9102",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  notification_preferences: {
    email: true,
    sms: true,
    vaccine_reminders: true,
    emergency_alerts: true
  },
  emergency_contacts: [
    { name: "Dr. Sarah Jenkins (Primary Vet)", phone: "+1 (555) 902-1144", role: "Veterinarian" },
    { name: "City Animal Emergency 24/7", phone: "+1 (555) 911-PETS", role: "Emergency ER" },
    { name: "Pawsitive Rescue NGO", phone: "+1 (555) 482-1920", role: "Animal Shelter" }
  ]
};

export const initialPets = [
  {
    id: "pet-bruno-1",
    user_id: "demo-user-123",
    name: "Bruno",
    animal_type: "Dog",
    breed: "Labrador Retriever",
    date_of_birth: "2023-04-12",
    gender: "Male",
    weight: 28,
    colour: "Yellow / Golden",
    allergies: "Chicken, Poultry protein",
    medications: "None",
    medical_conditions: "Mild recurring skin irritation (Dermatitis)",
    microchip_number: "985141002948123",
    notes: "Bruno has a chicken allergy and mild recurring skin irritation. The veterinarian recommended avoiding chicken-based food.",
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80",
    created_at: "2025-01-15T08:00:00Z"
  },
  {
    id: "pet-luna-2",
    user_id: "demo-user-123",
    name: "Luna",
    animal_type: "Cat",
    breed: "Persian",
    date_of_birth: "2024-02-18",
    gender: "Female",
    weight: 4.2,
    colour: "White / Silver",
    allergies: "Dairy products",
    medications: "L-Lysine Supplement (250mg daily)",
    medical_conditions: "Sensitive stomach",
    microchip_number: "985141009821455",
    notes: "Requires daily grooming. Prefers wet food formulated for indoor cats.",
    image_url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
    created_at: "2025-02-01T10:30:00Z"
  },
  {
    id: "pet-barnaby-3",
    user_id: "demo-user-123",
    name: "Barnaby",
    animal_type: "Dog (Rescue)",
    breed: "Beagle Mix",
    date_of_birth: "2024-08-05",
    gender: "Male",
    weight: 12.5,
    colour: "Tricolor (Brown/Black/White)",
    allergies: "Flea bite sensitivity",
    medications: "Bravecto (Quarterly flea & tick chewable)",
    medical_conditions: "Rescued stray - recovered leg laceration",
    microchip_number: "985141004492102",
    notes: "Adopted from City Animal Rescue Shelter. Friendly with other dogs.",
    image_url: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80",
    created_at: "2025-05-20T14:15:00Z"
  }
];

export const initialVaccinations = [
  {
    id: "vac-bruno-1",
    user_id: "demo-user-123",
    pet_id: "pet-bruno-1",
    vaccine_name: "Rabies Booster",
    last_vaccination_date: "2025-07-10",
    next_due_date: "2026-07-10", // Past date relative to July 29, 2026 -> OVERDUE!
    veterinarian_name: "Dr. Sarah Jenkins",
    hospital_name: "Metro Pet Healthcare Center",
    status: "Overdue",
    notes: "Annual rabies mandate. Overdue - schedule appointment immediately."
  },
  {
    id: "vac-bruno-2",
    user_id: "demo-user-123",
    pet_id: "pet-bruno-1",
    vaccine_name: "DHPP (Distemper, Hepatitis, Parvovirus)",
    last_vaccination_date: "2025-08-15",
    next_due_date: "2026-08-15", // Due in ~17 days -> DUE SOON!
    veterinarian_name: "Dr. Sarah Jenkins",
    hospital_name: "Metro Pet Healthcare Center",
    status: "Due Soon",
    notes: "Core 3-in-1 combination vaccine."
  },
  {
    id: "vac-luna-1",
    user_id: "demo-user-123",
    pet_id: "pet-luna-2",
    vaccine_name: "FVRCP (Feline Viral Rhinotracheitis)",
    last_vaccination_date: "2025-11-20",
    next_due_date: "2026-11-20", // >30 days away -> UPCOMING
    veterinarian_name: "Dr. Marcus Vance",
    hospital_name: "Feline Wellness Care",
    status: "Upcoming",
    notes: "Standard feline core booster."
  },
  {
    id: "vac-barnaby-1",
    user_id: "demo-user-123",
    pet_id: "pet-barnaby-3",
    vaccine_name: "Bordetella (Kennel Cough)",
    last_vaccination_date: "2026-03-01",
    next_due_date: "2027-03-01",
    veterinarian_name: "Dr. Sarah Jenkins",
    hospital_name: "City Rescue Vet Clinic",
    status: "Completed",
    notes: "Administered intranasally during rescue intake."
  }
];

export const initialMedicalRecords = [
  {
    id: "rec-bruno-1",
    user_id: "demo-user-123",
    pet_id: "pet-bruno-1",
    title: "Dermatology & Food Allergy Report",
    category: "General checkup",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_path: "demo-user-123/pet-bruno-1/dermatology_report.pdf",
    file_type: "pdf",
    veterinarian_name: "Dr. Sarah Jenkins, DVM",
    hospital_name: "Metro Pet Healthcare Center",
    record_date: "2025-07-10",
    notes: "Bruno has a chicken allergy and mild recurring skin irritation. The veterinarian recommended avoiding chicken-based food.",
    extracted_text: `PATIENT CLINICAL SUMMARY:
Patient: Bruno (Labrador Retriever, Male, 28kg)
Date of Exam: July 10, 2025
Attending Vet: Dr. Sarah Jenkins, DVM

CHIEF COMPLAINT: Recurring skin erythema and scratching around flanks and paws.

EXAMINATION FINDINGS:
Mild dermatitis noted on abdominal area and paw webbing. Skin cytology negative for yeast or bacterial infection.

DIAGNOSIS & ASSESSMENT:
Cutaneous adverse food reaction (Food Allergy). Cytology confirms non-infectious allergic response triggered by dietary poultry protein.

RECOMMENDED TREATMENT PLAN:
1. Strict Elimination Diet: Complete removal of all chicken, turkey, and poultry byproducts.
2. Hydrolyzed protein or novel protein kibble (Salmon or Lamb recipe).
3. Omega-3 Fatty Acid supplementation (1000mg fish oil daily).
4. Topical soothe wipes for active flare-ups.`,
    ai_summary: "Bruno (Labrador, 28kg) diagnosed with food allergy dermatitis. Strictly avoid chicken and poultry protein. Switch to salmon/lamb novel protein diet and supplement with Omega-3 fish oil.",
    processing_status: "Completed",
    created_at: "2025-07-10T11:00:00Z"
  },
  {
    id: "rec-bruno-2",
    user_id: "demo-user-123",
    pet_id: "pet-bruno-1",
    title: "Annual Comprehensive Blood Panel",
    category: "Blood report",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_path: "demo-user-123/pet-bruno-1/bloodwork_2025.pdf",
    file_type: "pdf",
    veterinarian_name: "Dr. Sarah Jenkins, DVM",
    hospital_name: "Metro Pet Healthcare Center",
    record_date: "2025-08-15",
    notes: "Complete CBC & Chemistry Panel. All liver and kidney markers within optimal range.",
    extracted_text: `LABORATORY ANALYSIS REPORT:
Patient: Bruno | Specimen: Canine Blood
CBC RESULTS:
RBC: 7.2 M/uL (Normal: 5.5 - 8.5)
WBC: 9.1 K/uL (Normal: 6.0 - 17.0)
Platelets: 285 K/uL (Normal: 200 - 500)

CHEMISTRY PANEL:
ALT (Liver): 32 U/L (Normal: 10 - 125)
BUN (Kidney): 18 mg/dL (Normal: 7 - 27)
Creatinine: 1.1 mg/dL (Normal: 0.5 - 1.8)
Glucose: 94 mg/dL (Normal: 70 - 138)

CONCLUSION: Normal healthy baseline panel. No systemic inflammation detected.`,
    ai_summary: "Comprehensive blood panel results for Bruno are normal across CBC, Liver (ALT 32 U/L), and Kidney function (BUN 18 mg/dL). Baseline is healthy.",
    processing_status: "Completed",
    created_at: "2025-08-15T16:30:00Z"
  }
];

export const initialAiConversations = [
  {
    id: "conv-1",
    user_id: "demo-user-123",
    pet_id: "pet-bruno-1",
    title: "Bruno's Chicken Allergy & Dietary Guidelines",
    created_at: "2026-07-28T09:15:00Z",
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "What allergy is mentioned in Bruno's medical report and what food should I avoid?",
        created_at: "2026-07-28T09:15:00Z"
      },
      {
        id: "msg-2",
        role: "assistant",
        content: `Based on Bruno's **Dermatology & Food Allergy Report** from July 10, 2025:

### 🔍 Key Findings:
- **Allergy Identified**: Cutaneous adverse food reaction specifically triggered by **Chicken and poultry protein**.
- **Symptoms**: Mild recurring skin irritation (dermatitis) around the flanks and paws.

### 🚫 Foods & Ingredients to Strictly Avoid:
1. Chicken meat, chicken meal, or poultry byproducts.
2. Turkey, duck, and poultry fat preservatives.
3. Treats or dental chews containing natural chicken flavorings.

### 💡 Veterinarian Recommendations:
- Switch to a novel protein diet such as **Salmon, Lamb, or Whitefish**.
- Add **Omega-3 Fish Oil** (1000mg daily) to support skin barrier repair.

> ⚠️ *Disclaimer: This guidance is for informational and first-aid support only. Consult a qualified veterinarian for diagnosis and treatment.*`,
        retrieved_sources: ["Dermatology & Food Allergy Report (2025-07-10)"],
        created_at: "2026-07-28T09:15:05Z"
      }
    ]
  }
];

export const initialEmergencySessions = [
  {
    id: "emg-1",
    user_id: "demo-user-123",
    pet_id: "pet-barnaby-3",
    animal_type: "Dog",
    emergency_type: "Wound / Laceration",
    user_description: "Deep cut on left paw after stepping on sharp debris during walk.",
    triage_answers: {
      is_conscious: true,
      is_breathing: true,
      severe_bleeding: false,
      hit_by_vehicle: false,
      poisoning_suspected: false,
      seizures: false,
      unable_to_stand: false
    },
    urgency_level: "Moderate",
    ai_guidance: {
      immediate_steps: [
        "Apply gentle direct pressure using a clean towel or sterile gauze for 3-5 minutes.",
        "Keep the dog calm and restrict running or jumping.",
        "Inspect paw pads carefully without forcing or probing inside the wound."
      ],
      actions_to_avoid: [
        "Do NOT apply hydrogen peroxide or rubbing alcohol into deep tissue cuts.",
        "Do NOT tie a tight tourniquet around the leg.",
        "Do NOT allow the dog to lick or bite at the open cut."
      ],
      warning_signs: [
        "Pulsatile or dark red blood soaking through bandages rapidly.",
        "Paws turning cold, pale, or blue."
      ]
    },
    created_at: "2026-07-20T18:40:00Z"
  }
];

export const initialRescueServices = [
  {
    id: "svc-1",
    name: "Metro Emergency Veterinary Hospital 24/7",
    service_type: "Veterinary Hospital",
    address: "742 Medical Center Blvd, Metro City",
    city: "Metro City",
    latitude: 37.7749,
    longitude: -122.4194,
    phone: "+1 (555) 911-7387",
    email: "emergency@metrovethospital.org",
    website: "https://metrovethospital.org",
    open_24_hours: true,
    distance_miles: "1.2 miles",
    verified: true
  },
  {
    id: "svc-2",
    name: "City Paws Animal Rescue Shelter & Clinic",
    service_type: "Animal Shelter",
    address: "109 Shelter Lane, Metro City",
    city: "Metro City",
    latitude: 37.7833,
    longitude: -122.4167,
    phone: "+1 (555) 482-1920",
    email: "adopt@citypawsrescue.org",
    website: "https://citypawsrescue.org",
    open_24_hours: false,
    distance_miles: "2.8 miles",
    verified: true
  },
  {
    id: "svc-3",
    name: "WildLife Care & Rehabilitation NGO",
    service_type: "Wildlife Rescue",
    address: "450 Forest Reserve Rd, Metro City",
    city: "Metro City",
    latitude: 37.7650,
    longitude: -122.4400,
    phone: "+1 (555) 777-WILD",
    email: "help@wildlifecare.org",
    website: "https://wildlifecare.org",
    open_24_hours: true,
    distance_miles: "4.5 miles",
    verified: true
  },
  {
    id: "svc-4",
    name: "Stray Hope Mobile Rescue & First Aid Unit",
    service_type: "Rescue NGO",
    address: "88 Community Way, Metro City",
    city: "Metro City",
    latitude: 37.7500,
    longitude: -122.4100,
    phone: "+1 (555) 303-HOPE",
    email: "info@strayhope.org",
    website: "https://strayhope.org",
    open_24_hours: true,
    distance_miles: "3.1 miles",
    verified: true
  }
];
