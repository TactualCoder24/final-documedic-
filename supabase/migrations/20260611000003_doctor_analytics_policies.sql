-- Allow doctors to view appointments of their linked patients (needed for
-- the daily queue and the practice analytics dashboard).

CREATE POLICY "Doctors can view appointments of their patients"
    ON appointments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM doctor_patients
            WHERE doctor_patients.patient_id = appointments.user_id
            AND doctor_patients.doctor_id = auth.uid()
        )
    );
