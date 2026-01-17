import { MedicalRecord, Medication, Reminder, Vital, Profile, Appointment, DocumentAnalysis, Symptom, FoodLog, CommunityPost, AfterVisitSummary, TestOrProcedure, CareLocation, TestResult, Allergy, HealthIssue, Immunization, PreventiveCareItem, CarePlan, GrowthRecord, Questionnaire } from '../types';

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
  afterVisitSummaries: AfterVisitSummary[];
  testsAndProcedures: TestOrProcedure[];
  testResults: TestResult[];
  allergies: Allergy[];
  healthIssues: HealthIssue[];
  immunizations: Immunization[];
  preventiveCare: PreventiveCareItem[];
  carePlans: CarePlan[];
  growthRecords: GrowthRecord[];
  questionnaires: Questionnaire[];
}

interface AppData {
  users: Record<string, UserData>;
  communityPosts: CommunityPost[];
  careLocations: CareLocation[];
}


// --- Internal Helper Functions ---

const getAllData = async (): Promise<AppData> => {
  try {
    const response = await fetch(DB_URL);
    if (!response.ok) {
        console.error("Failed to fetch data, starting with a clean slate.");
        return { users: {}, communityPosts: [], careLocations: MOCK_CARE_LOCATIONS };
    }
    const data = await response.json();
    if (data && data.users && Array.isArray(data.communityPosts)) {
        // Add careLocations if it doesn't exist
        if (!data.careLocations) {
            data.careLocations = MOCK_CARE_LOCATIONS;
        }
        return data;
    }
    // Data is malformed, return default state
    return { users: {}, communityPosts: [], careLocations: MOCK_CARE_LOCATIONS };
  } catch (e) {
    console.error("Failed to fetch data from cloud", e);
    // On network error, return default state
    return { users: {}, communityPosts: [], careLocations: MOCK_CARE_LOCATIONS };
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
    medications: MOCK_MEDICATIONS,
    reminders: [],
    appointments: MOCK_APPOINTMENTS,
    symptoms: [],
    vitals: MOCK_VITALS,
    profile: MOCK_PROFILE,
    foodLogs: [],
    waterIntake: {},
    afterVisitSummaries: MOCK_SUMMARIES,
    testsAndProcedures: MOCK_TESTS,
    testResults: MOCK_TEST_RESULTS,
    allergies: MOCK_ALLERGIES,
    healthIssues: MOCK_HEALTH_ISSUES,
    immunizations: MOCK_IMMUNIZATIONS,
    preventiveCare: MOCK_PREVENTIVE_CARE,
    carePlans: MOCK_CARE_PLANS,
    growthRecords: MOCK_GROWTH_RECORDS,
    questionnaires: MOCK_QUESTIONNAIRES,
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
        medications: MOCK_MEDICATIONS,
        reminders: [],
        appointments: MOCK_APPOINTMENTS,
        symptoms: [],
        vitals: MOCK_VITALS,
        profile: MOCK_PROFILE,
        foodLogs: [],
        waterIntake: {},
        afterVisitSummaries: MOCK_SUMMARIES,
        testsAndProcedures: MOCK_TESTS,
        testResults: MOCK_TEST_RESULTS,
        allergies: MOCK_ALLERGIES,
        healthIssues: MOCK_HEALTH_ISSUES,
        immunizations: MOCK_IMMUNIZATIONS,
        preventiveCare: MOCK_PREVENTIVE_CARE,
        carePlans: MOCK_CARE_PLANS,
        growthRecords: MOCK_GROWTH_RECORDS,
        questionnaires: MOCK_QUESTIONNAIRES,
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
export const addVital = async (userId: string, newVital: { sugar?: number, systolic?: number, diastolic?: number }): Promise<void> => {
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
export const addMedication = async (userId: string, med: Omit<Medication, 'id' | 'takenToday' | 'isActive'>): Promise<void> => {
  const data = await getUserData(userId);
  const newMed: Medication = { ...med, id: Date.now().toString(), takenToday: false, isActive: true };
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
    const validAppointments = (data.appointments || MOCK_APPOINTMENTS).filter(a => a && a.dateTime);
    return validAppointments.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
};
export const addAppointment = async (userId: string, appointment: Omit<Appointment, 'id' | 'eCheckInComplete' | 'onWaitlist'>): Promise<void> => {
  const data = await getUserData(userId);
  const newAppointment: Appointment = { 
    ...appointment, 
    id: Date.now().toString(),
    eCheckInComplete: false,
    onWaitlist: false,
  };
  data.appointments.push(newAppointment);
  await saveUserData(userId, data);
};
export const deleteAppointment = async (userId: string, appointmentId: string): Promise<void> => {
  const data = await getUserData(userId);
  data.appointments = data.appointments.filter(a => a.id !== appointmentId);
  await saveUserData(userId, data);
};
export const updateAppointment = async (userId: string, updatedAppointment: Appointment): Promise<void> => {
    const data = await getUserData(userId);
    const index = data.appointments.findIndex(a => a.id === updatedAppointment.id);
    if (index !== -1) {
        data.appointments[index] = updatedAppointment;
        await saveUserData(userId, data);
    }
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


// --- New Feature Data Getters ---

export const getAfterVisitSummary = async (userId: string, summaryId: string): Promise<AfterVisitSummary | undefined> => {
    const data = await getUserData(userId);
    return (data.afterVisitSummaries || MOCK_SUMMARIES).find(s => s.id === summaryId);
};

export const getTestsAndProcedures = async (userId: string): Promise<TestOrProcedure[]> => {
    const data = await getUserData(userId);
    return (data.testsAndProcedures || MOCK_TESTS).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getCareLocations = async (): Promise<CareLocation[]> => {
    const data = await getAllData();
    return data.careLocations || MOCK_CARE_LOCATIONS;
};

export const getTestResults = async (userId: string): Promise<TestResult[]> => (await getUserData(userId)).testResults;
export const getAllergies = async (userId: string): Promise<Allergy[]> => (await getUserData(userId)).allergies;
export const addAllergy = async (userId: string, allergy: Omit<Allergy, 'id'>): Promise<void> => {
    const data = await getUserData(userId);
    data.allergies.push({ ...allergy, id: Date.now().toString() });
    await saveUserData(userId, data);
};
export const getHealthIssues = async (userId: string): Promise<HealthIssue[]> => (await getUserData(userId)).healthIssues;
export const addHealthIssue = async (userId: string, issue: Omit<HealthIssue, 'id'>): Promise<void> => {
    const data = await getUserData(userId);
    data.healthIssues.push({ ...issue, id: Date.now().toString() });
    await saveUserData(userId, data);
};
export const getImmunizations = async (userId: string): Promise<Immunization[]> => (await getUserData(userId)).immunizations;
export const addImmunization = async (userId: string, immunization: Omit<Immunization, 'id'>): Promise<void> => {
    const data = await getUserData(userId);
    data.immunizations.push({ ...immunization, id: Date.now().toString() });
    await saveUserData(userId, data);
};
export const getPreventiveCare = async (userId: string): Promise<PreventiveCareItem[]> => (await getUserData(userId)).preventiveCare;
export const getCarePlans = async (userId: string): Promise<CarePlan[]> => (await getUserData(userId)).carePlans;
export const getGrowthRecords = async (userId: string): Promise<GrowthRecord[]> => (await getUserData(userId)).growthRecords;
export const getQuestionnaires = async (userId: string): Promise<Questionnaire[]> => (await getUserData(userId)).questionnaires;


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

// --- MOCK DATA ---
const now = new Date();
const MOCK_APPOINTMENTS: Appointment[] = [
    { 
        id: '1', 
        doctorName: 'Dr. Priya Sharma', 
        specialty: 'Cardiologist', 
        dateTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'City Hospital, 2nd Floor', 
        type: 'In-Person', 
        eCheckInComplete: false, 
        onWaitlist: false,
        summaryId: 'summary1'
    },
    { 
        id: '2', 
        doctorName: 'Dr. Anil Kumar', 
        specialty: 'Dermatologist', 
        dateTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(), 
        location: 'Virtual Consultation', 
        type: 'Video', 
        eCheckInComplete: true, 
        onWaitlist: false,
    },
    { 
        id: '3', 
        doctorName: 'Dr. Sunita Reddy', 
        specialty: 'General Physician', 
        dateTime: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Wellness Clinic', 
        type: 'In-Person', 
        eCheckInComplete: true, 
        onWaitlist: false,
        summaryId: 'summary3'
    },
];

const MOCK_SUMMARIES: AfterVisitSummary[] = [
    {
        id: 'summary1',
        appointmentId: '1',
        visitReason: 'Follow-up for high blood pressure.',
        clinicalNotes: 'Patient presents with stable blood pressure readings over the last month. Continue current medication (Lisinopril 10mg). Advised to maintain low-sodium diet and regular exercise. Patient reports no side effects. Vitals: BP 130/85, HR 72.',
        followUpInstructions: 'Return in 3 months for a routine check-up. Continue monitoring blood pressure at home twice a week. Call if systolic pressure exceeds 150.'
    },
    {
        id: 'summary3',
        appointmentId: '3',
        visitReason: 'Annual physical examination.',
        clinicalNotes: 'Patient is in good overall health. Discussed importance of preventive care. All lab results are within normal limits. Reviewed vaccination history and recommended flu shot.',
        followUpInstructions: 'Schedule next annual physical in one year. Follow up if any new symptoms arise. Continue with healthy diet and exercise regimen.'
    }
];

const MOCK_TESTS: TestOrProcedure[] = [
    {
        id: 'test1',
        name: 'Fasting Blood Glucose Test',
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'National Diagnostics Lab, Sector 18',
        instructions: 'Do not eat or drink anything except water for 8 hours before the test.'
    },
    {
        id: 'test2',
        name: 'Annual Eye Exam',
        date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'VisionFirst Eye Care',
        instructions: 'Please bring your current glasses or contact lenses.'
    }
];

const MOCK_CARE_LOCATIONS: CareLocation[] = [
    { id: 'c1', name: 'Apollo Urgent Care', type: 'Urgent Care', address: '123 Health St, Sector 2', waitTime: 25, distance: 2.1 },
    { id: 'c2', name: 'Fortis Emergency Center', type: 'Emergency Room', address: '456 Wellness Ave, Sector 5', waitTime: 10, distance: 4.5 },
    { id: 'c3', name: 'Max Health Clinic', type: 'Urgent Care', address: '789 Life Blvd, Sector 10', waitTime: 40, distance: 6.8 },
];

const MOCK_MEDICATIONS: Medication[] = [
    { id: 'm1', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', takenToday: false, isActive: true },
    { id: 'm2', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', takenToday: false, isActive: true },
    { id: 'm3', name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at night', takenToday: false, isActive: true },
];

const MOCK_VITALS: Vital[] = [
    { date: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], sugar: 110, systolic: 135, diastolic: 88 },
    { date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], sugar: 115, systolic: 132, diastolic: 85 },
    { date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], sugar: 108, systolic: 130, diastolic: 84 },
];

const MOCK_PROFILE: Profile = {};

const MOCK_TEST_RESULTS: TestResult[] = [
    { 
        id: 'tr1', 
        name: 'Comprehensive Metabolic Panel', 
        date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), 
        status: 'Final', 
        provider: 'Dr. Sunita Reddy', 
        details: [
            { name: 'Glucose', value: '115 mg/dL', referenceRange: '65-99', isAbnormal: true },
            { name: 'Sodium', value: '140 mEq/L', referenceRange: '135-145', isAbnormal: false },
            { name: 'Potassium', value: '4.1 mEq/L', referenceRange: '3.5-5.2', isAbnormal: false },
        ]
    },
    { 
        id: 'tr2', 
        name: 'Lipid Panel', 
        date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), 
        status: 'Final', 
        provider: 'Dr. Priya Sharma',
        details: [
             { name: 'Cholesterol, Total', value: '210 mg/dL', referenceRange: '<200', isAbnormal: true },
             { name: 'Triglycerides', value: '160 mg/dL', referenceRange: '<150', isAbnormal: true },
        ]
    },
];

const MOCK_ALLERGIES: Allergy[] = [
    { id: 'a1', name: 'Penicillin', reaction: 'Hives', severity: 'Moderate' },
    { id: 'a2', name: 'Peanuts', reaction: 'Anaphylaxis', severity: 'Severe' },
];

const MOCK_HEALTH_ISSUES: HealthIssue[] = [
    { id: 'hi1', name: 'Hypertension', onset_date: '2020-05-15' },
    { id: 'hi2', name: 'Type 2 Diabetes', onset_date: '2021-11-01' },
];

const MOCK_IMMUNIZATIONS: Immunization[] = [
    { id: 'im1', name: 'Influenza', date: new Date(now.getFullYear(), 9, 15).toISOString().split('T')[0], provider: 'City Clinic' },
    { id: 'im2', name: 'Tetanus, Diphtheria, Pertussis (Tdap)', date: '2018-07-22', provider: 'General Hospital' },
];

const MOCK_PREVENTIVE_CARE: PreventiveCareItem[] = [
    { id: 'pc1', name: 'Annual Physical', dueDate: new Date(now.getFullYear(), now.getMonth() + 2, 1).toISOString().split('T')[0], status: 'Due' },
    { id: 'pc2', name: 'Colonoscopy', dueDate: '2025-08-10', status: 'Up-to-date', lastCompleted: '2020-08-10' },
    { id: 'pc3', name: 'Dental Cleaning', dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0], status: 'Overdue' },
];

const MOCK_CARE_PLANS: CarePlan[] = [
    { 
        id: 'cp1', 
        conditionName: 'Diabetes Management', 
        relatedMedicationIds: ['m2'], 
        relatedTestResultIds: ['tr1'], 
        goals: [
            { id: 'g1', description: 'Check blood sugar daily.', isComplete: true },
            { id: 'g2', description: 'Walk 30 minutes, 5 times a week.', isComplete: false },
        ]
    }
];

const MOCK_GROWTH_RECORDS: GrowthRecord[] = [
    { age: 0, weight: 3.4, height: 50, headCircumference: 35 },
    { age: 2, weight: 4.5, height: 54, headCircumference: 37 },
    { age: 4, weight: 6.0, height: 59, headCircumference: 40 },
    { age: 6, weight: 7.3, height: 65, headCircumference: 42 },
    { age: 9, weight: 8.6, height: 70, headCircumference: 44 },
    { age: 12, weight: 9.7, height: 75, headCircumference: 46 },
];

const MOCK_QUESTIONNAIRES: Questionnaire[] = [
    { id: 'q1', title: 'Pre-Visit Health Survey', provider: 'Dr. Priya Sharma', dueDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'Pending' },
    { id: 'q2', title: 'Mental Health Screening (PHQ-9)', provider: 'Dr. Sunita Reddy', dueDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'Pending' },
];