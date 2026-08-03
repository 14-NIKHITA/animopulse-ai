-- ==========================================================
-- AnimoPulse Supabase Security Hardening & Complete RLS Policies
-- Migration: 20260803_security_hardening.sql
-- Ensures 100% User-Scoped Isolation across all database tables & storage
-- ==========================================================

-- 1. Enable RLS on all tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.emergency_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rescue_services ENABLE ROW LEVEL SECURITY;

-- 2. Profiles Table Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Pets Table Policies
DROP POLICY IF EXISTS "Users can view own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can insert own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can update own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can delete own pets" ON public.pets;

CREATE POLICY "Users can view own pets" ON public.pets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pets" ON public.pets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pets" ON public.pets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pets" ON public.pets FOR DELETE USING (auth.uid() = user_id);

-- 4. Vaccinations Table Policies
DROP POLICY IF EXISTS "Users can view own vaccinations" ON public.vaccinations;
DROP POLICY IF EXISTS "Users can insert own vaccinations" ON public.vaccinations;
DROP POLICY IF EXISTS "Users can update own vaccinations" ON public.vaccinations;
DROP POLICY IF EXISTS "Users can delete own vaccinations" ON public.vaccinations;

CREATE POLICY "Users can view own vaccinations" ON public.vaccinations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vaccinations" ON public.vaccinations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vaccinations" ON public.vaccinations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vaccinations" ON public.vaccinations FOR DELETE USING (auth.uid() = user_id);

-- 5. Medical Records Table Policies
DROP POLICY IF EXISTS "Users can view own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can insert own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can update own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can delete own medical records" ON public.medical_records;

CREATE POLICY "Users can view own medical records" ON public.medical_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own medical records" ON public.medical_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own medical records" ON public.medical_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own medical records" ON public.medical_records FOR DELETE USING (auth.uid() = user_id);

-- 6. Document Chunks Table Policies
DROP POLICY IF EXISTS "Users can view own document chunks" ON public.document_chunks;
DROP POLICY IF EXISTS "Users can insert own document chunks" ON public.document_chunks;
DROP POLICY IF EXISTS "Users can update own document chunks" ON public.document_chunks;
DROP POLICY IF EXISTS "Users can delete own document chunks" ON public.document_chunks;

CREATE POLICY "Users can view own document chunks" ON public.document_chunks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own document chunks" ON public.document_chunks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own document chunks" ON public.document_chunks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own document chunks" ON public.document_chunks FOR DELETE USING (auth.uid() = user_id);

-- 7. AI Conversations Table Policies
DROP POLICY IF EXISTS "Users can view own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON public.ai_conversations;

CREATE POLICY "Users can view own conversations" ON public.ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON public.ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.ai_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.ai_conversations FOR DELETE USING (auth.uid() = user_id);

-- 8. AI Messages Table Policies
DROP POLICY IF EXISTS "Users can view own messages" ON public.ai_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.ai_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.ai_messages;

CREATE POLICY "Users can view own messages" ON public.ai_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.ai_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON public.ai_messages FOR DELETE USING (auth.uid() = user_id);

-- 9. Emergency Sessions Table Policies
DROP POLICY IF EXISTS "Users can view own emergency sessions" ON public.emergency_sessions;
DROP POLICY IF EXISTS "Users can insert own emergency sessions" ON public.emergency_sessions;
DROP POLICY IF EXISTS "Users can delete own emergency sessions" ON public.emergency_sessions;

CREATE POLICY "Users can view own emergency sessions" ON public.emergency_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own emergency sessions" ON public.emergency_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own emergency sessions" ON public.emergency_sessions FOR DELETE USING (auth.uid() = user_id);

-- 10. Rescue Services Table Policies (Public Read)
DROP POLICY IF EXISTS "Anyone can view rescue services" ON public.rescue_services;
CREATE POLICY "Anyone can view rescue services" ON public.rescue_services FOR SELECT USING (true);

-- 11. Storage Bucket RLS Policies for medical-records (user-id/pet-id/filename.ext)
CREATE POLICY "Users can upload own medical files" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'medical-records' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own medical files" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'medical-records' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own medical files" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'medical-records' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
