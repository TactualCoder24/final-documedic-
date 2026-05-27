-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS doctor_patients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(doctor_id, patient_id)
);

-- Enable RLS
ALTER TABLE doctor_patients ENABLE ROW LEVEL SECURITY;

-- Allow doctors to read their own rows
CREATE POLICY "Doctors can read their own patients" ON doctor_patients
    FOR SELECT
    USING (auth.uid() = doctor_id);

-- Allow patients to read their own rows
CREATE POLICY "Patients can read their own doctors" ON doctor_patients
    FOR SELECT
    USING (auth.uid() = patient_id);

-- Allow doctors to insert rows for themselves
CREATE POLICY "Doctors can add patients" ON doctor_patients
    FOR INSERT
    WITH CHECK (auth.uid() = doctor_id);

-- Allow patients to insert rows for themselves
CREATE POLICY "Patients can add doctors" ON doctor_patients
    FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

-- Also, ensure profiles can be read if a relationship exists
CREATE POLICY "Profiles viewable by linked doctor" ON profiles
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM doctor_patients
        WHERE doctor_patients.patient_id = profiles.id
        AND doctor_patients.doctor_id = auth.uid()
      )
      OR auth.uid() = id
    );

CREATE POLICY "Profiles viewable by linked patient" ON profiles
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM doctor_patients
        WHERE doctor_patients.doctor_id = profiles.id
        AND doctor_patients.patient_id = auth.uid()
      )
      OR auth.uid() = id
    );

-- You might also need to update policies on other tables (vitals, medical_records, etc.) 
-- to allow doctors to read them. For example:
-- CREATE POLICY "Doctors can view patient vitals" ON vitals FOR SELECT USING (
--   EXISTS (SELECT 1 FROM doctor_patients WHERE doctor_patients.patient_id = vitals.user_id AND doctor_patients.doctor_id = auth.uid())
-- );
