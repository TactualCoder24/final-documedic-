-- Clinical quick-templates (speed-optimized prescribing + specialty modules)
--
-- Generalized "Rx-groups" into a broader clinical_templates table supporting
-- three template types, all loadable with one click:
--   - rx_group:   full diagnosis + medications + advice (the original Rx-group)
--   - complaint:  just a chief complaint + diagnosis/ICD codes for quick-fill
--   - test_panel: a named set of investigations/tests to advise

CREATE TABLE IF NOT EXISTS clinical_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    type text NOT NULL DEFAULT 'rx_group' CHECK (type IN ('rx_group', 'complaint', 'test_panel')),
    name text NOT NULL,
    diagnosis text,
    diagnosis_codes jsonb DEFAULT '[]'::jsonb, -- [{ code, description }]
    medications jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{ name, dosage, frequency, duration, instructions }]
    tests jsonb NOT NULL DEFAULT '[]'::jsonb, -- ["Fasting Blood Sugar", "HbA1c", ...]
    advice text,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE clinical_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can manage their own clinical templates"
    ON clinical_templates FOR ALL
    USING (auth.uid() = doctor_id)
    WITH CHECK (auth.uid() = doctor_id);

CREATE INDEX IF NOT EXISTS idx_clinical_templates_doctor ON clinical_templates(doctor_id);
CREATE INDEX IF NOT EXISTS idx_clinical_templates_type ON clinical_templates(type);

-- Allow prescriptions to record a list of advised tests/investigations
-- (populated via test_panel quick-templates).
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS tests_advised jsonb NOT NULL DEFAULT '[]'::jsonb;
