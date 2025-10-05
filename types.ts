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
  type: 'Lab Report' | 'Prescription' | 'Imaging' | 'Consultation Note' | 'Analyzed Document';
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
  takenToday: boolean;
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
}


// Defines the structure for a vital sign entry.
export interface Vital {
  date: string; // YYYY-MM-DD
  sugar: number;
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
}