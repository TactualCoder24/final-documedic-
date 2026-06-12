-- Phase 3: Hospital operations
-- Tables: hospital_beds, ipd_admissions, pharmacy_inventory, pharmacy_dispenses,
--         lab_orders, insurance_claims, equipment_assets, clinic_commerce_settings

-- ─────────────────────────────────────────────────────────────────────────
-- Helper note on RLS pattern used throughout this file:
--   Clinic owner (auth.uid() = clinic_id) gets full access.
--   Any active staff member of the clinic gets read/write access to the
--   day-to-day operational tables (beds, IPD, pharmacy, lab, claims,
--   equipment) since front-desk/nurses/doctors all participate in these
--   workflows. Deletes on a few tables are still owner-only.
-- ─────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────
-- Bed / ward management
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hospital_beds (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    ward_name text NOT NULL,
    bed_number text NOT NULL,
    bed_type text NOT NULL DEFAULT 'general', -- 'general' | 'private' | 'icu' | 'emergency'
    status text NOT NULL DEFAULT 'available', -- 'available' | 'occupied' | 'maintenance'
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE hospital_beds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic owners can manage beds"
    ON hospital_beds FOR ALL
    USING (auth.uid() = clinic_id)
    WITH CHECK (auth.uid() = clinic_id);

CREATE POLICY "Active staff can view and update beds"
    ON hospital_beds FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = hospital_beds.clinic_id
            AND clinic_staff.user_id = auth.uid()
            AND clinic_staff.status = 'active'
        )
    );

CREATE POLICY "Active staff can update bed status"
    ON hospital_beds FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = hospital_beds.clinic_id
            AND clinic_staff.user_id = auth.uid()
            AND clinic_staff.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = hospital_beds.clinic_id
            AND clinic_staff.user_id = auth.uid()
            AND clinic_staff.status = 'active'
        )
    );

CREATE INDEX IF NOT EXISTS idx_hospital_beds_clinic ON hospital_beds(clinic_id);

-- ─────────────────────────────────────────────────────────────────────────
-- IPD (in-patient) admissions
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ipd_admissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    patient_name text NOT NULL,
    bed_id uuid REFERENCES hospital_beds(id) ON DELETE SET NULL,
    admitting_doctor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    admitting_doctor_name text,
    diagnosis text,
    admission_date timestamp with time zone NOT NULL DEFAULT now(),
    expected_discharge_date date,
    discharge_date timestamp with time zone,
    status text NOT NULL DEFAULT 'admitted', -- 'admitted' | 'discharged'
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ipd_admissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic owners can manage admissions"
    ON ipd_admissions FOR ALL
    USING (auth.uid() = clinic_id)
    WITH CHECK (auth.uid() = clinic_id);

CREATE POLICY "Active staff can manage admissions"
    ON ipd_admissions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = ipd_admissions.clinic_id
            AND clinic_staff.user_id = auth.uid()
            AND clinic_staff.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = ipd_admissions.clinic_id
            AND clinic_staff.user_id = auth.uid()
            AND clinic_staff.status = 'active'
        )
    );

CREATE POLICY "Patients can view their own admissions"
    ON ipd_admissions FOR SELECT
    USING (auth.uid() = patient_id);

CREATE INDEX IF NOT EXISTS idx_ipd_admissions_clinic ON ipd_admissions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_ipd_admissions_patient ON ipd_admissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_ipd_admissions_bed ON ipd_admissions(bed_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Pharmacy inventory
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pharmacy_inventory (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    medicine_name text NOT NULL,
    category text,
    sku text,
    unit text NOT NULL DEFAULT 'units',
    stock_quantity numeric NOT NULL DEFAULT 0,
    reorder_level numeric NOT NULL DEFAULT 0,
    unit_price numeric NOT NULL DEFAULT 0,
    expiry_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE pharmacy_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic owners can manage pharmacy inventory"
    ON pharmacy_inventory FOR ALL
    USING (auth.uid() = clinic_id)
    WITH CHECK (auth.uid() = clinic_id);

CREATE POLICY "Active staff can manage pharmacy inventory"
    ON pharmacy_inventory FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = pharmacy_inventory.clinic_id
            AND clinic_staff.user_id = auth.uid()
            AND clinic_staff.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = pharmacy_inventory.clinic_id
            AND clinic_staff.user_id = auth.uid()
            AND clinic_staff.status = 'active'
        )
    );

CREATE INDEX IF NOT EXISTS idx_pharmacy_inventory_clinic ON pharmacy_inventory(clinic_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Pharmacy dispense log
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pharmacy_dispenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    inventory_id uuid REFERENCES pharmacy_inventory(id) ON DELETE SET NULL,
    medicine_name text NOT NULL,
    quantity numeric NOT NULL,
    patient_name text,
    dispensed_by text,
    dispensed_at timestamp with time zone DEFAULT now()
);

ALTER TABLE pharmacy_dispenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic owners can manage dispenses"
    ON pharmacy_dispenses FOR ALL
    USING (auth.uid() = clinic_id)
    WITH CHECK (auth.uid() = clinic_id);

CREATE POLICY "Active staff can manage dispenses"
    ON pharmacy_dispenses FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = pharmacy_dispenses.clinic_id
            AND clinic_staff.user_id = auth.uid()
            AND clinic_staff.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = pharmacy_dispenses.clinic_id
            AND clinic_staff.user_id = auth.uid()
            AND clinic_staff.status = 'active'
        )
    );

CREATE INDEX IF NOT EXISTS idx_pharmacy_dispenses_clinic ON pharmacy_dispenses(clinic_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_dispenses_inventory ON pharmacy_dispenses(inventory_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Lab order management
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lab_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    patient_name text NOT NULL,
    doctor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    doctor_name text,
    test_name text NOT NULL,
    status text NOT NULL DEFAULT 'ordered', -- 'ordered' | 'sample_collected' | 'in_progress' | 'completed' | 'cancelled'
    ordered_at timestamp with time zone DEFAULT now(),
    result_url text,
    result_notes text,
    completed_at timestamp with time zone
);

ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic owners can manage lab orders"
    ON lab_orders FOR ALL
    USING (auth.uid() = clinic_id)
    WITH CHECK (auth.uid() = clinic_id);

CREATE POLICY "Active staff can manage lab orders"
    ON lab_orders FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = lab_orders.clinic_id
            AND clinic_staff.user_id = auth.uid()
            AND clinic_staff.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = lab_orders.clinic_id
            AND clinic_staff.user_id = auth.uid()
            AND clinic_staff.status = 'active'
        )
    );

CREATE POLICY "Patients can view their own lab orders"
    ON lab_orders FOR SELECT
    USING (auth.uid() = patient_id);

CREATE INDEX IF NOT EXISTS idx_lab_orders_clinic ON lab_orders(clinic_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_patient ON lab_orders(patient_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Insurance / claims tracking
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS insurance_claims (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    patient_name text NOT NULL,
    invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
    insurer_name text NOT NULL,
    policy_number text,
    claim_amount numeric NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'draft', -- 'draft' | 'submitted' | 'approved' | 'rejected' | 'settled'
    submitted_at timestamp with time zone,
    settled_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic owners can manage insurance claims"
    ON insurance_claims FOR ALL
    USING (auth.uid() = clinic_id)
    WITH CHECK (auth.uid() = clinic_id);

CREATE POLICY "Active staff can manage insurance claims"
    ON insurance_claims FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = insurance_claims.clinic_id
            AND clinic_staff.user_id = auth.uid()
            AND clinic_staff.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = insurance_claims.clinic_id
            AND clinic_staff.user_id = auth.uid()
            AND clinic_staff.status = 'active'
        )
    );

CREATE POLICY "Patients can view their own claims"
    ON insurance_claims FOR SELECT
    USING (auth.uid() = patient_id);

CREATE INDEX IF NOT EXISTS idx_insurance_claims_clinic ON insurance_claims(clinic_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_patient ON insurance_claims(patient_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Equipment / asset tracking
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS equipment_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    name text NOT NULL,
    category text,
    serial_number text,
    location text,
    status text NOT NULL DEFAULT 'operational', -- 'operational' | 'maintenance' | 'retired'
    purchase_date date,
    last_service_date date,
    next_service_date date,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE equipment_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic owners can manage equipment"
    ON equipment_assets FOR ALL
    USING (auth.uid() = clinic_id)
    WITH CHECK (auth.uid() = clinic_id);

CREATE POLICY "Active staff can view and update equipment"
    ON equipment_assets FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = equipment_assets.clinic_id
            AND clinic_staff.user_id = auth.uid()
            AND clinic_staff.status = 'active'
        )
    );

CREATE POLICY "Active staff can update equipment status"
    ON equipment_assets FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = equipment_assets.clinic_id
            AND clinic_staff.user_id = auth.uid()
            AND clinic_staff.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = equipment_assets.clinic_id
            AND clinic_staff.user_id = auth.uid()
            AND clinic_staff.status = 'active'
        )
    );

CREATE INDEX IF NOT EXISTS idx_equipment_assets_clinic ON equipment_assets(clinic_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Clinic commerce settings (pharmacy/lab partner toggles, markup, delivery)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clinic_commerce_settings (
    clinic_id uuid PRIMARY KEY REFERENCES clinics(id) ON DELETE CASCADE,
    commerce_enabled boolean NOT NULL DEFAULT false,
    pharmacy_enabled boolean NOT NULL DEFAULT false,
    lab_enabled boolean NOT NULL DEFAULT false,
    pharmacy_markup_percent numeric NOT NULL DEFAULT 0,
    lab_markup_percent numeric NOT NULL DEFAULT 0,
    delivery_fee numeric NOT NULL DEFAULT 0,
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE clinic_commerce_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic owners can manage commerce settings"
    ON clinic_commerce_settings FOR ALL
    USING (auth.uid() = clinic_id)
    WITH CHECK (auth.uid() = clinic_id);

CREATE POLICY "Active staff can view commerce settings"
    ON clinic_commerce_settings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff
            WHERE clinic_staff.clinic_id = clinic_commerce_settings.clinic_id
            AND clinic_staff.user_id = auth.uid()
            AND clinic_staff.status = 'active'
        )
    );
