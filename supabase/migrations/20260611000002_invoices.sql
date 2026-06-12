-- Per-doctor billing & invoicing

CREATE TABLE IF NOT EXISTS invoices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    patient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    patient_name text,
    appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
    items jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{ description, quantity, unitPrice }]
    total numeric NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'due', -- 'due' | 'paid' | 'partial'
    issued_date date NOT NULL DEFAULT CURRENT_DATE,
    due_date date,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can manage their own invoices"
    ON invoices FOR ALL
    USING (auth.uid() = doctor_id)
    WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Patients can view their own invoices"
    ON invoices FOR SELECT
    USING (auth.uid() = patient_id);

CREATE INDEX IF NOT EXISTS idx_invoices_doctor ON invoices(doctor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices(patient_id);
