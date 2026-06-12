-- Dental chart specialty template

CREATE TABLE IF NOT EXISTS dental_charts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    patient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    teeth jsonb NOT NULL DEFAULT '{}'::jsonb, -- { "11": "Caries", "16": "Crown", ... } keyed by FDI tooth number
    notes text,
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE (doctor_id, patient_id)
);

ALTER TABLE dental_charts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can manage dental charts they created"
    ON dental_charts FOR ALL
    USING (auth.uid() = doctor_id)
    WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Patients can view their own dental chart"
    ON dental_charts FOR SELECT
    USING (auth.uid() = patient_id);
