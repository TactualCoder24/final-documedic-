-- ============================================================================
-- Supabase SQL: beta_signups Table for MentiBot Beta Registration
-- Run this in your Supabase SQL Editor
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.beta_signups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    platform TEXT DEFAULT 'web',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone (including unauthenticated users) can insert a signup
-- This is intentional — beta signups come from the public-facing landing page
CREATE POLICY "Anyone can register for beta"
    ON public.beta_signups
    FOR INSERT
    WITH CHECK (true);

-- Policy: Authenticated users can only read their own signup record
CREATE POLICY "Users can read own beta signup"
    ON public.beta_signups
    FOR SELECT
    USING (auth.uid()::text = id::text OR auth.email() = email);

-- Policy: Authenticated users can delete their own signup record
CREATE POLICY "Users can delete own beta signup"
    ON public.beta_signups
    FOR DELETE
    USING (auth.email() = email);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_beta_signups_email ON public.beta_signups(email);
