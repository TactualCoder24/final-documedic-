-- Doctor public booking page: availability schedule, booking requests,
-- and a flag + slug for enabling the public page.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS public_booking_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS booking_bio text;

-- Allow anyone (including anonymous visitors) to view basic info for doctors
-- who have enabled their public booking page.
CREATE POLICY "Anyone can view doctors with public booking enabled"
    ON profiles FOR SELECT
    TO anon, authenticated
    USING (role = 'doctor' AND public_booking_enabled = true);

CREATE TABLE IF NOT EXISTS doctor_availability (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
    start_time time NOT NULL,
    end_time time NOT NULL,
    slot_duration_minutes int NOT NULL DEFAULT 30,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can manage their own availability"
    ON doctor_availability FOR ALL
    USING (auth.uid() = doctor_id)
    WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Anyone can view availability"
    ON doctor_availability FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE TABLE IF NOT EXISTS booking_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    patient_name text NOT NULL,
    patient_email text,
    patient_phone text,
    requested_date_time timestamp with time zone NOT NULL,
    reason text,
    status text NOT NULL DEFAULT 'pending', -- 'pending' | 'confirmed' | 'declined'
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a booking request"
    ON booking_requests FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Doctors can manage their booking requests"
    ON booking_requests FOR ALL
    USING (auth.uid() = doctor_id)
    WITH CHECK (auth.uid() = doctor_id);

CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor ON doctor_availability(doctor_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_doctor ON booking_requests(doctor_id);
