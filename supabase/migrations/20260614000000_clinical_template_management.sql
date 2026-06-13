-- Doctor-customizable clinical template management
--
-- Adds a sort_order column to clinical_templates so doctors can reorder
-- (and effectively "favorite" by moving to the top) their saved Rx-groups,
-- complaint shortcuts, and test panels. Lower sort_order sorts first.

ALTER TABLE clinical_templates ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_clinical_templates_doctor_type_sort
    ON clinical_templates(doctor_id, type, sort_order);
