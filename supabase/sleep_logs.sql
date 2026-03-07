-- ============================================================================
-- Supabase SQL: sleep_logs Table for Sleep Tracking Feature
-- Run this in your Supabase SQL Editor
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sleep_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    date DATE NOT NULL,
    hours NUMERIC(3,1) NOT NULL,
    quality TEXT NOT NULL CHECK (quality IN ('Poor', 'Fair', 'Good', 'Excellent')),
    bedtime TEXT,
    wake_time TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own sleep logs
CREATE POLICY "Users can read own sleep logs"
    ON public.sleep_logs
    FOR SELECT
    USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own sleep logs
CREATE POLICY "Users can insert own sleep logs"
    ON public.sleep_logs
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can delete their own sleep logs
CREATE POLICY "Users can delete own sleep logs"
    ON public.sleep_logs
    FOR DELETE
    USING (auth.uid()::text = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON public.sleep_logs(user_id, date DESC);
