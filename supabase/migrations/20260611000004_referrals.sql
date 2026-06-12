-- Referral management

CREATE TABLE IF NOT EXISTS referrals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    referring_doctor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    referring_doctor_name text,
    patient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    patient_name text,
    referred_to_doctor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    referred_to_name text NOT NULL, -- doctor name (in-app or external)
    specialty text,
    reason text NOT NULL,
    notes text,
    status text NOT NULL DEFAULT 'pending', -- 'pending' | 'acknowledged' | 'completed' | 'declined'
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referring doctors can manage their referrals"
    ON referrals FOR ALL
    USING (auth.uid() = referring_doctor_id)
    WITH CHECK (auth.uid() = referring_doctor_id);

CREATE POLICY "Referred-to doctors can view and update referrals sent to them"
    ON referrals FOR SELECT
    USING (auth.uid() = referred_to_doctor_id);

CREATE POLICY "Referred-to doctors can update referral status"
    ON referrals FOR UPDATE
    USING (auth.uid() = referred_to_doctor_id)
    WITH CHECK (auth.uid() = referred_to_doctor_id);

CREATE POLICY "Patients can view referrals about them"
    ON referrals FOR SELECT
    USING (auth.uid() = patient_id);

CREATE INDEX IF NOT EXISTS idx_referrals_referring_doctor ON referrals(referring_doctor_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_to_doctor ON referrals(referred_to_doctor_id);
