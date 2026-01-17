import { supabase } from './supabase';
import {
    MedicalRecord,
    Medication,
    Reminder,
    Vital,
    Profile,
    Appointment,
    DocumentAnalysis,
    Symptom,
    FoodLog,
    CommunityPost,
    AfterVisitSummary,
    TestOrProcedure,
    CareLocation,
    TestResult,
    Allergy,
    HealthIssue,
    Immunization,
    PreventiveCareItem,
    CarePlan,
    GrowthRecord,
    Questionnaire,
} from '../types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// ============================================================================
// PROFILE
// ============================================================================

export const getProfile = async (userId: string): Promise<Profile> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', error);
        throw error;
    }

    // Return empty profile if none exists
    return data || {};
};

export const saveProfile = async (userId: string, profile: Profile): Promise<void> => {
    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            age: profile.age,
            conditions: profile.conditions,
            goals: profile.goals,
            blood_type: profile.bloodType,
            emergency_contact_name: profile.emergencyContactName,
            emergency_contact_phone: profile.emergencyContactPhone,
            target_blood_sugar: profile.targetBloodSugar,
            water_goal: profile.waterGoal,
            personal_history: profile.personalHistory,
            family_history: profile.familyHistory,
        });

    if (error) {
        console.error('Error saving profile:', error);
        throw error;
    }
};

// ============================================================================
// VITALS
// ============================================================================

export const getVitals = async (userId: string): Promise<Vital[]> => {
    const { data, error } = await supabase
        .from('vitals')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

    if (error) {
        console.error('Error fetching vitals:', error);
        throw error;
    }

    return (data || []).map(v => ({
        date: v.date,
        sugar: v.sugar,
        systolic: v.systolic,
        diastolic: v.diastolic,
    }));
};

export const addVital = async (
    userId: string,
    newVital: { sugar?: number; systolic?: number; diastolic?: number }
): Promise<void> => {
    const today = getTodayDateString();

    const { error } = await supabase
        .from('vitals')
        .upsert({
            user_id: userId,
            date: today,
            sugar: newVital.sugar,
            systolic: newVital.systolic,
            diastolic: newVital.diastolic,
        });

    if (error) {
        console.error('Error adding vital:', error);
        throw error;
    }
};

// ============================================================================
// MEDICAL RECORDS
// ============================================================================

export const getRecords = async (userId: string): Promise<MedicalRecord[]> => {
    const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching medical records:', error);
        throw error;
    }

    // Process records and generate signed URLs for storage files
    const records = await Promise.all((data || []).map(async (r) => {
        let fileUrl = r.file_url;

        // If file_url is a storage path (not Base64), generate signed URL
        if (fileUrl && !fileUrl.startsWith('data:')) {
            try {
                const { data: signedUrlData } = await supabase.storage
                    .from('medical-records')
                    .createSignedUrl(fileUrl, 3600); // 1 hour expiry

                if (signedUrlData?.signedUrl) {
                    fileUrl = signedUrlData.signedUrl;
                }
            } catch (err) {
                console.error('Error generating signed URL:', err);
                // Keep original path if signed URL generation fails
            }
        }

        return {
            id: r.id,
            name: r.name,
            type: r.type,
            date: r.date,
            fileUrl: fileUrl,
            analysis: r.analysis,
        };
    }));

    return records;
};

export const addRecord = async (
    userId: string,
    recordInfo: {
        name: string;
        type: MedicalRecord['type'];
        file: File;
    },
    analysis?: DocumentAnalysis
): Promise<void> => {
    const recordDate = getTodayDateString();

    // Upload file to Supabase Storage
    const fileExt = recordInfo.file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}_${recordInfo.name.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('medical-records')
        .upload(fileName, recordInfo.file, {
            cacheControl: '3600',
            upsert: false
        });

    if (uploadError) {
        console.error('Error uploading file to storage:', uploadError);
        throw uploadError;
    }

    // Store the storage path in the database
    const { error } = await supabase.from('medical_records').insert({
        user_id: userId,
        name: recordInfo.name,
        type: analysis ? 'Analyzed Document' : recordInfo.type,
        date: recordDate,
        file_url: fileName, // Store storage path instead of Base64
        analysis: analysis || null,
    });

    if (error) {
        // If database insert fails, try to clean up the uploaded file
        await supabase.storage.from('medical-records').remove([fileName]);
        console.error('Error adding medical record:', error);
        throw error;
    }
};

export const deleteRecord = async (userId: string, recordId: string): Promise<void> => {
    // First, get the record to find the file path
    const { data: record } = await supabase
        .from('medical_records')
        .select('file_url')
        .eq('id', recordId)
        .eq('user_id', userId)
        .single();

    // Delete from database
    const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', recordId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting medical record:', error);
        throw error;
    }

    // If file is in storage (not Base64), delete it
    if (record?.file_url && !record.file_url.startsWith('data:')) {
        const { error: storageError } = await supabase.storage
            .from('medical-records')
            .remove([record.file_url]);

        if (storageError) {
            console.error('Error deleting file from storage:', storageError);
            // Don't throw - record is already deleted from database
        }
    }
};

// ============================================================================
// MEDICATIONS
// ============================================================================

export const getMedications = async (userId: string): Promise<Medication[]> => {
    const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching medications:', error);
        throw error;
    }

    return (data || []).map(m => ({
        id: m.id,
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        times: m.times || [],
        takenToday: m.taken_today,
        isActive: m.is_active,
    }));
};

export const addMedication = async (
    userId: string,
    med: Omit<Medication, 'id' | 'takenToday' | 'isActive'>
): Promise<void> => {
    const { error } = await supabase.from('medications').insert({
        user_id: userId,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        times: med.times || [],
        taken_today: false,
        is_active: true,
    });

    if (error) {
        console.error('Error adding medication:', error);
        throw error;
    }
};

export const updateMedication = async (userId: string, updatedMed: Medication): Promise<void> => {
    const { error } = await supabase
        .from('medications')
        .update({
            name: updatedMed.name,
            dosage: updatedMed.dosage,
            frequency: updatedMed.frequency,
            times: updatedMed.times || [],
            taken_today: updatedMed.takenToday,
            is_active: updatedMed.isActive,
        })
        .eq('id', updatedMed.id)
        .eq('user_id', userId);

    if (error) {
        console.error('Error updating medication:', error);
        throw error;
    }
};

export const deleteMedication = async (userId: string, medId: string): Promise<void> => {
    const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', medId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting medication:', error);
        throw error;
    }
};

// ============================================================================
// REMINDERS
// ============================================================================

export const getReminders = async (userId: string): Promise<Reminder[]> => {
    const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .order('time', { ascending: true });

    if (error) {
        console.error('Error fetching reminders:', error);
        throw error;
    }

    return (data || []).map(r => ({
        id: r.id,
        title: r.title,
        time: r.time,
        description: r.description || '',
    }));
};

export const addReminder = async (userId: string, reminder: Omit<Reminder, 'id'>): Promise<void> => {
    const { error } = await supabase.from('reminders').insert({
        user_id: userId,
        title: reminder.title,
        time: reminder.time,
        description: reminder.description,
    });

    if (error) {
        console.error('Error adding reminder:', error);
        throw error;
    }
};

export const deleteReminder = async (userId: string, reminderId: string): Promise<void> => {
    const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting reminder:', error);
        throw error;
    }
};

// ============================================================================
// APPOINTMENTS
// ============================================================================

export const getAppointments = async (userId: string): Promise<Appointment[]> => {
    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userId)
        .order('date_time', { ascending: true });

    if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
    }

    return (data || []).map(a => ({
        id: a.id,
        doctorName: a.doctor_name,
        specialty: a.specialty,
        dateTime: a.date_time,
        location: a.location,
        notes: a.notes,
        type: a.type,
        eCheckInComplete: a.e_check_in_complete,
        onWaitlist: a.on_waitlist,
        summaryId: a.summary_id,
    }));
};

export const addAppointment = async (
    userId: string,
    appointment: Omit<Appointment, 'id' | 'eCheckInComplete' | 'onWaitlist'>
): Promise<void> => {
    const { error } = await supabase.from('appointments').insert({
        user_id: userId,
        doctor_name: appointment.doctorName,
        specialty: appointment.specialty,
        date_time: appointment.dateTime,
        location: appointment.location,
        notes: appointment.notes,
        type: appointment.type,
        e_check_in_complete: false,
        on_waitlist: false,
        summary_id: appointment.summaryId,
    });

    if (error) {
        console.error('Error adding appointment:', error);
        throw error;
    }
};

export const updateAppointment = async (userId: string, updatedAppointment: Appointment): Promise<void> => {
    const { error } = await supabase
        .from('appointments')
        .update({
            doctor_name: updatedAppointment.doctorName,
            specialty: updatedAppointment.specialty,
            date_time: updatedAppointment.dateTime,
            location: updatedAppointment.location,
            notes: updatedAppointment.notes,
            type: updatedAppointment.type,
            e_check_in_complete: updatedAppointment.eCheckInComplete,
            on_waitlist: updatedAppointment.onWaitlist,
            summary_id: updatedAppointment.summaryId,
        })
        .eq('id', updatedAppointment.id)
        .eq('user_id', userId);

    if (error) {
        console.error('Error updating appointment:', error);
        throw error;
    }
};

export const deleteAppointment = async (userId: string, appointmentId: string): Promise<void> => {
    const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting appointment:', error);
        throw error;
    }
};

// ============================================================================
// SYMPTOMS
// ============================================================================

export const getSymptoms = async (userId: string): Promise<Symptom[]> => {
    const { data, error } = await supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching symptoms:', error);
        throw error;
    }

    return (data || []).map(s => ({
        id: s.id,
        date: s.date,
        name: s.name,
        severity: s.severity,
        notes: s.notes,
    }));
};

export const addSymptom = async (userId: string, symptom: Omit<Symptom, 'id'>): Promise<void> => {
    const { error } = await supabase.from('symptoms').insert({
        user_id: userId,
        date: symptom.date,
        name: symptom.name,
        severity: symptom.severity,
        notes: symptom.notes,
    });

    if (error) {
        console.error('Error adding symptom:', error);
        throw error;
    }
};

export const deleteSymptom = async (userId: string, symptomId: string): Promise<void> => {
    const { error } = await supabase
        .from('symptoms')
        .delete()
        .eq('id', symptomId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting symptom:', error);
        throw error;
    }
};

// ============================================================================
// FOOD LOGS
// ============================================================================

export const getFoodLogs = async (userId: string): Promise<FoodLog[]> => {
    const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching food logs:', error);
        throw error;
    }

    return (data || []).map(f => ({
        id: f.id,
        date: f.date,
        mealType: f.meal_type,
        description: f.description,
    }));
};

export const addFoodLog = async (userId: string, log: Omit<FoodLog, 'id'>): Promise<void> => {
    const { error } = await supabase.from('food_logs').insert({
        user_id: userId,
        date: log.date,
        meal_type: log.mealType,
        description: log.description,
    });

    if (error) {
        console.error('Error adding food log:', error);
        throw error;
    }
};

export const deleteFoodLog = async (userId: string, logId: string): Promise<void> => {
    const { error } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', logId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting food log:', error);
        throw error;
    }
};

// ============================================================================
// WATER INTAKE
// ============================================================================

export const getWaterIntake = async (userId: string, date: string): Promise<number> => {
    const { data, error } = await supabase
        .from('water_intake')
        .select('glasses')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching water intake:', error);
        throw error;
    }

    return data?.glasses || 0;
};

export const updateWaterIntake = async (userId: string, date: string, change: number): Promise<void> => {
    // First, get current intake
    const currentIntake = await getWaterIntake(userId, date);
    const newIntake = Math.max(0, currentIntake + change);

    const { error } = await supabase.from('water_intake').upsert({
        user_id: userId,
        date: date,
        glasses: newIntake,
    }, {
        onConflict: 'user_id,date'
    });

    if (error) {
        console.error('Error updating water intake:', error);
        throw error;
    }
};


// ============================================================================
// TEST RESULTS
// ============================================================================

export const getTestResults = async (userId: string): Promise<TestResult[]> => {
    const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching test results:', error);
        throw error;
    }

    return (data || []).map(t => ({
        id: t.id,
        name: t.name,
        date: t.date,
        status: t.status,
        provider: t.provider,
        details: t.details,
    }));
};

// ============================================================================
// ALLERGIES
// ============================================================================

export const getAllergies = async (userId: string): Promise<Allergy[]> => {
    const { data, error } = await supabase
        .from('allergies')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching allergies:', error);
        throw error;
    }

    return (data || []).map(a => ({
        id: a.id,
        name: a.name,
        reaction: a.reaction,
        severity: a.severity,
    }));
};

export const addAllergy = async (userId: string, allergy: Omit<Allergy, 'id'>): Promise<void> => {
    const { error } = await supabase.from('allergies').insert({
        user_id: userId,
        name: allergy.name,
        reaction: allergy.reaction,
        severity: allergy.severity,
    });

    if (error) {
        console.error('Error adding allergy:', error);
        throw error;
    }
};

// ============================================================================
// HEALTH ISSUES
// ============================================================================

export const getHealthIssues = async (userId: string): Promise<HealthIssue[]> => {
    const { data, error } = await supabase
        .from('health_issues')
        .select('*')
        .eq('user_id', userId)
        .order('onset_date', { ascending: false });

    if (error) {
        console.error('Error fetching health issues:', error);
        throw error;
    }

    return (data || []).map(h => ({
        id: h.id,
        name: h.name,
        onset_date: h.onset_date,
    }));
};

export const addHealthIssue = async (userId: string, issue: Omit<HealthIssue, 'id'>): Promise<void> => {
    const { error } = await supabase.from('health_issues').insert({
        user_id: userId,
        name: issue.name,
        onset_date: issue.onset_date,
    });

    if (error) {
        console.error('Error adding health issue:', error);
        throw error;
    }
};

// ============================================================================
// IMMUNIZATIONS
// ============================================================================

export const getImmunizations = async (userId: string): Promise<Immunization[]> => {
    const { data, error } = await supabase
        .from('immunizations')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching immunizations:', error);
        throw error;
    }

    return (data || []).map(i => ({
        id: i.id,
        name: i.name,
        date: i.date,
        provider: i.provider,
    }));
};

export const addImmunization = async (userId: string, immunization: Omit<Immunization, 'id'>): Promise<void> => {
    const { error } = await supabase.from('immunizations').insert({
        user_id: userId,
        name: immunization.name,
        date: immunization.date,
        provider: immunization.provider,
    });

    if (error) {
        console.error('Error adding immunization:', error);
        throw error;
    }
};

// ============================================================================
// PREVENTIVE CARE
// ============================================================================

export const getPreventiveCare = async (userId: string): Promise<PreventiveCareItem[]> => {
    const { data, error } = await supabase
        .from('preventive_care')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

    if (error) {
        console.error('Error fetching preventive care:', error);
        throw error;
    }

    return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        dueDate: p.due_date,
        status: p.status,
        lastCompleted: p.last_completed,
    }));
};

// ============================================================================
// CARE PLANS
// ============================================================================

export const getCarePlans = async (userId: string): Promise<CarePlan[]> => {
    const { data, error } = await supabase
        .from('care_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching care plans:', error);
        throw error;
    }

    return (data || []).map(c => ({
        id: c.id,
        conditionName: c.condition_name,
        relatedMedicationIds: c.related_medication_ids || [],
        relatedTestResultIds: c.related_test_result_ids || [],
        goals: c.goals,
    }));
};

// ============================================================================
// GROWTH RECORDS
// ============================================================================

export const getGrowthRecords = async (userId: string): Promise<GrowthRecord[]> => {
    const { data, error } = await supabase
        .from('growth_records')
        .select('*')
        .eq('user_id', userId)
        .order('age', { ascending: true });

    if (error) {
        console.error('Error fetching growth records:', error);
        throw error;
    }

    return (data || []).map(g => ({
        age: g.age,
        weight: g.weight,
        height: g.height,
        headCircumference: g.head_circumference,
    }));
};

// ============================================================================
// QUESTIONNAIRES
// ============================================================================

export const getQuestionnaires = async (userId: string): Promise<Questionnaire[]> => {
    const { data, error } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

    if (error) {
        console.error('Error fetching questionnaires:', error);
        throw error;
    }

    return (data || []).map(q => ({
        id: q.id,
        title: q.title,
        provider: q.provider,
        dueDate: q.due_date,
        status: q.status,
    }));
};

// ============================================================================
// AFTER VISIT SUMMARIES
// ============================================================================

export const getAfterVisitSummary = async (userId: string, summaryId: string): Promise<AfterVisitSummary | undefined> => {
    const { data, error } = await supabase
        .from('after_visit_summaries')
        .select('*')
        .eq('user_id', userId)
        .eq('id', summaryId)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching after visit summary:', error);
        throw error;
    }

    if (!data) return undefined;

    return {
        id: data.id,
        appointmentId: data.appointment_id,
        visitReason: data.visit_reason,
        clinicalNotes: data.clinical_notes,
        followUpInstructions: data.follow_up_instructions,
    };
};

// ============================================================================
// TESTS AND PROCEDURES
// ============================================================================

export const getTestsAndProcedures = async (userId: string): Promise<TestOrProcedure[]> => {
    const { data, error } = await supabase
        .from('tests_and_procedures')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

    if (error) {
        console.error('Error fetching tests and procedures:', error);
        throw error;
    }

    return (data || []).map(t => ({
        id: t.id,
        name: t.name,
        date: t.date,
        location: t.location,
        instructions: t.instructions,
    }));
};

// ============================================================================
// COMMUNITY POSTS
// ============================================================================

export const getCommunityPosts = async (): Promise<CommunityPost[]> => {
    const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('timestamp', { ascending: false });

    if (error) {
        console.error('Error fetching community posts:', error);
        throw error;
    }

    return (data || []).map(p => ({
        id: p.id,
        title: p.title,
        content: p.content,
        authorId: p.author_id,
        authorName: p.author_name,
        authorPhotoURL: p.author_photo_url,
        timestamp: p.timestamp,
    }));
};

export const addCommunityPost = async (
    userId: string,
    post: Omit<CommunityPost, 'id' | 'authorId' | 'authorName' | 'authorPhotoURL' | 'timestamp'>,
    author: { name: string; photoURL: string | null }
): Promise<void> => {
    const { error } = await supabase.from('community_posts').insert({
        author_id: userId,
        author_name: author.name,
        author_photo_url: author.photoURL,
        title: post.title,
        content: post.content,
        timestamp: new Date().toISOString(),
    });

    if (error) {
        console.error('Error adding community post:', error);
        throw error;
    }
};

export const deleteCommunityPost = async (postId: string): Promise<void> => {
    const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

    if (error) {
        console.error('Error deleting community post:', error);
        throw error;
    }
};

// ============================================================================
// CARE LOCATIONS
// ============================================================================

export const getCareLocations = async (): Promise<CareLocation[]> => {
    const { data, error } = await supabase
        .from('care_locations')
        .select('*')
        .order('wait_time', { ascending: true });

    if (error) {
        console.error('Error fetching care locations:', error);
        throw error;
    }

    return (data || []).map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        address: c.address,
        waitTime: c.wait_time,
        distance: c.distance,
    }));
};

// ============================================================================
// LEGACY COMPATIBILITY FUNCTIONS
// ============================================================================

// Get all user data for export functionality
export const getFullUserData = async (userId: string) => {
    const [
        profile,
        records,
        medications,
        vitals,
        appointments,
        reminders,
        symptoms,
        foodLogs,
        testResults,
        allergies,
        healthIssues,
        immunizations,
        preventiveCare,
        carePlans,
        growthRecords,
        questionnaires,
    ] = await Promise.all([
        getProfile(userId),
        getRecords(userId),
        getMedications(userId),
        getVitals(userId),
        getAppointments(userId),
        getReminders(userId),
        getSymptoms(userId),
        getFoodLogs(userId),
        getTestResults(userId),
        getAllergies(userId),
        getHealthIssues(userId),
        getImmunizations(userId),
        getPreventiveCare(userId),
        getCarePlans(userId),
        getGrowthRecords(userId),
        getQuestionnaires(userId),
    ]);

    return {
        profile,
        records,
        medications,
        vitals,
        appointments,
        reminders,
        symptoms,
        foodLogs,
        waterIntake: {}, // Water intake would need separate handling
        testResults,
        allergies,
        healthIssues,
        immunizations,
        preventiveCare,
        carePlans,
        growthRecords,
        questionnaires,
    };
};

// Import user data - not fully implemented for Supabase
export const importUserData = async (userId: string, jsonData: string): Promise<boolean> => {
    console.warn('importUserData: Full import not yet implemented for Supabase.');
    console.warn('This would require complex multi-table import logic.');
    return false;
};

// Delete user data - handled by Supabase CASCADE
export const deleteUserData = async (userId: string): Promise<void> => {
    console.warn('deleteUserData: User data will be automatically deleted when auth user is removed.');
    console.warn('To delete a user, use Supabase Auth admin functions.');
};
