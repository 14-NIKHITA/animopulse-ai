-- ==========================================================
-- AnimoPulse Complete Supabase PostgreSQL Database Schema
-- Includes RLS Policies, Vector Search (pgvector), & Storage
-- ==========================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Create User Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Pets Table
CREATE TABLE IF NOT EXISTS public.pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    animal_type TEXT NOT NULL, -- Dog, Cat, Bird, Rescue/Stray, Exotic, etc.
    breed TEXT,
    date_of_birth DATE,
    gender TEXT,
    weight NUMERIC,
    colour TEXT,
    allergies TEXT,
    medications TEXT,
    medical_conditions TEXT,
    microchip_number TEXT,
    notes TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Vaccinations Table
CREATE TABLE IF NOT EXISTS public.vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    vaccine_name TEXT NOT NULL,
    last_vaccination_date DATE,
    next_due_date DATE NOT NULL,
    veterinarian_name TEXT,
    hospital_name TEXT,
    status TEXT NOT NULL DEFAULT 'Upcoming', -- Overdue, Due Soon, Upcoming, Completed
    notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Medical Records Table
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- Prescription, Blood report, Vaccination certificate, X-ray, Scan, General checkup, Surgery record, Discharge summary, Other
    file_url TEXT,
    file_path TEXT,
    file_type TEXT,
    veterinarian_name TEXT,
    hospital_name TEXT,
    record_date DATE,
    notes TEXT,
    extracted_text TEXT,
    ai_summary TEXT,
    processing_status TEXT DEFAULT 'Completed', -- Pending, Processing, Completed, Failed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Document Chunks Table for RAG Vector Search (768 dimensions for Gemini Embeddings)
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    medical_record_id UUID NOT NULL REFERENCES public.medical_records(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(768),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast vector similarity search
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx ON public.document_chunks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 7. Create AI Conversations Table
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create AI Messages Table
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    retrieved_sources JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create Emergency Sessions Table
CREATE TABLE IF NOT EXISTS public.emergency_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
    animal_type TEXT,
    emergency_type TEXT,
    user_description TEXT,
    triage_answers JSONB DEFAULT '{}'::jsonb,
    urgency_level TEXT, -- Low, Moderate, High, Critical
    ai_guidance JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Create Rescue Services Table (Verified ER & Shelters Directory)
CREATE TABLE IF NOT EXISTS public.rescue_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    service_type TEXT NOT NULL, -- Veterinary Hospital, Animal Shelter, Rescue NGO, Emergency Clinic, Wildlife Rescue
    address TEXT,
    city TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    phone TEXT,
    email TEXT,
    website TEXT,
    open_24_hours BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rescue_services ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Pets Policies
CREATE POLICY "Users can view own pets" ON public.pets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pets" ON public.pets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pets" ON public.pets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pets" ON public.pets FOR DELETE USING (auth.uid() = user_id);

-- Vaccinations Policies
CREATE POLICY "Users can view own vaccinations" ON public.vaccinations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vaccinations" ON public.vaccinations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vaccinations" ON public.vaccinations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vaccinations" ON public.vaccinations FOR DELETE USING (auth.uid() = user_id);

-- Medical Records Policies
CREATE POLICY "Users can view own medical records" ON public.medical_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own medical records" ON public.medical_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own medical records" ON public.medical_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own medical records" ON public.medical_records FOR DELETE USING (auth.uid() = user_id);

-- Document Chunks Policies
CREATE POLICY "Users can view own document chunks" ON public.document_chunks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own document chunks" ON public.document_chunks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own document chunks" ON public.document_chunks FOR DELETE USING (auth.uid() = user_id);

-- AI Conversations & Messages Policies
CREATE POLICY "Users can view own conversations" ON public.ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON public.ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.ai_conversations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON public.ai_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.ai_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Emergency Sessions Policies
CREATE POLICY "Users can view own emergency sessions" ON public.emergency_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own emergency sessions" ON public.emergency_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Rescue Services Policies (Public read for all users)
CREATE POLICY "Anyone can view rescue services" ON public.rescue_services FOR SELECT USING (true);

-- ==========================================================
-- VECTOR SIMILARITY SEARCH STORED PROCEDURE (RAG RETRIEVAL)
-- ==========================================================

CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_user_id uuid,
  p_pet_id uuid
)
RETURNS TABLE (
  id uuid,
  medical_record_id uuid,
  chunk_index int,
  chunk_text text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.medical_record_id,
    dc.chunk_index,
    dc.chunk_text,
    1 - (dc.embedding <=> query_embedding) AS similarity,
    dc.metadata
  FROM public.document_chunks dc
  WHERE dc.user_id = p_user_id
    AND dc.pet_id = p_pet_id
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ==========================================================
-- SUPABASE STORAGE BUCKET CREATION (Execute in Supabase SQL editor)
-- ==========================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('pet-images', 'pet-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('medical-records', 'medical-records', false);
