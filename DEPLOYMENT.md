# AnimoPulse Production Deployment Guide

This document outlines the step-by-step procedure to deploy **AnimoPulse** to Vercel with Supabase database integration, Vercel Serverless `/api` functions, and LangSmith observability.

---

## 1. Prerequisites

- **GitHub Account** & repository to host the codebase.
- **Vercel Account** linked to GitHub.
- **Supabase Project** with PostgreSQL database.
- **Google Gemini API Key** (`gemini-1.5-flash` model access).
- **LangSmith Account** & API key (for AI tracing and observability).

---

## 2. Environment Variables Configuration

Configure the following environment variables in **Vercel Project Settings -> Environment Variables**:

| Variable Name | Scope | Description |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Client & Server | Supabase project HTTPS URL (`https://<project-ref>.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Client & Server | Supabase public anonymous key |
| `GEMINI_API_KEY` | Server Only | Secret Google Gemini API Key for serverless AI functions |
| `LANGSMITH_API_KEY` | Server Only | Secret LangSmith API Key for backend tracing |
| `LANGSMITH_PROJECT` | Server Only | Set to `animopulse-ai` |
| `LANGSMITH_TRACING` | Server Only | Set to `true` |
| `LANGSMITH_ENDPOINT` | Server Only | Set to `https://api.smith.langchain.com` |
| `LANGSMITH_TRACING_BACKGROUND` | Server Only | Set to `false` |

> ⚠️ **Security Warning**: Never prefix `GEMINI_API_KEY` or `LANGSMITH_API_KEY` with `VITE_`. Keeping them without the `VITE_` prefix ensures they remain strictly on Vercel serverless function backends and are never exposed in the public JavaScript browser bundle.

---

## 3. Database & Storage Setup (Supabase)

1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Run the initial schema migration script from [`supabase/migrations/20260729_initial_schema.sql`](file:///c:/Users/Nikhita/OneDrive/Desktop/animopulse/supabase/migrations/20260729_initial_schema.sql).
3. Run the security hardening migration script from [`supabase/migrations/20260803_security_hardening.sql`](file:///c:/Users/Nikhita/OneDrive/Desktop/animopulse/supabase/migrations/20260803_security_hardening.sql).
4. Navigate to **Storage** -> Create two buckets:
   - `pet-images` (Public: Enabled)
   - `medical-records` (Public: Disabled, user-scoped RLS policies applied)

---

## 4. GitHub & Vercel Deployment Steps

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Deploy AnimoPulse with secure serverless API and hardened RLS"
git branch -M main
git remote add origin https://github.com/your-username/animopulse.git
git push -u origin main
```

### Step 2: Import Project in Vercel
1. Log into [Vercel Dashboard](https://vercel.com).
2. Click **"Add New"** -> **"Project"**.
3. Select your `animopulse` repository from GitHub.
4. Select **Vite** as Framework Preset.
5. Set Build Command: `npm run build`
6. Set Output Directory: `dist`
7. Add Environment Variables listed in Section 2 above.
8. Click **Deploy**.

---

## 5. Deployment Verification Checklist

- [x] Single-Page Application routing works on refresh (`/dashboard`, `/my-pets`, `/ai-assistant`, `/emergency`).
- [x] `/api/health-assistant` returns 401 Unauthorized when called without a valid Supabase Bearer JWT token.
- [x] `/api/emergency-triage` returns 401 Unauthorized when called without a valid Supabase Bearer JWT token.
- [x] Authenticated users can query AI Health Assistant with RAG medical record sources displayed.
- [x] Emergency First Aid triage classifies urgency and returns structured first-aid steps.
- [x] LangSmith dashboard receives runs under project `animopulse-ai`.
