-- In-app patient communication & reminders sent by doctors

CREATE TABLE IF NOT EXISTS patient_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_name text,
    patient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    type text NOT NULL DEFAULT 'message', -- 'message' | 'reminder'
    title text NOT NULL,
    body text,
    scheduled_for timestamp with time zone,
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE patient_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can send messages to their patients"
    ON patient_messages FOR INSERT
    WITH CHECK (
        auth.uid() = doctor_id
        AND EXISTS (
            SELECT 1 FROM doctor_patients
            WHERE doctor_patients.doctor_id = patient_messages.doctor_id
            AND doctor_patients.patient_id = patient_messages.patient_id
        )
    );

CREATE POLICY "Doctors can view and manage their sent messages"
    ON patient_messages FOR SELECT
    USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can delete their sent messages"
    ON patient_messages FOR DELETE
    USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can view their messages"
    ON patient_messages FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can mark messages as read"
    ON patient_messages FOR UPDATE
    USING (auth.uid() = patient_id)
    WITH CHECK (auth.uid() = patient_id);

CREATE INDEX IF NOT EXISTS idx_patient_messages_doctor ON patient_messages(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patient_messages_patient ON patient_messages(patient_id);
