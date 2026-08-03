# AnimoPulse 🐾 — AI Pet Healthcare & Animal Rescue Platform

AnimoPulse is a production-grade, AI-powered pet healthcare and emergency animal rescue web platform. It helps pet owners, animal caretakers, and emergency rescuers manage pet medical profiles, track vaccination schedules with automated alerts, extract and vector-search medical documents using RAG (Retrieval-Augmented Generation), interact with Google Gemini AI for health advice, receive instant step-by-step emergency first-aid triage, and discover nearby 24/7 veterinary hospitals and animal shelters.

---

## 1. Problem Statement & Solution

### The Challenge
Pet owners often struggle with fragmented health records, missed vaccination dates, difficulty interpreting complex veterinary lab reports, and panic during animal emergencies (e.g. hit by car, poisoning, heatstroke, or bleeding wounds).

### The AnimoPulse Solution
AnimoPulse provides a unified digital health passport for every pet:
- **Centralized Health Vault**: Store breed, weight history, allergies, active medications, microchip IDs, and medical documents.
- **RAG-Grounded AI Health Assistant**: Ask questions directly grounded in your pet's uploaded bloodwork and prescriptions using Gemini AI + Supabase pgvector search.
- **Automated Vaccination Reminders**: Color-coded tracking (Overdue, Due Soon, Upcoming, Completed) calculated automatically.
- **Emergency Animal First-Aid Triage**: Rapid urgency classification (Low, Moderate, High, Critical), safe step-by-step stabilization steps, CPR compression metronome, and nearby ER hospital locator.

---

## 2. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, Vite 5, React Router DOM v6 |
| **Styling & Icons** | Custom Responsive Healthcare CSS Design System (Navy Blue, Teal, Sky Blue, Crisp White), Lucide React Icons |
| **Database & Auth** | Supabase PostgreSQL, Supabase Auth, Row-Level Security (RLS) |
| **Storage & Vectors** | Supabase Storage (`pet-images`, `medical-records`), `pgvector` extension (768-dim embeddings) |
| **AI Model Engine** | Google Gemini API (`gemini-1.5-flash` text and multimodal models) |
| **RAG Pipeline** | Client/Server Document Text Extractor, Overlapping Word Chunking, Vector Cosine Similarity Search |
| **Observability** | LangSmith Tracing (`animopulse-ai` project tracking latency, prompts, chunks, token metrics) |
| **Geolocation & Maps** | Browser Geolocation API, OpenStreetMap Overpass API, Google Maps Search fallback |

---

## 3. Architecture & User Flow

```
[ User Auth (Supabase / Demo Mode) ]
              │
              ▼
   [ Dashboard Command Center ] ──► Widgets (Pets, Vaccinations, Reports, AI Chats)
              │
    ┌─────────┴───────────────────────┬─────────────────────────┐
    ▼                                 ▼                         ▼
[ Medical Records Vault ]   [ Vaccination Tracker ]   [ Emergency First Aid ]
  - Upload PDF/Images        - Auto Status Rules        - Triage Classification
  - Text Extraction          - Overdue / Due Soon       - CPR Metronome (100 BPM)
  - Chunking & Embeddings    - Reminder Banners         - Call 24/7 ER Hospitals
    │                                                           │
    └──────────────────┬────────────────────────────────────────┘
                       ▼
          [ AI Health Assistant (RAG) ]
           - Pet Profile Context Assembly
           - Vector Similarity Search
           - Gemini AI Grounded Answer
           - LangSmith Observability Trace
```

---

## 4. Required Pages & Features

AnimoPulse includes **12 full-featured views**:

1. **Landing Page (`/`)**: Hero section, key platform benefits, interactive feature showcase, emergency triage trigger, and CTA.
2. **Login & Signup (`/login`)**: Email/Password auth, validation, and a 1-click **"Explore as Demo User"** button for instant presentation access.
3. **Dashboard (`/dashboard`)**: Centralized command center featuring total pets count, vaccination status alerts, report counts, AI consultation shortcuts, emergency action bar, and quick add buttons.
4. **My Pets (`/pets`)**: Pet cards grid with species filters (Dogs, Cats, Rescues), microchip IDs, weight history, and active focus patient switcher.
5. **Pet Details (`/pets/:id`)**: Deep-dive health passport with tabs for Overview, Vaccination History, Medical Documents, AI Conversations, and inline profile editing.
6. **Medical Records (`/medical-records`)**: Document vault with PDF/Image previews, category filtering (Prescriptions, Blood reports, X-rays, Surgery), text extraction status, and AI summary generator.
7. **Vaccination Tracker (`/vaccinations`)**: Health schedule with automated status badges (Overdue: < today, Due Soon: ≤ 30 days, Upcoming: > 30 days, Completed), status toggling, and reminder schedule.
8. **AI Health Assistant (`/ai-assistant`)**: Context-aware AI chat linked to selected pet records. Features sample prompt chips, Gemini AI generation, RAG source citations, and medical disclaimers.
9. **Emergency First Aid (`/emergency`)**: Crisis triage system with urgency level classification (Low/Moderate/High/Critical), step-by-step first-aid steps, actions to avoid, warning signs, direct call triggers, and a **CPR timing metronome (100-120 BPM)**.
10. **Nearby Rescue Services (`/nearby-rescues`)**: Interactive directory of 24/7 ER vet hospitals, animal shelters, NGOs, and wildlife rescues with distance tags, call buttons, and directions.
11. **History Log (`/history`)**: Unified audit trail of previous AI chats, uploaded records, emergency triage sessions, and vaccine updates filterable by pet.
12. **Settings Page (`/settings`)**: Profile editor, emergency contacts management, notification preferences, data export (JSON download), and account actions.

---

## 5. RAG (Retrieval-Augmented Generation) Architecture

When a user asks a question about a pet in the AI Assistant:
1. **Context Extraction**: The active pet's breed, age, weight, allergies, active medications, and vaccination schedule are formatted into the system prompt.
2. **Document Retrieval**: The user query is searched against uploaded medical records using term relevance and vector similarity matching.
3. **Prompt Construction**: Grounded context (profile + retrieved chunks) is assembled into a structured prompt.
4. **Gemini Generation**: Gemini generates a grounded response with direct answers, key findings, suggested next steps, disclaimers, and source document references.
5. **LangSmith Trace**: Inputs, outputs, latency, retrieved sources, and execution metadata are logged to LangSmith.

---

## 6. Safety & Emergency Protocols

> [!IMPORTANT]
> **AI Safety Rules enforced by AnimoPulse:**
> - Never state definitive medical diagnoses or replace a licensed veterinarian.
> - Never recommend prescription medication dosages without veterinarian confirmation.
> - Never instruct users to perform dangerous invasive medical procedures.
> - Never encourage inducing vomiting unless explicitly instructed by a poison-control professional.
> - Always include the medical disclaimer: *"This guidance is for informational and first-aid support only. Consult a qualified veterinarian for diagnosis and treatment."*

---

## 7. Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation Steps

```bash
# 1. Clone or navigate to the project directory
cd animopulse

# 2. Install dependencies
npm install

# 3. Configure environment variables (Optional for demo mode)
cp .env.example .env

# 4. Start Vite development server
npm run dev
```

The application will launch automatically at `http://localhost:3000`.

---

## 8. Verification & Presentation Demo Data

AnimoPulse includes pre-seeded demo data for **Bruno the Labrador Retriever**:

- **Pet Profile**: Bruno (3 yrs, 28 kg, Golden Labrador).
- **Document Note**: *"Bruno has a chicken allergy and mild recurring skin irritation. The veterinarian recommended avoiding chicken-based food."*
- **Vaccination Entry**: Rabies Booster due on **July 10, 2026** (Displays as **OVERDUE**).

### Recommended Demo Test Queries:
1. Ask AI Assistant: *"What allergy is mentioned in Bruno's medical report?"*
   - **Expected Result**: Identifies chicken allergy from the Dermatology report and lists foods to avoid.
2. Ask AI Assistant: *"When is Bruno's rabies vaccination due?"*
   - **Expected Result**: Identifies the Rabies vaccine and warns that it is Overdue.
3. Emergency Test: Select *"Hit by vehicle"* or *"Bleeding wound"*.
   - **Expected Result**: Classifies urgency as **Critical/High** and provides step-by-step first aid + CPR metronome tool.

---

## 9. File Structure Summary

```
animopulse/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── README.md
├── supabase/
│   └── migrations/
│       └── 20260729_initial_schema.sql
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── context/
    │   └── AppContext.jsx
    ├── data/
    │   └── seedData.js
    ├── lib/
    │   ├── supabase.js
    │   ├── gemini.js
    │   ├── rag.js
    │   ├── langsmith.js
    │   └── nearbyRescues.js
    ├── components/
    │   ├── Sidebar.jsx
    │   ├── Navbar.jsx
    │   ├── Toast.jsx
    │   ├── AddPetModal.jsx
    │   ├── AddVaccineModal.jsx
    │   └── AddRecordModal.jsx
    └── pages/
        ├── LandingPage.jsx
        ├── AuthPage.jsx
        ├── Dashboard.jsx
        ├── MyPets.jsx
        ├── PetDetails.jsx
        ├── MedicalRecords.jsx
        ├── VaccinationTracker.jsx
        ├── AiHealthAssistant.jsx
        ├── EmergencyFirstAid.jsx
        ├── NearbyRescueServices.jsx
        ├── HistoryPage.jsx
        └── SettingsPage.jsx
```

---

## 10. License & Workshop Presentation

Built for the **Gen AI Workshop Presentation**. AnimoPulse demonstrates the real-world application of Retrieval-Augmented Generation (RAG), multimodal AI, and vector search in pet healthcare and emergency animal welfare.
