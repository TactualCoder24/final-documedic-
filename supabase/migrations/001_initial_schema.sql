-- DocuMedic Database Schema for Supabase
-- This migration creates all necessary tables and Row Level Security policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  age TEXT,
  conditions TEXT,
  goals TEXT,
  blood_type TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  target_blood_sugar TEXT,
  water_goal INTEGER DEFAULT 8,
  personal_history TEXT,
  family_history TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- MEDICAL RECORDS TABLE
-- ============================================================================
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Lab Report', 'Prescription', 'Imaging', 'Consultation Note', 'Analyzed Document', 'Visit Summary')),
  date DATE NOT NULL,
  file_url TEXT NOT NULL,
  analysis JSONB, -- Stores DocumentAnalysis as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for medical_records
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medical records"
  ON medical_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medical records"
  ON medical_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medical records"
  ON medical_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medical records"
  ON medical_records FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- MEDICATIONS TABLE
-- ============================================================================
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  times TEXT[],
  taken_today BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for medications
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medications"
  ON medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medications"
  ON medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medications"
  ON medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medications"
  ON medications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- VITALS TABLE
-- ============================================================================
CREATE TABLE vitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  sugar INTEGER,
  systolic INTEGER,
  diastolic INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- RLS Policies for vitals
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vitals"
  ON vitals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vitals"
  ON vitals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vitals"
  ON vitals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vitals"
  ON vitals FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- APPOINTMENTS TABLE
-- ============================================================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  doctor_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  notes TEXT,
  type TEXT NOT NULL CHECK (type IN ('In-Person', 'Video')),
  e_check_in_complete BOOLEAN DEFAULT FALSE,
  on_waitlist BOOLEAN DEFAULT FALSE,
  summary_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments"
  ON appointments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- REMINDERS TABLE
-- ============================================================================
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for reminders
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- SYMPTOMS TABLE
-- ============================================================================
CREATE TABLE symptoms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  name TEXT NOT NULL,
  severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for symptoms
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own symptoms"
  ON symptoms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptoms"
  ON symptoms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptoms"
  ON symptoms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own symptoms"
  ON symptoms FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FOOD LOGS TABLE
-- ============================================================================
CREATE TABLE food_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for food_logs
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own food logs"
  ON food_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food logs"
  ON food_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food logs"
  ON food_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food logs"
  ON food_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- WATER INTAKE TABLE
-- ============================================================================
CREATE TABLE water_intake (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  glasses INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- RLS Policies for water_intake
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own water intake"
  ON water_intake FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water intake"
  ON water_intake FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own water intake"
  ON water_intake FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own water intake"
  ON water_intake FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TEST RESULTS TABLE
-- ============================================================================
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Final', 'Pending')),
  provider TEXT NOT NULL,
  details JSONB NOT NULL, -- Array of TestResultDetail
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for test_results
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own test results"
  ON test_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test results"
  ON test_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own test results"
  ON test_results FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own test results"
  ON test_results FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- ALLERGIES TABLE
-- ============================================================================
CREATE TABLE allergies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  reaction TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Mild', 'Moderate', 'Severe')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for allergies
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own allergies"
  ON allergies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own allergies"
  ON allergies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own allergies"
  ON allergies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own allergies"
  ON allergies FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- HEALTH ISSUES TABLE
-- ============================================================================
CREATE TABLE health_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  onset_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for health_issues
ALTER TABLE health_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health issues"
  ON health_issues FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health issues"
  ON health_issues FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health issues"
  ON health_issues FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health issues"
  ON health_issues FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- IMMUNIZATIONS TABLE
-- ============================================================================
CREATE TABLE immunizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  provider TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for immunizations
ALTER TABLE immunizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own immunizations"
  ON immunizations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own immunizations"
  ON immunizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own immunizations"
  ON immunizations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own immunizations"
  ON immunizations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PREVENTIVE CARE TABLE
-- ============================================================================
CREATE TABLE preventive_care (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Due', 'Overdue', 'Up-to-date')),
  last_completed DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for preventive_care
ALTER TABLE preventive_care ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preventive care"
  ON preventive_care FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preventive care"
  ON preventive_care FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preventive care"
  ON preventive_care FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preventive care"
  ON preventive_care FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- CARE PLANS TABLE
-- ============================================================================
CREATE TABLE care_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  condition_name TEXT NOT NULL,
  related_medication_ids UUID[],
  related_test_result_ids UUID[],
  goals JSONB NOT NULL, -- Array of CarePlanGoal
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for care_plans
ALTER TABLE care_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own care plans"
  ON care_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own care plans"
  ON care_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own care plans"
  ON care_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own care plans"
  ON care_plans FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- GROWTH RECORDS TABLE
-- ============================================================================
CREATE TABLE growth_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  age INTEGER NOT NULL, -- in months
  weight NUMERIC(5,2), -- in kg
  height NUMERIC(5,2), -- in cm
  head_circumference NUMERIC(5,2), -- in cm
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for growth_records
ALTER TABLE growth_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own growth records"
  ON growth_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own growth records"
  ON growth_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own growth records"
  ON growth_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own growth records"
  ON growth_records FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- QUESTIONNAIRES TABLE
-- ============================================================================
CREATE TABLE questionnaires (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for questionnaires
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own questionnaires"
  ON questionnaires FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own questionnaires"
  ON questionnaires FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questionnaires"
  ON questionnaires FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own questionnaires"
  ON questionnaires FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- AFTER VISIT SUMMARIES TABLE
-- ============================================================================
CREATE TABLE after_visit_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  visit_reason TEXT NOT NULL,
  clinical_notes TEXT NOT NULL,
  follow_up_instructions TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for after_visit_summaries
ALTER TABLE after_visit_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own visit summaries"
  ON after_visit_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visit summaries"
  ON after_visit_summaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visit summaries"
  ON after_visit_summaries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own visit summaries"
  ON after_visit_summaries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TESTS AND PROCEDURES TABLE
-- ============================================================================
CREATE TABLE tests_and_procedures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  instructions TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for tests_and_procedures
ALTER TABLE tests_and_procedures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tests and procedures"
  ON tests_and_procedures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tests and procedures"
  ON tests_and_procedures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tests and procedures"
  ON tests_and_procedures FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tests and procedures"
  ON tests_and_procedures FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- COMMUNITY POSTS TABLE (Shared across all users)
-- ============================================================================
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_photo_url TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for community_posts
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community posts"
  ON community_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own community posts"
  ON community_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own community posts"
  ON community_posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own community posts"
  ON community_posts FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================================================
-- CARE LOCATIONS TABLE (Shared, read-only for users)
-- ============================================================================
CREATE TABLE care_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Urgent Care', 'Emergency Room')),
  address TEXT NOT NULL,
  wait_time INTEGER NOT NULL, -- in minutes
  distance NUMERIC(5,2) NOT NULL, -- in km
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for care_locations
ALTER TABLE care_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view care locations"
  ON care_locations FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vitals_updated_at BEFORE UPDATE ON vitals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_symptoms_updated_at BEFORE UPDATE ON symptoms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_logs_updated_at BEFORE UPDATE ON food_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_water_intake_updated_at BEFORE UPDATE ON water_intake
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_results_updated_at BEFORE UPDATE ON test_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_allergies_updated_at BEFORE UPDATE ON allergies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_issues_updated_at BEFORE UPDATE ON health_issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_immunizations_updated_at BEFORE UPDATE ON immunizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preventive_care_updated_at BEFORE UPDATE ON preventive_care
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_care_plans_updated_at BEFORE UPDATE ON care_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_growth_records_updated_at BEFORE UPDATE ON growth_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questionnaires_updated_at BEFORE UPDATE ON questionnaires
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_after_visit_summaries_updated_at BEFORE UPDATE ON after_visit_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tests_and_procedures_updated_at BEFORE UPDATE ON tests_and_procedures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_care_locations_updated_at BEFORE UPDATE ON care_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_medical_records_user_id ON medical_records(user_id);
CREATE INDEX idx_medical_records_date ON medical_records(date DESC);

CREATE INDEX idx_medications_user_id ON medications(user_id);
CREATE INDEX idx_medications_is_active ON medications(is_active);

CREATE INDEX idx_vitals_user_id ON vitals(user_id);
CREATE INDEX idx_vitals_date ON vitals(date DESC);

CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date_time ON appointments(date_time);

CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_time ON reminders(time);

CREATE INDEX idx_symptoms_user_id ON symptoms(user_id);
CREATE INDEX idx_symptoms_date ON symptoms(date DESC);

CREATE INDEX idx_food_logs_user_id ON food_logs(user_id);
CREATE INDEX idx_food_logs_date ON food_logs(date DESC);

CREATE INDEX idx_community_posts_timestamp ON community_posts(timestamp DESC);
CREATE INDEX idx_community_posts_author_id ON community_posts(author_id);

-- ============================================================================
-- SEED DATA (Optional - for care locations)
-- ============================================================================

INSERT INTO care_locations (name, type, address, wait_time, distance) VALUES
  ('Apollo Urgent Care', 'Urgent Care', '123 Health St, Sector 2', 25, 2.1),
  ('Fortis Emergency Center', 'Emergency Room', '456 Wellness Ave, Sector 5', 10, 4.5),
  ('Max Health Clinic', 'Urgent Care', '789 Life Blvd, Sector 10', 40, 6.8);
