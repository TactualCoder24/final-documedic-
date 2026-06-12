-- Digital Prescription Module

CREATE TABLE IF NOT EXISTS prescriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    patient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
    diagnosis text,
    diagnosis_codes jsonb DEFAULT '[]'::jsonb, -- [{ code, description }] (ICD-10)
    medications jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{ name, dosage, frequency, duration, instructions }]
    notes text,
    advice text,
    follow_up_date date,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can manage prescriptions they created"
    ON prescriptions FOR ALL
    USING (auth.uid() = doctor_id)
    WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Patients can view their own prescriptions"
    ON prescriptions FOR SELECT
    USING (auth.uid() = patient_id);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id);
