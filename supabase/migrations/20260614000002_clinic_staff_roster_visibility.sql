-- Smoke-test follow-up: front-desk/nurse staff opening the OPD Queue tab call
-- getClinicStaff(clinicId) to populate the "assign to doctor" dropdown, but the
-- existing clinic_staff SELECT policies only let a staff member see their own
-- row (or the owner see everyone). Add a policy so any active staff member can
-- see the full roster of their own clinic.

CREATE POLICY "Active staff can view their clinic's staff roster"
    ON clinic_staff FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff cs
            WHERE cs.clinic_id = clinic_staff.clinic_id
            AND cs.user_id = auth.uid()
            AND cs.status = 'active'
        )
    );
