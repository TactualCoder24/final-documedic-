-- Phase 2: Clinic / Hospital data model
-- A "clinic" is a profile with role = 'clinic'. clinics.id == profiles.id (1:1).

CREATE TABLE IF NOT EXISTS clinics (
    id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    address text,
    phone text,
    email text,
    specialties text[],
    logo_url text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic owners can manage their clinic"
    ON clinics FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view clinics"
    ON clinics FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE TABLE IF NOT EXISTS departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic owners can manage departments"
    ON departments FOR ALL
    USING (auth.uid() = clinic_id)
    WITH CHECK (auth.uid() = clinic_id);

CREATE TABLE IF NOT EXISTS clinic_staff (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    staff_name text,
    staff_email text,
    role text NOT NULL DEFAULT 'doctor', -- 'doctor' | 'front_desk' | 'nurse' | 'admin'
    department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'pending', -- 'pending' | 'active' | 'inactive'
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE clinic_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic owners can manage their staff"
    ON clinic_staff FOR ALL
    USING (auth.uid() = clinic_id)
    WITH CHECK (auth.uid() = clinic_id);

CREATE POLICY "Staff can view and update their own membership"
    ON clinic_staff FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Staff can accept or update their own membership"
    ON clinic_staff FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_departments_clinic ON departments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_staff_clinic ON clinic_staff(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_staff_user ON clinic_staff(user_id);

-- Front-desk patient queue for walk-ins / check-ins at a clinic
CREATE TABLE IF NOT EXISTS clinic_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    patient_name text NOT NULL,
    patient_phone text,
    doctor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'waiting', -- 'waiting' | 'in_progress' | 'completed' | 'cancelled'
    token_number int,
    notes text,
    checked_in_at timestamp with time zone DEFAULT now(),
    called_at timestamp with time zone,
    completed_at timestamp with time zone
);

ALTER TABLE clinic_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic owners can manage their queue"
    ON clinic_queue FOR ALL
    USING (auth.uid() = clinic_id)
    WITH CHECK (auth.uid() = clinic_id);

CREATE POLICY "Doctors can view and update their own queue entries"
    ON clinic_queue FOR SELECT
    USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update their own queue entries"
    ON clinic_queue FOR UPDATE
    USING (auth.uid() = doctor_id)
    WITH CHECK (auth.uid() = doctor_id);

CREATE INDEX IF NOT EXISTS idx_clinic_queue_clinic ON clinic_queue(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_queue_doctor ON clinic_queue(doctor_id);
