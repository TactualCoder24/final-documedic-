-- Clinic-wide billing & analytics dashboards, plus the clinic public profile page.
-- Lets a clinic owner read aggregated data (invoices, appointments, prescriptions,
-- patient links) for doctors who are active staff members of their clinic, and
-- lets the public view a clinic's profile, departments, and active doctors.

-- 1. Clinic owners can view invoices issued by their active doctor staff.
CREATE POLICY "Clinic owners can view staff invoices"
    ON invoices FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.user_id = invoices.doctor_id
            AND clinic_staff.clinic_id = auth.uid()
            AND clinic_staff.role = 'doctor'
            AND clinic_staff.status = 'active'
        )
    );

-- 2. Clinic owners can view doctor-patient links for their active doctor staff
--    (needed to compute clinic-wide patient/appointment counts).
CREATE POLICY "Clinic owners can view staff doctor-patient links"
    ON doctor_patients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.user_id = doctor_patients.doctor_id
            AND clinic_staff.clinic_id = auth.uid()
            AND clinic_staff.role = 'doctor'
            AND clinic_staff.status = 'active'
        )
    );

-- 3. Clinic owners can view appointments belonging to patients of their
--    active doctor staff.
CREATE POLICY "Clinic owners can view staff doctor appointments"
    ON appointments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM doctor_patients
            JOIN clinic_staff ON clinic_staff.user_id = doctor_patients.doctor_id
            WHERE doctor_patients.patient_id = appointments.user_id
            AND clinic_staff.clinic_id = auth.uid()
            AND clinic_staff.role = 'doctor'
            AND clinic_staff.status = 'active'
        )
    );

-- 4. Clinic owners can view prescriptions issued by their active doctor staff
--    (used for clinic-wide "top diagnoses").
CREATE POLICY "Clinic owners can view staff prescriptions"
    ON prescriptions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.user_id = prescriptions.doctor_id
            AND clinic_staff.clinic_id = auth.uid()
            AND clinic_staff.role = 'doctor'
            AND clinic_staff.status = 'active'
        )
    );

-- 5. Public clinic profile page: anyone can view a clinic's departments.
CREATE POLICY "Anyone can view departments"
    ON departments FOR SELECT
    TO anon, authenticated
    USING (true);

-- 6. Public clinic profile page: anyone can view active doctor staff entries
--    (used to list a clinic's doctors).
CREATE POLICY "Anyone can view active doctor staff"
    ON clinic_staff FOR SELECT
    TO anon, authenticated
    USING (role = 'doctor' AND status = 'active');

-- 7. Public clinic profile page: anyone can view profiles of doctors who are
--    active staff of some clinic.
CREATE POLICY "Anyone can view active clinic doctor profiles"
    ON profiles FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.user_id = profiles.id
            AND clinic_staff.role = 'doctor'
            AND clinic_staff.status = 'active'
        )
    );
