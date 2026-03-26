-- ============================================================================
-- Supabase SQL: shared_records Table for Doctor Sharing Feature
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Create the shared_records table
CREATE TABLE IF NOT EXISTS public.shared_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    record_data JSONB NOT NULL,
    title TEXT NOT NULL DEFAULT 'Shared Health Record',
    record_type TEXT NOT NULL DEFAULT 'medical_record',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.shared_records ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read a shared record by ID (public access for doctors)
CREATE POLICY "Public can read shared records"
    ON public.shared_records
    FOR SELECT
    USING (true);

-- Policy: Only the owner can insert shared records
CREATE POLICY "Users can create their own shared records"
    ON public.shared_records
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

-- Policy: Only the owner can delete their shared records
CREATE POLICY "Users can delete their own shared records"
    ON public.shared_records
    FOR DELETE
    USING (auth.uid()::text = user_id);

-- Create an index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_shared_records_user_id ON public.shared_records(user_id);

-- Create an index for expiry-based queries
CREATE INDEX IF NOT EXISTS idx_shared_records_expires_at ON public.shared_records(expires_at);

-- Optional: Auto-cleanup expired records (run as a cron job or manually)
-- DELETE FROM public.shared_records WHERE expires_at < NOW();
