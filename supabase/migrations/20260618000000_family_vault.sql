-- Family Health Vault migration
-- Run this entire block in the Supabase SQL Editor.

-- ============================================================================
-- 1. family_pins
-- ============================================================================

CREATE TABLE IF NOT EXISTS family_pins (
    pin              VARCHAR(6)               PRIMARY KEY,
    patient_id       UUID                     REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    expires_at       TIMESTAMP WITH TIME ZONE NOT NULL,
    relationship     TEXT                     NOT NULL DEFAULT 'family',
    permission_level TEXT                     NOT NULL DEFAULT 'view_only'
                                              CHECK (permission_level IN ('view_only', 'manage')),
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE family_pins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patient can manage their own family pins"    ON family_pins;
DROP POLICY IF EXISTS "Authenticated users can look up a family pin" ON family_pins;
DROP POLICY IF EXISTS "Authenticated users can consume a family pin" ON family_pins;

CREATE POLICY "Patient can manage their own family pins"
    ON family_pins FOR ALL
    USING  (auth.uid() = patient_id)
    WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Authenticated users can look up a family pin"
    ON family_pins FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can consume a family pin"
    ON family_pins FOR DELETE TO authenticated
    USING (true);

-- ============================================================================
-- 2. family_connections
-- ============================================================================

CREATE TABLE IF NOT EXISTS family_connections (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    caregiver_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    relationship     TEXT NOT NULL DEFAULT 'family',
    permission_level TEXT NOT NULL DEFAULT 'view_only'
                          CHECK (permission_level IN ('view_only', 'manage')),
    status           TEXT NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'revoked')),
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (patient_id, caregiver_id)
);

ALTER TABLE family_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own family connections"  ON family_connections;
DROP POLICY IF EXISTS "Caregiver can create a family connection"     ON family_connections;
DROP POLICY IF EXISTS "Either party can update a family connection"  ON family_connections;
DROP POLICY IF EXISTS "Either party can delete a family connection"  ON family_connections;

CREATE POLICY "Users can view their own family connections"
    ON family_connections FOR SELECT
    USING (auth.uid() = patient_id OR auth.uid() = caregiver_id);

CREATE POLICY "Caregiver can create a family connection"
    ON family_connections FOR INSERT
    WITH CHECK (auth.uid() = caregiver_id);

CREATE POLICY "Either party can update a family connection"
    ON family_connections FOR UPDATE
    USING  (auth.uid() = patient_id OR auth.uid() = caregiver_id)
    WITH CHECK (auth.uid() = patient_id OR auth.uid() = caregiver_id);

CREATE POLICY "Either party can delete a family connection"
    ON family_connections FOR DELETE
    USING (auth.uid() = patient_id OR auth.uid() = caregiver_id);

-- ============================================================================
-- 3. is_family_caregiver_of() — SECURITY DEFINER helper
-- ============================================================================

DROP FUNCTION IF EXISTS is_family_caregiver_of(uuid) CASCADE;

CREATE FUNCTION is_family_caregiver_of(target_patient_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM family_connections
    WHERE family_connections.patient_id   = target_patient_id
      AND family_connections.caregiver_id = auth.uid()
      AND family_connections.status       = 'active'
  );
$$;

REVOKE ALL  ON FUNCTION is_family_caregiver_of(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_family_caregiver_of(uuid) TO authenticated;

-- ============================================================================
-- 4. Caregiver read policies on PHI tables
-- ============================================================================

DROP POLICY IF EXISTS "Profiles viewable by family caregiver"            ON profiles;
DROP POLICY IF EXISTS "Family caregivers can view patient medications"    ON medications;
DROP POLICY IF EXISTS "Family caregivers can view patient appointments"   ON appointments;
DROP POLICY IF EXISTS "Family caregivers can view patient allergies"      ON allergies;
DROP POLICY IF EXISTS "Family caregivers can view patient immunizations"  ON immunizations;

CREATE POLICY "Profiles viewable by family caregiver"
    ON profiles FOR SELECT
    USING (is_family_caregiver_of(profiles.id));

CREATE POLICY "Family caregivers can view patient medications"
    ON medications FOR SELECT
    USING (is_family_caregiver_of(medications.user_id));

CREATE POLICY "Family caregivers can view patient appointments"
    ON appointments FOR SELECT
    USING (is_family_caregiver_of(appointments.user_id));

CREATE POLICY "Family caregivers can view patient allergies"
    ON allergies FOR SELECT
    USING (is_family_caregiver_of(allergies.user_id));

CREATE POLICY "Family caregivers can view patient immunizations"
    ON immunizations FOR SELECT
    USING (is_family_caregiver_of(immunizations.user_id));

-- ============================================================================
-- 5. Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_family_pins_patient          ON family_pins(patient_id);
CREATE INDEX IF NOT EXISTS idx_family_connections_patient   ON family_connections(patient_id);
CREATE INDEX IF NOT EXISTS idx_family_connections_caregiver ON family_connections(caregiver_id);
