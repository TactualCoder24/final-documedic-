-- Phase 2a (Clinic Head Admin/Config Panel) + Cross-cutting features
-- Tables: audit_logs, notifications, reviews, doctor_schedule_config,
--         clinic_role_permissions, clinic_services, clinic_intake_templates
-- Plus: extend intake_forms with custom responses / signature / consent.

-- ─────────────────────────────────────────────────────────────────────────
-- Audit log: who did what, when (compliance / multi-staff visibility)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    actor_name text,
    actor_role text,
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    action text NOT NULL,
    entity_type text,
    entity_id text,
    details jsonb,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can log their own actions"
    ON audit_logs FOR INSERT
    WITH CHECK (auth.uid() = actor_id);

CREATE POLICY "Actors can view their own audit log entries"
    ON audit_logs FOR SELECT
    USING (auth.uid() = actor_id);

CREATE POLICY "Clinic owners can view their clinic audit log"
    ON audit_logs FOR SELECT
    USING (auth.uid() = clinic_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_clinic ON audit_logs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────
-- Unified notification center
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    type text NOT NULL DEFAULT 'system', -- 'appointment' | 'message' | 'referral' | 'billing' | 'review' | 'system'
    title text NOT NULL,
    body text,
    link text,
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can create notifications for others"
    ON notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
    ON notifications FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────
-- Patient feedback / reviews
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    clinic_id uuid REFERENCES clinics(id) ON DELETE SET NULL,
    appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
    rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can leave reviews"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can view and edit their own reviews"
    ON reviews FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can update their own reviews"
    ON reviews FOR UPDATE
    USING (auth.uid() = patient_id)
    WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can view their own reviews"
    ON reviews FOR SELECT
    USING (auth.uid() = doctor_id);

CREATE POLICY "Clinic owners can view reviews for their clinic"
    ON reviews FOR SELECT
    USING (auth.uid() = clinic_id);

CREATE POLICY "Anyone can view reviews for ratings display"
    ON reviews FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE INDEX IF NOT EXISTS idx_reviews_doctor ON reviews(doctor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_clinic ON reviews(clinic_id);
CREATE INDEX IF NOT EXISTS idx_reviews_patient ON reviews(patient_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Dynamic scheduler config (per-doctor slot durations / buffers / overbooking)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctor_schedule_config (
    doctor_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    clinic_id uuid REFERENCES clinics(id) ON DELETE SET NULL,
    slot_duration_minutes int NOT NULL DEFAULT 15,
    buffer_minutes int NOT NULL DEFAULT 0,
    allow_overbooking boolean NOT NULL DEFAULT false,
    walkin_priority text NOT NULL DEFAULT 'fifo', -- 'fifo' | 'scheduled_first'
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE doctor_schedule_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can manage their own schedule config"
    ON doctor_schedule_config FOR ALL
    USING (auth.uid() = doctor_id)
    WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Clinic owners can manage schedule config for staff doctors"
    ON doctor_schedule_config FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.user_id = doctor_schedule_config.doctor_id
            AND clinic_staff.clinic_id = auth.uid()
            AND clinic_staff.role = 'doctor'
            AND clinic_staff.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.user_id = doctor_schedule_config.doctor_id
            AND clinic_staff.clinic_id = auth.uid()
            AND clinic_staff.role = 'doctor'
            AND clinic_staff.status = 'active'
        )
    );

CREATE POLICY "Anyone can view schedule config for booking"
    ON doctor_schedule_config FOR SELECT
    TO anon, authenticated
    USING (true);

-- ─────────────────────────────────────────────────────────────────────────
-- Granular permission matrix: custom roles + feature toggles per clinic
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clinic_role_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    role_name text NOT NULL,
    permissions jsonb NOT NULL DEFAULT '{}',
    is_custom boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(clinic_id, role_name)
);

ALTER TABLE clinic_role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic owners can manage role permissions"
    ON clinic_role_permissions FOR ALL
    USING (auth.uid() = clinic_id)
    WITH CHECK (auth.uid() = clinic_id);

CREATE POLICY "Staff can view their clinic's role permissions"
    ON clinic_role_permissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = clinic_role_permissions.clinic_id
            AND clinic_staff.user_id = auth.uid()
        )
    );

-- ─────────────────────────────────────────────────────────────────────────
-- Billing/rate-card configuration: service catalog per clinic
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clinic_services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    name text NOT NULL,
    category text NOT NULL DEFAULT 'consultation', -- 'consultation' | 'procedure' | 'diagnostic' | 'other'
    price numeric NOT NULL DEFAULT 0,
    tax_rate numeric NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE clinic_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic owners can manage their service catalog"
    ON clinic_services FOR ALL
    USING (auth.uid() = clinic_id)
    WITH CHECK (auth.uid() = clinic_id);

CREATE POLICY "Staff doctors can view active services for billing"
    ON clinic_services FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = clinic_services.clinic_id
            AND clinic_staff.user_id = auth.uid()
            AND clinic_staff.status = 'active'
        )
    );

CREATE INDEX IF NOT EXISTS idx_clinic_services_clinic ON clinic_services(clinic_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Drag-and-drop intake form builder + consent templates
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clinic_intake_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    name text NOT NULL,
    fields jsonb NOT NULL DEFAULT '[]', -- [{ id, label, type, options?, required }]
    consent_text text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE clinic_intake_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic owners can manage intake templates"
    ON clinic_intake_templates FOR ALL
    USING (auth.uid() = clinic_id)
    WITH CHECK (auth.uid() = clinic_id);

CREATE POLICY "Anyone can view active intake templates"
    ON clinic_intake_templates FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_clinic_intake_templates_clinic ON clinic_intake_templates(clinic_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Extend intake_forms with template responses / e-signature / consent
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE intake_forms ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES clinic_intake_templates(id) ON DELETE SET NULL;
ALTER TABLE intake_forms ADD COLUMN IF NOT EXISTS custom_responses jsonb;
ALTER TABLE intake_forms ADD COLUMN IF NOT EXISTS signature_data_url text;
ALTER TABLE intake_forms ADD COLUMN IF NOT EXISTS consent_accepted boolean NOT NULL DEFAULT false;
