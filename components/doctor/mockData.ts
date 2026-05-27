import { Vital, MedicalRecord, Medication, Reminder, Profile, Symptom, TestOrProcedure } from '../../types';

export interface MockPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  photoURL: string;
  healthScore: number;
  condition: string;
  lastVisit: string;
  vitals: Vital[];
  medications: Medication[];
  records: MedicalRecord[];
  alerts: string[];
}

const getTodayDateString = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

const today = getTodayDateString();

export const mockPatients: MockPatient[] = [
  {
    id: 'p1',
    name: 'Sarah Jenkins',
    age: 42,
    gender: 'Female',
    photoURL: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random',
    healthScore: 68,
    condition: 'Type 2 Diabetes',
    lastVisit: '2026-05-10',
    alerts: ['Elevated blood sugar reading', 'Missed Metformin yesterday'],
    vitals: [
      { date: '2026-05-20', sugar: 110, systolic: 120, diastolic: 80 },
      { date: '2026-05-22', sugar: 125, systolic: 118, diastolic: 79 },
      { date: '2026-05-24', sugar: 135, systolic: 122, diastolic: 82 },
      { date: '2026-05-26', sugar: 150, systolic: 125, diastolic: 85 },
      { date: today, sugar: 165, systolic: 130, diastolic: 88 },
    ],
    medications: [
      { id: 'm1', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', takenToday: false, isActive: true },
      { id: 'm2', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', takenToday: true, isActive: true }
    ],
    records: [
      {
        id: 'r1', name: 'HbA1c Lab Report', type: 'Lab Report', date: '2026-05-15', fileUrl: '',
        analysis: { summary: 'HbA1c levels have increased from 6.5% to 7.2%. Re-evaluate diet and medication adherence.', classification: 'Lab Report' }
      }
    ]
  },
  {
    id: 'p2',
    name: 'Michael Chen',
    age: 55,
    gender: 'Male',
    photoURL: 'https://ui-avatars.com/api/?name=Michael+Chen&background=random',
    healthScore: 92,
    condition: 'Hypertension (Controlled)',
    lastVisit: '2026-04-20',
    alerts: [],
    vitals: [
      { date: '2026-05-20', systolic: 125, diastolic: 82 },
      { date: '2026-05-23', systolic: 122, diastolic: 80 },
      { date: '2026-05-26', systolic: 120, diastolic: 78 },
      { date: today, systolic: 118, diastolic: 76 },
    ],
    medications: [
      { id: 'm3', name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', takenToday: true, isActive: true }
    ],
    records: [
      {
        id: 'r2', name: 'Annual Physical Summary', type: 'Visit Summary', date: '2026-04-20', fileUrl: '',
        analysis: { summary: 'Patient is doing well. Blood pressure is well-controlled. Continue current medication regimen.', classification: 'Visit Summary' }
      }
    ]
  },
  {
    id: 'p3',
    name: 'Emma Thompson',
    age: 28,
    gender: 'Female',
    photoURL: 'https://ui-avatars.com/api/?name=Emma+Thompson&background=random',
    healthScore: 85,
    condition: 'Asthma',
    lastVisit: '2026-05-25',
    alerts: ['Recent ER visit for exacerbation'],
    vitals: [
      { date: today, systolic: 110, diastolic: 70 },
    ],
    medications: [
      { id: 'm4', name: 'Albuterol Inhaler', dosage: '90mcg', frequency: 'As needed', takenToday: true, isActive: true },
      { id: 'm5', name: 'Fluticasone', dosage: '110mcg', frequency: 'Twice daily', takenToday: true, isActive: true }
    ],
    records: [
      {
        id: 'r3', name: 'ER Discharge Summary', type: 'Visit Summary', date: '2026-05-25', fileUrl: '',
        analysis: { summary: 'Patient presented with acute asthma exacerbation. Treated with nebulized albuterol and oral corticosteroids. Discharged with instructions to follow up in 1-2 days.', triage: { urgency: 'Urgent' }, classification: 'Visit Summary' }
      }
    ]
  }
];

export const mockAppointments = [
  { id: 'a1', patientId: 'p1', patientName: 'Sarah Jenkins', time: '09:00 AM', date: today, type: 'Video', status: 'Upcoming' },
  { id: 'a2', patientId: 'p2', patientName: 'Michael Chen', time: '10:30 AM', date: today, type: 'In-Person', status: 'Upcoming' },
  { id: 'a3', patientId: 'p3', patientName: 'Emma Thompson', time: '01:00 PM', date: today, type: 'Video', status: 'Upcoming' },
  { id: 'a4', patientId: 'p4', patientName: 'David Lee', time: '03:15 PM', date: today, type: 'In-Person', status: 'Upcoming' },
];
