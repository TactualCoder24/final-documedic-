// Defines the structure for a user object, used for authentication context.
// This provides a consistent, minimal type that is compatible with the Firebase User object.
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Defines the structure for a medical record entry.
export interface MedicalRecord {
  id: string;
  name: string;
  type: 'Lab Report' | 'Prescription' | 'Imaging' | 'Consultation Note';
  date: string;
  fileUrl: string;
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
  time: string;
  description: string;
}

// Defines the structure for a vital sign entry.
export interface Vital {
  date: string;
  systolic: number;
  diastolic: number;
  sugar: number;
}
