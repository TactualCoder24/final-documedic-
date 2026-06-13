-- Security hardening migration (addresses SECURITY.md findings §1.1-1.3, §2.1-2.3)
-- All changes are policy/function tightening — no destructive schema changes.

-- ============================================================================
-- §0 — Re-affirm the doctor_patients table + "Profiles viewable by linked
-- doctor/patient" policies (supabase/doctor_patients.sql is an unversioned,
-- manually-run setup file — applied here idempotently so the §1.1 removal
-- below doesn't break doctor<->patient profile access).
-- ============================================================================

CREATE TABLE IF NOT EXISTS doctor_patients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(doctor_id, patient_id)
);

ALTER TABLE doctor_patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors can read their own patients" ON doctor_patients;
CREATE POLICY "Doctors can read their own patients" ON doctor_patients
    FOR SELECT
    USING (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Patients can read their own doctors" ON doctor_patients;
CREATE POLICY "Patients can read their own doctors" ON doctor_patients
    FOR SELECT
    USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Doctors can add patients" ON doctor_patients;
CREATE POLICY "Doctors can add patients" ON doctor_patients
    FOR INSERT
    WITH CHECK (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Patients can add doctors" ON doctor_patients;
CREATE POLICY "Patients can add doctors" ON doctor_patients
    FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Profiles viewable by linked doctor" ON profiles;
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

DROP POLICY IF EXISTS "Profiles viewable by linked patient" ON profiles;
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

-- ============================================================================
-- §1.1 — Replace blanket "Doctors can search profiles" policy with a
-- SECURITY DEFINER search function returning only the columns the UI needs
-- (id, name, email, phone, role, specialty), instead of full-row SELECT
-- access to `profiles` for every authenticated user.
-- ============================================================================

DROP POLICY IF EXISTS "Doctors can search profiles" ON profiles;

CREATE OR REPLACE FUNCTION search_profiles(search_query text, filter_role text)
RETURNS TABLE (id uuid, name text, email text, phone text, role text, specialty text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.name, p.email, p.phone, p.role, p.specialty
  FROM profiles p
  WHERE p.role = filter_role
    AND (
      p.email ILIKE '%' || search_query || '%'
      OR p.phone ILIKE '%' || search_query || '%'
      OR p.name ILIKE '%' || search_query || '%'
      OR (filter_role = 'doctor' AND p.specialty ILIKE '%' || search_query || '%')
    )
  LIMIT 10;
$$;

REVOKE ALL ON FUNCTION search_profiles(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION search_profiles(text, text) TO authenticated;

-- ============================================================================
-- §1.2 — Public booking page must only expose public-facing doctor fields,
-- not the full `profiles` row (email, phone, medical fields, etc.) to
-- anonymous visitors / anon API key.
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view doctors with public booking enabled" ON profiles;

CREATE OR REPLACE FUNCTION get_doctor_public_profile(p_doctor_id uuid)
RETURNS TABLE (id uuid, name text, specialty text, booking_bio text, public_booking_enabled boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.name, p.specialty, p.booking_bio, p.public_booking_enabled
  FROM profiles p
  WHERE p.id = p_doctor_id
    AND p.role = 'doctor'
    AND p.public_booking_enabled = true;
$$;

REVOKE ALL ON FUNCTION get_doctor_public_profile(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_doctor_public_profile(uuid) TO anon, authenticated;

-- Same issue for the public clinic page's doctor roster: it previously
-- relied on a blanket "Anyone can view active clinic doctor profiles"
-- policy (full row, anon-readable). Replace with a narrow function.

DROP POLICY IF EXISTS "Anyone can view active clinic doctor profiles" ON profiles;

CREATE OR REPLACE FUNCTION get_clinic_public_doctors(p_clinic_id uuid)
RETURNS TABLE (id uuid, name text, specialty text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.name, p.specialty
  FROM profiles p
  JOIN clinic_staff cs ON cs.user_id = p.id
  WHERE cs.clinic_id = p_clinic_id
    AND cs.role = 'doctor'
    AND cs.status = 'active';
$$;

REVOKE ALL ON FUNCTION get_clinic_public_doctors(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_clinic_public_doctors(uuid) TO anon, authenticated;

-- ============================================================================
-- §1.3 — `doctor_availability` should only be world-readable for doctors who
-- opted into public booking, not every doctor.
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view availability" ON doctor_availability;

CREATE POLICY "Anyone can view availability for public-booking doctors"
    ON doctor_availability FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = doctor_availability.doctor_id
            AND profiles.public_booking_enabled = true
        )
    );

-- ============================================================================
-- §2.1 — Doctor-authored records (prescriptions, invoices, referrals,
-- dental charts) must verify a doctor<->patient relationship exists via
-- `doctor_patients` before allowing writes, mirroring `patient_messages`.
-- ============================================================================

DROP POLICY IF EXISTS "Doctors can manage prescriptions they created" ON prescriptions;
CREATE POLICY "Doctors can manage prescriptions for their patients"
    ON prescriptions FOR ALL
    USING (auth.uid() = doctor_id)
    WITH CHECK (
        auth.uid() = doctor_id
        AND EXISTS (
            SELECT 1 FROM doctor_patients
            WHERE doctor_patients.doctor_id = prescriptions.doctor_id
            AND doctor_patients.patient_id = prescriptions.patient_id
        )
    );

DROP POLICY IF EXISTS "Doctors can manage their own invoices" ON invoices;
CREATE POLICY "Doctors can manage invoices for their patients"
    ON invoices FOR ALL
    USING (auth.uid() = doctor_id)
    WITH CHECK (
        auth.uid() = doctor_id
        AND EXISTS (
            SELECT 1 FROM doctor_patients
            WHERE doctor_patients.doctor_id = invoices.doctor_id
            AND doctor_patients.patient_id = invoices.patient_id
        )
    );

DROP POLICY IF EXISTS "Doctors can manage dental charts they created" ON dental_charts;
CREATE POLICY "Doctors can manage dental charts for their patients"
    ON dental_charts FOR ALL
    USING (auth.uid() = doctor_id)
    WITH CHECK (
        auth.uid() = doctor_id
        AND EXISTS (
            SELECT 1 FROM doctor_patients
            WHERE doctor_patients.doctor_id = dental_charts.doctor_id
            AND doctor_patients.patient_id = dental_charts.patient_id
        )
    );

DROP POLICY IF EXISTS "Referring doctors can manage their referrals" ON referrals;
CREATE POLICY "Referring doctors can manage referrals for their patients"
    ON referrals FOR ALL
    USING (auth.uid() = referring_doctor_id)
    WITH CHECK (
        auth.uid() = referring_doctor_id
        AND EXISTS (
            SELECT 1 FROM doctor_patients
            WHERE doctor_patients.doctor_id = referrals.referring_doctor_id
            AND doctor_patients.patient_id = referrals.patient_id
        )
    );

-- ============================================================================
-- §2.2 — `booking_requests` INSERT should only target doctors who have
-- opted into public booking.
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can submit a booking request" ON booking_requests;
CREATE POLICY "Anyone can submit a booking request to public-booking doctors"
    ON booking_requests FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = booking_requests.doctor_id
            AND profiles.public_booking_enabled = true
        )
    );

-- ============================================================================
-- §2.3 — Active clinic staff (front-desk/nurse/admin/doctor) should be able
-- to view and operate the front-desk queue for their clinic, not just the
-- clinic owner.
-- ============================================================================

CREATE POLICY "Active staff can view clinic queue"
    ON clinic_queue FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = clinic_queue.clinic_id
            AND clinic_staff.user_id = auth.uid()
            AND clinic_staff.status = 'active'
        )
    );

CREATE POLICY "Active staff can manage clinic queue"
    ON clinic_queue FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = clinic_queue.clinic_id
            AND clinic_staff.user_id = auth.uid()
            AND clinic_staff.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = clinic_queue.clinic_id
            AND clinic_staff.user_id = auth.uid()
            AND clinic_staff.status = 'active'
        )
    );
