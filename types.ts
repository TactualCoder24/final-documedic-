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

export interface LabResult {
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  interpretation: 'Normal' | 'High' | 'Low' | 'Critical' | 'Unknown';
}

export interface DocumentAnalysis {
  classification?: 'Lab Report' | 'Prescription' | 'Imaging' | 'Consultation Note' | 'Visit Summary' | 'Other';
  pii?: { patientName?: string; age?: string; gender?: string; dob?: string };
  triage?: { urgency: 'Routine' | 'Urgent' | 'Emergency'; recommendedSpecialist?: string; reason?: string };
  summary: string;
  definitions?: { term: string; definition: string }[];
  vitals?: ExtractedVital[];
  labResults?: LabResult[];
  medications?: { name: string; dosage: string; frequency: string; times?: string[] }[];
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
  totalQuantity?: number; // Total doses/pills in the current supply, for refill reminders
  refillReminderSentAt?: string;
}

// Adherence stats for a medication, computed from medication_logs.
export interface MedicationAdherenceStats {
  takenCount: number; // all-time doses logged as taken
  loggedCount: number; // all-time doses logged (taken or missed)
  last30Taken: number;
  last30Logged: number;
}

// Defines the structure for a reminder.
export interface Reminder {
  id: string;
  title: string;
  time: string; // ISO string for datetime-local input
  description: string;
}

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
  status?: 'Scheduled' | 'Waiting' | 'In-Progress' | 'Completed' | 'No-Show' | 'Cancelled';
  patientId?: string; // To fetch patient details on doctor dashboard
  // Heuristic no-show risk for this patient, computed from their past appointment history.
  noShowRisk?: 'low' | 'medium' | 'high';
  noShowRate?: number;
}

// Defines an intake form filled by the patient before the appointment
export interface IntakeForm {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorName: string;
  symptomsDescription: string;
  fileUrl?: string; // Photo/Document URL
  createdAt: string;
  templateId?: string;
  customResponses?: Record<string, string | boolean>;
  signatureDataUrl?: string;
  consentAccepted?: boolean;
}

// Defines a lightweight task for the doctor
export interface DoctorTask {
  id: string;
  doctorId: string;
  patientId?: string; // Optional link
  description: string;
  status: 'todo' | 'done';
  createdAt: string;
}

// Defines the structure for a symptom log entry.
export interface Symptom {
  id: string;
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

// Defines the structure for a sleep log entry.
export interface SleepLog {
  id: string;
  date: string; // YYYY-MM-DD
  hours: number; // total hours slept
  quality: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  bedtime?: string; // e.g., "22:30"
  wakeTime?: string; // e.g., "06:30"
  notes?: string;
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
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
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
  language?: string;
  role?: 'patient' | 'doctor' | 'clinic';
  specialty?: string; // For doctors
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
export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  content: string;
  isAnonymous: boolean;
  likes: string[]; // array of user IDs
  createdAt: string; // ISO string
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  timestamp: string; // ISO string
  category: string;
  isAnonymous: boolean;
  likes: string[]; // array of user IDs
  imageUrl: string | null;
  comments: CommunityComment[];
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
  id: string;
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

// Defines a single medication line item within a prescription.
export interface PrescriptionMedication {
  name: string;
  dosage: string; // e.g. "500mg"
  frequency: string; // e.g. "1-0-1" or "Twice daily"
  duration: string; // e.g. "5 days"
  instructions?: string; // e.g. "After food"
}

// Defines a diagnosis code (ICD-10) attached to a prescription.
export interface DiagnosisCode {
  code: string;
  description: string;
}

// Defines a digital prescription written by a doctor for a patient.
export interface Prescription {
  id: string;
  doctorId: string;
  patientId: string;
  appointmentId?: string;
  diagnosis?: string;
  diagnosisCodes?: DiagnosisCode[];
  medications: PrescriptionMedication[];
  testsAdvised?: string[];
  notes?: string;
  advice?: string;
  followUpDate?: string; // YYYY-MM-DD
  createdAt: string; // ISO string
}

// The kind of one-click clinical quick-template:
// - rx_group: full diagnosis + medications + advice
// - complaint: chief complaint + diagnosis/ICD codes only
// - test_panel: a named set of investigations/tests to advise
export type ClinicalTemplateType = 'rx_group' | 'complaint' | 'test_panel';

// Defines a doctor-saved clinical quick-template ("Rx-group", complaint
// shortcut, or test panel) for one-click loading into the Prescription Writer.
export interface ClinicalTemplate {
  id: string;
  doctorId: string;
  type: ClinicalTemplateType;
  name: string;
  diagnosis?: string;
  diagnosisCodes?: DiagnosisCode[];
  medications: PrescriptionMedication[];
  tests?: string[];
  advice?: string;
  notes?: string;
  sortOrder?: number;
  createdAt: string;
}

// Defines a single line item on an invoice.
export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

// Defines an invoice issued by a doctor to a patient.
export interface Invoice {
  id: string;
  doctorId: string;
  patientId: string;
  patientName?: string;
  appointmentId?: string;
  items: InvoiceItem[];
  total: number;
  status: 'due' | 'paid' | 'partial';
  issuedDate: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string; // ISO string
}

// Defines a dental chart for a patient (FDI tooth numbering).
export interface DentalChart {
  teeth: Record<string, string>; // FDI tooth number -> condition
  notes?: string;
  updatedAt?: string;
}

// Defines a referral sent from one doctor to another (or external) for a patient.
export interface Referral {
  id: string;
  referringDoctorId: string;
  referringDoctorName?: string;
  patientId: string;
  patientName?: string;
  referredToDoctorId?: string;
  referredToName: string;
  specialty?: string;
  reason: string;
  notes?: string;
  status: 'pending' | 'acknowledged' | 'completed' | 'declined';
  createdAt: string;
}

// Defines an in-app message or reminder sent from a doctor to a patient.
export interface PatientMessage {
  id: string;
  doctorId: string;
  doctorName?: string;
  patientId: string;
  type: 'message' | 'reminder';
  title: string;
  body?: string;
  scheduledFor?: string;
  isRead: boolean;
  createdAt: string;
}

// Defines a recurring weekly availability slot for a doctor's public booking page.
export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: number; // 0 = Sunday ... 6 = Saturday
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  slotDurationMinutes: number;
}

// Defines an appointment booking request submitted via a doctor's public page.
export interface BookingRequest {
  id: string;
  doctorId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  requestedDateTime: string;
  reason?: string;
  status: 'pending' | 'confirmed' | 'declined';
  createdAt: string;
}

// Defines a clinic/hospital account (1:1 with a profile of role 'clinic').
export interface Clinic {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  specialties?: string[];
  logoUrl?: string;
  createdAt: string;
}

// Defines a department within a clinic.
export interface Department {
  id: string;
  clinicId: string;
  name: string;
  description?: string;
  createdAt: string;
}

// Defines a staff member (doctor, nurse, front-desk, admin) of a clinic.
export interface ClinicStaff {
  id: string;
  clinicId: string;
  userId?: string;
  staffName?: string;
  staffEmail?: string;
  role: 'doctor' | 'front_desk' | 'nurse' | 'admin';
  departmentId?: string;
  status: 'pending' | 'active' | 'inactive';
  createdAt: string;
}

// Defines a front-desk queue entry for walk-in / checked-in patients.
export interface ClinicQueueEntry {
  id: string;
  clinicId: string;
  patientName: string;
  patientPhone?: string;
  doctorId?: string;
  departmentId?: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  tokenNumber?: number;
  notes?: string;
  checkedInAt: string;
  calledAt?: string;
  completedAt?: string;
}

// Defines an entry in the audit log (compliance / who-did-what tracking).
export interface AuditLogEntry {
  id: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  clinicId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, any>;
  createdAt: string;
}

// Defines an in-app notification.
export interface AppNotification {
  id: string;
  userId: string;
  type: 'appointment' | 'message' | 'referral' | 'billing' | 'review' | 'system';
  title: string;
  body?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

// Defines a patient review/feedback entry.
export interface Review {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId?: string;
  clinicId?: string;
  appointmentId?: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

// Defines per-doctor scheduler configuration.
export interface DoctorScheduleConfig {
  doctorId: string;
  clinicId?: string;
  slotDurationMinutes: number;
  bufferMinutes: number;
  allowOverbooking: boolean;
  walkinPriority: 'fifo' | 'scheduled_first';
  updatedAt: string;
}

// Defines a permission set for a (possibly custom) clinic staff role.
export interface ClinicRolePermissions {
  id: string;
  clinicId: string;
  roleName: string;
  permissions: Record<string, boolean>;
  isCustom: boolean;
  createdAt: string;
}

// Defines a billable service in a clinic's rate card.
export interface ClinicService {
  id: string;
  clinicId: string;
  name: string;
  category: 'consultation' | 'procedure' | 'diagnostic' | 'other';
  price: number;
  taxRate: number;
  isActive: boolean;
  createdAt: string;
}

// Defines a single field in a custom intake form template.
export interface IntakeField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox';
  options?: string[];
  required: boolean;
}

// Defines a clinic-configurable intake form template.
export interface ClinicIntakeTemplate {
  id: string;
  clinicId: string;
  name: string;
  fields: IntakeField[];
  consentText?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Defines a questionnaire from a provider.
export interface Questionnaire {
  id: string;
  title: string;
  provider: string;
  dueDate: string; // YYYY-MM-DD
  status: 'Pending' | 'Completed';
}

// ─── Hospital Ops (Phase 3) ────────────────────────────────────────────────

// Defines a bed/ward slot for in-patient management.
export interface HospitalBed {
  id: string;
  clinicId: string;
  wardName: string;
  bedNumber: string;
  bedType: 'general' | 'private' | 'icu' | 'emergency';
  status: 'available' | 'occupied' | 'maintenance';
  createdAt: string;
}

// Defines an in-patient (IPD) admission record.
export interface IpdAdmission {
  id: string;
  clinicId: string;
  patientId?: string;
  patientName: string;
  bedId?: string;
  admittingDoctorId?: string;
  admittingDoctorName?: string;
  diagnosis?: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  dischargeDate?: string;
  status: 'admitted' | 'discharged';
  notes?: string;
  createdAt: string;
}

// Defines a pharmacy stock item.
export interface PharmacyInventoryItem {
  id: string;
  clinicId: string;
  medicineName: string;
  category?: string;
  sku?: string;
  unit: string;
  stockQuantity: number;
  reorderLevel: number;
  unitPrice: number;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Defines a record of medicine dispensed from pharmacy stock.
export interface PharmacyDispense {
  id: string;
  clinicId: string;
  inventoryId?: string;
  medicineName: string;
  quantity: number;
  patientName?: string;
  dispensedBy?: string;
  dispensedAt: string;
}

// Defines a lab test order and its result tracking.
export interface LabOrder {
  id: string;
  clinicId: string;
  patientId?: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  testName: string;
  status: 'ordered' | 'sample_collected' | 'in_progress' | 'completed' | 'cancelled';
  orderedAt: string;
  resultUrl?: string;
  resultNotes?: string;
  completedAt?: string;
}

// Defines an insurance claim tied to a patient visit/invoice.
export interface InsuranceClaim {
  id: string;
  clinicId: string;
  patientId?: string;
  patientName: string;
  invoiceId?: string;
  insurerName: string;
  policyNumber?: string;
  claimAmount: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'settled';
  submittedAt?: string;
  settledAt?: string;
  notes?: string;
  createdAt: string;
}

// Defines a tracked equipment/asset record.
export interface EquipmentAsset {
  id: string;
  clinicId: string;
  name: string;
  category?: string;
  serialNumber?: string;
  location?: string;
  status: 'operational' | 'maintenance' | 'retired';
  purchaseDate?: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  notes?: string;
  createdAt: string;
}

// Defines clinic-wide commerce settings (pharmacy/lab partner integration toggles).
export interface ClinicCommerceSettings {
  clinicId: string;
  commerceEnabled: boolean;
  pharmacyEnabled: boolean;
  labEnabled: boolean;
  pharmacyMarkupPercent: number;
  labMarkupPercent: number;
  deliveryFee: number;
  updatedAt: string;
}