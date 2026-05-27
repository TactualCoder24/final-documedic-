-- SQL Migration for Doctor Dashboard Features: Daily Queue & Intake Forms

-- 1. Add specialty to profiles for doctors
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS specialty text;

-- 2. Add status to appointments for the daily queue
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Scheduled';
-- Possible values: 'Scheduled', 'Waiting', 'In-Progress', 'Completed'

-- 3. Create the Intake Forms table
CREATE TABLE IF NOT EXISTS intake_forms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_name text,
    symptoms_description text NOT NULL,
    file_url text, -- To store a photo, screenshot, or video URL
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for intake forms
ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own intake forms"
    ON intake_forms FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Users can create their own intake forms"
    ON intake_forms FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can view intake forms for their patients"
    ON intake_forms FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM doctor_patients
            WHERE doctor_patients.patient_id = intake_forms.patient_id
            AND doctor_patients.doctor_id = auth.uid()
        )
    );

-- 4. Create the Doctor Tasks table
CREATE TABLE IF NOT EXISTS doctor_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    patient_id uuid REFERENCES profiles(id) ON DELETE SET NULL, -- Optional link to a patient
    description text NOT NULL,
    status text DEFAULT 'todo', -- 'todo' or 'done'
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for doctor tasks
ALTER TABLE doctor_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can manage their own tasks"
    ON doctor_tasks FOR ALL
    USING (auth.uid() = doctor_id);
