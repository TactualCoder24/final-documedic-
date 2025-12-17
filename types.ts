// Defines the structure for a user object, used for authentication context.
// This provides a consistent, minimal type that is compatible with the Firebase User object.
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Defines the structure for an AI analysis of a medical document.
export interface ExtractedVital {
  name: string;
  value: string;
  unit?: string;
}

export interface DocumentAnalysis {
  summary: string;
  definitions?: { term: string; definition: string }[];
  vitals?: ExtractedVital[];
}

// Defines the structure for a medical record entry.
export interface MedicalRecord {
  id: string;
  name: string;
  type: 'Lab Report' | 'Prescription' | 'Imaging' | 'Consultation Note' | 'Analyzed Document' | 'Visit Summary';
  date: string; // YYYY-MM-DD
  fileUrl: string; // Data URL
  analysis?: DocumentAnalysis;
}

// Defines the structure for a medication entry.
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times?: string[]; // e.g., ["08:00", "20:00"]
  takenToday: boolean;
  isActive: boolean; // To track if the user is currently taking it
}

// Defines the structure for a reminder.
export interface Reminder {
  id: string;
  title: string;
  time: string; // ISO string for datetime-local input
  description: string;
}

// Defines the structure for a doctor's appointment.
export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  dateTime: string; // ISO string for datetime-local input
  location: string;
  notes?: string;
  type: 'In-Person' | 'Video';
  eCheckInComplete: boolean;
  onWaitlist: boolean;
  summaryId?: string; // Link to an AfterVisitSummary
}

// Defines the structure for a symptom log entry.
export interface Symptom {
  id:string;
  date: string; // ISO string for datetime-local input
  name: string;
  severity: number; // 1-10
  notes?: string;
}

// Defines the structure for a food log entry.
export interface FoodLog {
  id: string;
  date: string; // ISO string for datetime
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  description: string;
}


// Defines the structure for a vital sign entry.
export interface Vital {
  date: string; // YYYY-MM-DD
  sugar?: number;
  systolic?: number;
  diastolic?: number;
}

// Defines the structure for a user's health profile.
export interface Profile {
  age?: string;
  conditions?: string;
  goals?: string;
  bloodType?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  targetBloodSugar?: string;
  waterGoal?: number; // in glasses
  personalHistory?: string;
  familyHistory?: string;
}

// Defines the structure for a chat message with the AI assistant.
export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

// Defines the structure for a mocked access log entry.
export interface AccessLogEntry {
  id: string;
  timestamp: string; // ISO string
  accessor: string;
  action: string;
}

// Defines the structure for a community post.
export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  timestamp: string; // ISO string
}

// Defines the structure for an After Visit Summary.
export interface AfterVisitSummary {
    id: string;
    appointmentId: string;
    visitReason: string;
    clinicalNotes: string;
    followUpInstructions: string;
}

// Defines the structure for an upcoming test or procedure.
export interface TestOrProcedure {
    id: string;
    name: string;
    date: string; // ISO string
    location: string;
    instructions: string;
}

// Defines the structure for a care location (Urgent Care / ER).
export interface CareLocation {
    id:string;
    name: string;
    type: 'Urgent Care' | 'Emergency Room';
    address: string;
    waitTime: number; // in minutes
    distance: number; // in km
}

// Defines the structure for a detailed test result component.
export interface TestResultDetail {
    name: string;
    value: string;
    referenceRange: string;
    isAbnormal: boolean;
}

// Defines the structure for a test result summary.
export interface TestResult {
    id: string;
    name: string;
    date: string; // ISO string
    status: 'Final' | 'Pending';
    provider: string;
    details: TestResultDetail[];
}

// Defines the structure for an allergy.
export interface Allergy {
    id: string;
    name: string;
    reaction: string;
    severity: 'Mild' | 'Moderate' | 'Severe';
}

// Defines the structure for a health issue.
export interface HealthIssue {
    id: string;
    name: string;
    onset_date: string; // YYYY-MM-DD
}

// Defines the structure for an immunization record.
export interface Immunization {
    id: string;
    name: string;
    date: string; // YYYY-MM-DD
    provider: string;
}

// Defines the structure for a preventive care item.
export interface PreventiveCareItem {
    id: string;
    name: string;
    dueDate: string; // YYYY-MM-DD
    status: 'Due' | 'Overdue' | 'Up-to-date';
    lastCompleted?: string; // YYYY-MM-DD
}

// Defines a goal for a care plan.
export interface CarePlanGoal {
    id: string;
    description: string;
    isComplete: boolean;
}

// Defines the structure for a specific plan of care.
export interface CarePlan {
    id: string;
    conditionName: string;
    relatedMedicationIds: string[];
    relatedTestResultIds: string[];
    goals: CarePlanGoal[];
}

// Defines a single data point for a growth chart.
export interface GrowthRecord {
    age: number; // in months
    weight?: number; // in kg
    height?: number; // in cm
    headCircumference?: number; // in cm
}

// Defines a questionnaire from a provider.
export interface Questionnaire {
    id: string;
    title: string;
    provider: string;
    dueDate: string; // YYYY-MM-DD
    status: 'Pending' | 'Completed';
}