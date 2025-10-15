import { MedicalRecord, Medication, Reminder, Vital, Profile, Appointment, DocumentAnalysis, Symptom, FoodLog, CommunityPost } from '../types';

// This URL points to a live, cloud-hosted JSON bin.
// All application data will be stored here.
const DB_URL = 'https://api.npoint.io/080c548392182282531e';

export interface UserData {
  records: MedicalRecord[];
  medications: Medication[];
  reminders: Reminder[];
  appointments: Appointment[];
  symptoms: Symptom[];
  vitals: Vital[];
  profile: Profile;
  foodLogs: FoodLog[];
  waterIntake: { [date: string]: number }; // Key is 'YYYY-MM-DD'
  password?: string; // For email/password authentication
}

interface AppData {
  users: Record<string, UserData>;
  communityPosts: CommunityPost[];
}


// --- Internal Helper Functions ---

const getAllData = async (): Promise<AppData> => {
  try {
    const response = await fetch(DB_URL);
    if (!response.ok) {
        console.error("Failed to fetch data, starting with a clean slate.");
        return { users: {}, communityPosts: [] };
    }
    const data = await response.json();
    if (data && data.users && Array.isArray(data.communityPosts)) {
        return data;
    }
    // Data is malformed, return default state
    return { users: {}, communityPosts: [] };
  } catch (e) {
    console.error("Failed to fetch data from cloud", e);
    // On network error, return default state
    return { users: {}, communityPosts: [] };
  }
};


const saveAllData = async (data: AppData) => {
    try {
        await fetch(DB_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    } catch (e) {
        console.error("Failed to save data to cloud", e);
    }
};

const getUserData = async (userId: string): Promise<UserData> => {
  const allData = await getAllData();
  return allData.users[userId] || {
    records: [],
    medications: [],
    reminders: [],
    appointments: [],
    symptoms: [],
    vitals: [],
    profile: {},
    foodLogs: [],
    waterIntake: {},
  };
};

const saveUserData = async (userId: string, data: UserData) => {
  const allData = await getAllData();
  allData.users[userId] = data;
  await saveAllData(allData);
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


// --- User Management for Auth ---
export const findUserByEmail = async (email: string): Promise<{ userId: string; userData: UserData } | null> => {
    const allData = await getAllData();
    const userId = Object.keys(allData.users).find(uid => uid.toLowerCase() === email.toLowerCase());
    if (userId) {
        return { userId, userData: allData.users[userId] };
    }
    return null;
};

export const createUser = async (email: string, password?: string): Promise<void> => {
    const allData = await getAllData();
    const newUserData: UserData = {
        records: [],
        medications: [],
        reminders: [],
        appointments: [],
        symptoms: [],
        vitals: [],
        profile: {},
        foodLogs: [],
        waterIntake: {},
        ...(password && { password }),
    };
    allData.users[email] = newUserData; // Use email as the key/ID for simplicity
    await saveAllData(allData);
};


// --- Public API ---

// Profile
export const getProfile = async (userId: string): Promise<Profile> => (await getUserData(userId)).profile;
export const saveProfile = async (userId: string, profile: Profile): Promise<void> => {
  const data = await getUserData(userId);
  data.profile = profile;
  await saveUserData(userId, data);
};

// Vitals
export const getVitals = async (userId: string): Promise<Vital[]> => (await getUserData(userId)).vitals;
export const addVital = async (userId: string, newVital: { sugar: number }): Promise<void> => {
  const data = await getUserData(userId);
  const today = getTodayDateString();
  const existingIndex = data.vitals.findIndex(v => v.date === today);
  
  if (existingIndex > -1) {
    data.vitals[existingIndex] = { ...data.vitals[existingIndex], ...newVital, date: today };
  } else {
    data.vitals.push({ ...newVital, date: today });
  }

  data.vitals.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  await saveUserData(userId, data);
};

// Records
export const getRecords = async (userId: string): Promise<MedicalRecord[]> => (await getUserData(userId)).records;
export const addRecord = async (
  userId: string, 
  recordInfo: { 
    name: string; 
    type: MedicalRecord['type']; 
    file: File 
  },
  analysis?: DocumentAnalysis
): Promise<void> => {
  const data = await getUserData(userId);
  const recordDate = getTodayDateString();
  const fileUrl = await fileToDataUrl(recordInfo.file);
  
  const newRecord: MedicalRecord = {
    id: Date.now().toString(),
    name: recordInfo.name,
    type: analysis ? 'Analyzed Document' : recordInfo.type,
    date: recordDate,
    fileUrl: fileUrl,
    analysis: analysis,
  };
  data.records.unshift(newRecord);
  await saveUserData(userId, data);
};
export const deleteRecord = async (userId: string, recordId: string): Promise<void> => {
  const data = await getUserData(userId);
  data.records = data.records.filter(r => r.id !== recordId);
  await saveUserData(userId, data);
};

// Medications
export const getMedications = async (userId: string): Promise<Medication[]> => (await getUserData(userId)).medications;
export const addMedication = async (userId: string, med: Omit<Medication, 'id' | 'takenToday'>): Promise<void> => {
  const data = await getUserData(userId);
  const newMed: Medication = { ...med, id: Date.now().toString(), takenToday: false };
  data.medications.push(newMed);
  await saveUserData(userId, data);
};
export const updateMedication = async (userId: string, updatedMed: Medication): Promise<void> => {
  const data = await getUserData(userId);
  data.medications = data.medications.map(m => m.id === updatedMed.id ? updatedMed : m);
  await saveUserData(userId, data);
};
export const deleteMedication = async (userId: string, medId: string): Promise<void> => {
  const data = await getUserData(userId);
  data.medications = data.medications.filter(m => m.id !== medId);
  await saveUserData(userId, data);
};

// Reminders
export const getReminders = async (userId: string): Promise<Reminder[]> => {
    const data = await getUserData(userId);
    const validReminders = (data.reminders || []).filter(r => r && r.time);
    return validReminders.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
};
export const addReminder = async (userId: string, reminder: Omit<Reminder, 'id'>): Promise<void> => {
  const data = await getUserData(userId);
  const newReminder: Reminder = { ...reminder, id: Date.now().toString() };
  data.reminders.push(newReminder);
  await saveUserData(userId, data);
};
export const deleteReminder = async (userId: string, reminderId: string): Promise<void> => {
  const data = await getUserData(userId);
  data.reminders = data.reminders.filter(r => r.id !== reminderId);
  await saveUserData(userId, data);
};

// Appointments
export const getAppointments = async (userId: string): Promise<Appointment[]> => {
    const data = await getUserData(userId);
    const validAppointments = (data.appointments || []).filter(a => a && a.dateTime);
    return validAppointments.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
};
export const addAppointment = async (userId: string, appointment: Omit<Appointment, 'id'>): Promise<void> => {
  const data = await getUserData(userId);
  const newAppointment: Appointment = { ...appointment, id: Date.now().toString() };
  data.appointments.push(newAppointment);
  await saveUserData(userId, data);
};
export const deleteAppointment = async (userId: string, appointmentId: string): Promise<void> => {
  const data = await getUserData(userId);
  data.appointments = data.appointments.filter(a => a.id !== appointmentId);
  await saveUserData(userId, data);
};

// Symptoms
export const getSymptoms = async (userId: string): Promise<Symptom[]> => {
    const data = await getUserData(userId);
    const validSymptoms = (data.symptoms || []).filter(s => s && s.date);
    return validSymptoms.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
export const addSymptom = async (userId: string, symptom: Omit<Symptom, 'id'>): Promise<void> => {
  const data = await getUserData(userId);
  const newSymptom: Symptom = { ...symptom, id: Date.now().toString() };
  data.symptoms.push(newSymptom);
  await saveUserData(userId, data);
};
export const deleteSymptom = async (userId: string, symptomId: string): Promise<void> => {
  const data = await getUserData(userId);
  data.symptoms = data.symptoms.filter(s => s.id !== symptomId);
  await saveUserData(userId, data);
};

// Water Intake
export const getWaterIntake = async (userId: string, date: string): Promise<number> => {
    const data = await getUserData(userId);
    return data.waterIntake?.[date] || 0;
};
export const updateWaterIntake = async (userId: string, date: string, change: number): Promise<void> => {
    const data = await getUserData(userId);
    if (!data.waterIntake) {
        data.waterIntake = {};
    }
    const currentIntake = data.waterIntake[date] || 0;
    data.waterIntake[date] = Math.max(0, currentIntake + change);
    await saveUserData(userId, data);
};

// Food Logs
export const getFoodLogs = async (userId: string): Promise<FoodLog[]> => {
    const data = await getUserData(userId);
    const validLogs = (data.foodLogs || []).filter(l => l && l.date);
    return validLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
export const addFoodLog = async (userId: string, log: Omit<FoodLog, 'id'>): Promise<void> => {
    const data = await getUserData(userId);
    const newLog: FoodLog = { ...log, id: Date.now().toString() };
    data.foodLogs.push(newLog);
    await saveUserData(userId, data);
};
export const deleteFoodLog = async (userId: string, logId: string): Promise<void> => {
    const data = await getUserData(userId);
    data.foodLogs = data.foodLogs.filter(l => l.id !== logId);
    await saveUserData(userId, data);
};


// --- Community ---
export const getCommunityPosts = async (): Promise<CommunityPost[]> => {
    const allData = await getAllData();
    const posts = allData.communityPosts || [];
    return posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const addCommunityPost = async (
  userId: string, 
  post: Omit<CommunityPost, 'id' | 'authorId' | 'authorName' | 'authorPhotoURL' | 'timestamp'>, 
  author: { name: string; photoURL: string | null }
): Promise<void> => {
    const allData = await getAllData();
    if (!allData.communityPosts) {
        allData.communityPosts = [];
    }
    const newPost: CommunityPost = {
        ...post,
        id: Date.now().toString(),
        authorId: userId,
        authorName: author.name,
        authorPhotoURL: author.photoURL,
        timestamp: new Date().toISOString(),
    };
    allData.communityPosts.push(newPost);
    await saveAllData(allData);
};

export const deleteCommunityPost = async (postId: string): Promise<void> => {
    const allData = await getAllData();
    allData.communityPosts = (allData.communityPosts || []).filter(p => p.id !== postId);
    await saveAllData(allData);
};


// Full Data & Data Management
export const getFullUserData = async (userId: string): Promise<UserData> => await getUserData(userId);

export const importUserData = async (userId: string, jsonData: string): Promise<boolean> => {
  try {
    const dataToImport = JSON.parse(jsonData) as UserData;
    if (dataToImport && 'records' in dataToImport && 'profile' in dataToImport) {
        await saveUserData(userId, dataToImport);
        return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to import data:", error);
    return false;
  }
};

export const deleteUserData = async (userId: string): Promise<void> => {
    const allData = await getAllData();
    delete allData.users[userId];
    await saveAllData(allData);
};
