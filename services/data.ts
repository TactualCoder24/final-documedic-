import { MedicalRecord, Medication, Reminder, Vital, Profile, Appointment, DocumentAnalysis } from '../types';

const STORAGE_KEY = 'documedic-data';

interface UserData {
  records: MedicalRecord[];
  medications: Medication[];
  reminders: Reminder[];
  appointments: Appointment[];
  vitals: Vital[];
  profile: Profile;
}

// --- Internal Helper Functions ---

const getAllData = (): Record<string, UserData> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Failed to parse data from localStorage", e);
    return {};
  }
};

const getUserData = (userId: string): UserData => {
  const allData = getAllData();
  return allData[userId] || {
    records: [],
    medications: [],
    reminders: [],
    appointments: [],
    vitals: [],
    profile: {},
  };
};

const saveUserData = (userId: string, data: UserData) => {
  const allData = getAllData();
  allData[userId] = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
};

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Public API ---

// Profile
export const getProfile = (userId: string): Profile => getUserData(userId).profile;
export const saveProfile = (userId: string, profile: Profile): void => {
  const data = getUserData(userId);
  data.profile = profile;
  saveUserData(userId, data);
};

// Vitals
export const getVitals = (userId: string): Vital[] => getUserData(userId).vitals;
export const addVital = (userId: string, newVital: { sugar: number }): void => {
  const data = getUserData(userId);
  const today = getTodayDateString();
  const existingIndex = data.vitals.findIndex(v => v.date === today);
  
  if (existingIndex > -1) {
    data.vitals[existingIndex] = { ...data.vitals[existingIndex], ...newVital, date: today };
  } else {
    data.vitals.push({ ...newVital, date: today });
  }

  data.vitals.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  saveUserData(userId, data);
};

// Records
export const getRecords = (userId: string): MedicalRecord[] => getUserData(userId).records;
export const addRecord = async (
  userId: string, 
  recordInfo: { 
    name: string; 
    type: MedicalRecord['type']; 
    file: File 
  },
  analysis?: DocumentAnalysis
): Promise<void> => {
  const data = getUserData(userId);
  const recordDate = getTodayDateString(); // Capture date before async operations
  const fileUrl = await fileToDataUrl(recordInfo.file);
  
  const newRecord: MedicalRecord = {
    id: Date.now().toString(),
    name: recordInfo.name,
    type: analysis ? 'Analyzed Document' : recordInfo.type,
    date: recordDate,
    fileUrl: fileUrl,
    analysis: analysis,
  };
  data.records.unshift(newRecord); // Add to the top
  saveUserData(userId, data);
};
export const deleteRecord = (userId: string, recordId: string): void => {
  const data = getUserData(userId);
  data.records = data.records.filter(r => r.id !== recordId);
  saveUserData(userId, data);
};

// Medications
export const getMedications = (userId: string): Medication[] => getUserData(userId).medications;
export const addMedication = (userId: string, med: Omit<Medication, 'id' | 'takenToday'>): void => {
  const data = getUserData(userId);
  const newMed: Medication = { ...med, id: Date.now().toString(), takenToday: false };
  data.medications.push(newMed);
  saveUserData(userId, data);
};
export const updateMedication = (userId: string, updatedMed: Medication): void => {
  const data = getUserData(userId);
  data.medications = data.medications.map(m => m.id === updatedMed.id ? updatedMed : m);
  saveUserData(userId, data);
};
export const deleteMedication = (userId: string, medId: string): void => {
  const data = getUserData(userId);
  data.medications = data.medications.filter(m => m.id !== medId);
  saveUserData(userId, data);
};

// Reminders
export const getReminders = (userId: string): Reminder[] => {
    const data = getUserData(userId);
    // Filter for valid reminders to prevent crashes from malformed data and create a new array.
    const validReminders = (data.reminders || []).filter(r => r && r.time);
    // Sort the valid reminders by time.
    return validReminders.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
};
export const addReminder = (userId: string, reminder: Omit<Reminder, 'id'>): void => {
  const data = getUserData(userId);
  const newReminder: Reminder = { ...reminder, id: Date.now().toString() };
  data.reminders.push(newReminder);
  saveUserData(userId, data);
};
export const deleteReminder = (userId: string, reminderId: string): void => {
  const data = getUserData(userId);
  data.reminders = data.reminders.filter(r => r.id !== reminderId);
  saveUserData(userId, data);
};

// Appointments
export const getAppointments = (userId: string): Appointment[] => {
    const data = getUserData(userId);
    // Filter for valid appointments to prevent crashes from malformed data and create a new array.
    const validAppointments = (data.appointments || []).filter(a => a && a.dateTime);
    // Sort the valid appointments by time.
    return validAppointments.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
};
export const addAppointment = (userId: string, appointment: Omit<Appointment, 'id'>): void => {
  const data = getUserData(userId);
  const newAppointment: Appointment = { ...appointment, id: Date.now().toString() };
  data.appointments.push(newAppointment);
  saveUserData(userId, data);
};
export const deleteAppointment = (userId: string, appointmentId: string): void => {
  const data = getUserData(userId);
  data.appointments = data.appointments.filter(a => a.id !== appointmentId);
  saveUserData(userId, data);
};

// Full Data & Data Management
export const getFullUserData = (userId: string): UserData => getUserData(userId);

export const importUserData = (userId: string, jsonData: string): boolean => {
  try {
    const dataToImport = JSON.parse(jsonData);
    // Basic validation to ensure it's a valid data structure
    if (dataToImport && 'records' in dataToImport && 'profile' in dataToImport) {
        saveUserData(userId, dataToImport);
        return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to import data:", error);
    return false;
  }
};

export const deleteUserData = (userId: string): void => {
    const allData = getAllData();
    delete allData[userId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
};