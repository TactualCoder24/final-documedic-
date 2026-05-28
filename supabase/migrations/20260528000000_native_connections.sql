-- Migration: Add Native Connection Workflows (PINs & Connection Requests)

-- 1. Add email and phone to profiles (if they don't exist)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Index for fast searching
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- 2. Create patient_pins table for the 6-Digit PIN method
CREATE TABLE IF NOT EXISTS patient_pins (
    pin VARCHAR(6) PRIMARY KEY,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS for patient_pins
ALTER TABLE patient_pins ENABLE ROW LEVEL SECURITY;

-- Patients can create their own PINs
CREATE POLICY "Patients can insert their own PINs" ON patient_pins
    FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

-- Anyone authenticated (like a doctor) can read PINs to verify them
CREATE POLICY "Doctors can verify PINs" ON patient_pins
    FOR SELECT
    TO authenticated
    USING (true);

-- Patients can view and delete their own PINs
CREATE POLICY "Patients can view own PINs" ON patient_pins
    FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can delete own PINs" ON patient_pins
    FOR DELETE
    USING (auth.uid() = patient_id);

-- Doctors can delete PINs after successful use
CREATE POLICY "Doctors can consume PINs" ON patient_pins
    FOR DELETE
    TO authenticated
    USING (true);


-- 3. Create connection_requests table for the Global Search & Approval method
CREATE TABLE IF NOT EXISTS connection_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(doctor_id, patient_id) -- Only one active request per pair
);

-- Enable RLS for connection_requests
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;

-- Doctors can insert connection requests
CREATE POLICY "Doctors can request connections" ON connection_requests
    FOR INSERT
    WITH CHECK (auth.uid() = doctor_id);

-- Doctors can view their sent requests
CREATE POLICY "Doctors can view sent requests" ON connection_requests
    FOR SELECT
    USING (auth.uid() = doctor_id);

-- Patients can view requests sent to them
CREATE POLICY "Patients can view incoming requests" ON connection_requests
    FOR SELECT
    USING (auth.uid() = patient_id);

-- Patients can update the status of requests (approve/reject)
CREATE POLICY "Patients can approve or reject requests" ON connection_requests
    FOR UPDATE
    USING (auth.uid() = patient_id);

-- Create a trigger to auto-update updated_at
CREATE TRIGGER update_connection_requests_updated_at BEFORE UPDATE ON connection_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update profiles RLS to allow doctors to search by email/phone
-- Since anyone authenticated should be able to search basic details, we can relax the profiles SELECT policy slightly,
-- OR keep it restricted. Let's add a policy so doctors can search for any patient.
CREATE POLICY "Doctors can search profiles" ON profiles
    FOR SELECT
    TO authenticated
    USING (true); -- This allows any logged in user to find a profile (needed for the Search method).
