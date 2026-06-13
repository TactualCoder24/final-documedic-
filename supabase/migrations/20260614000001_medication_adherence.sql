-- Medication adherence tracking & refill reminders
--
-- Adds an optional total_quantity (doses prescribed) + refill_reminder_sent_at
-- to medications, and a medication_logs table recording each day's
-- taken/missed status so adherence % can be computed over time
-- (the existing taken_today flag only reflects "today").

ALTER TABLE medications ADD COLUMN IF NOT EXISTS total_quantity integer;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS refill_reminder_sent_at timestamptz;

CREATE TABLE IF NOT EXISTS medication_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    medication_id uuid REFERENCES medications(id) ON DELETE CASCADE NOT NULL,
    log_date date NOT NULL DEFAULT CURRENT_DATE,
    taken boolean NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE (medication_id, log_date)
);

ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own medication logs"
    ON medication_logs FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_medication_logs_user ON medication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_medication ON medication_logs(medication_id, log_date);
