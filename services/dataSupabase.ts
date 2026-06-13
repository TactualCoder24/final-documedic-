import { supabase } from './supabase';
import {
    MedicalRecord,
    Medication,
    MedicationAdherenceStats,
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
    CommunityComment,
    SleepLog,
    Prescription,
    PrescriptionMedication,
    ClinicalTemplate,
    ClinicalTemplateType,
    DiagnosisCode,
    DentalChart,
    Invoice,
    InvoiceItem,
    Referral,
    PatientMessage,
    DoctorAvailability,
    BookingRequest,
    Clinic,
    Department,
    ClinicStaff,
    ClinicQueueEntry,
    AuditLogEntry,
    AppNotification,
    Review,
    DoctorScheduleConfig,
    ClinicRolePermissions,
    ClinicService,
    ClinicIntakeTemplate,
    IntakeField,
    HospitalBed,
    IpdAdmission,
    PharmacyInventoryItem,
    PharmacyDispense,
    LabOrder,
    InsuranceClaim,
    EquipmentAsset,
    ClinicCommerceSettings
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
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
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
            language: profile.language,
            role: profile.role,
        });

    if (error) {
        console.error('Error saving profile:', error);
        throw error;
    }
};

// ============================================================================
// DOCTOR-PATIENT RELATIONSHIPS
// ============================================================================

export const getDoctorPatients = async (doctorId: string): Promise<Profile[]> => {
    // 1. Get all patient IDs linked to this doctor
    const { data: links, error: linkError } = await supabase
        .from('doctor_patients')
        .select('patient_id')
        .eq('doctor_id', doctorId);

    if (linkError) {
        console.error('Error fetching linked patients:', linkError);
        return [];
    }

    const patientIds = links?.map(l => l.patient_id) || [];
    
    if (patientIds.length === 0) return [];

    // 2. Fetch the profiles for those IDs
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', patientIds);

    if (profilesError) {
        console.error('Error fetching patient profiles:', profilesError);
        return [];
    }

    return profiles || [];
};

// ============================================================================
// DOCTOR DASHBOARD & INTAKE FORMS
// ============================================================================

export const submitIntakeForm = async (
    patientId: string,
    appointmentId: string,
    doctorName: string,
    symptomsDescription: string,
    file?: File,
    customFields?: { templateId?: string; customResponses?: Record<string, string | boolean>; signatureDataUrl?: string; consentAccepted?: boolean }
): Promise<void> => {
    let fileUrl = null;

    if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${patientId}/intake_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('medical-records')
            .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
            console.error('Error uploading intake file:', uploadError);
            throw uploadError;
        }
        fileUrl = fileName;
    }

    const { error } = await supabase.from('intake_forms').insert({
        patient_id: patientId,
        appointment_id: appointmentId,
        doctor_name: doctorName,
        symptoms_description: symptomsDescription,
        file_url: fileUrl,
        template_id: customFields?.templateId,
        custom_responses: customFields?.customResponses,
        signature_data_url: customFields?.signatureDataUrl,
        consent_accepted: customFields?.consentAccepted ?? false,
    });

    if (error) {
        console.error('Error submitting intake form:', error);
        throw error;
    }
};

export const getIntakeFormByAppointment = async (appointmentId: string) => {
    const { data, error } = await supabase
        .from('intake_forms')
        .select('*')
        .eq('appointment_id', appointmentId)
        .single();
        
    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching intake form:', error);
    }
    
    if (!data) return null;
    
    let fileUrl = data.file_url;
    if (fileUrl && !fileUrl.startsWith('data:')) {
        try {
            const { data: signedUrlData } = await supabase.storage
                .from('medical-records')
                .createSignedUrl(fileUrl, 3600);
            if (signedUrlData?.signedUrl) {
                fileUrl = signedUrlData.signedUrl;
            }
        } catch (e) {}
    }

    return {
        id: data.id,
        appointmentId: data.appointment_id,
        patientId: data.patient_id,
        doctorName: data.doctor_name,
        symptomsDescription: data.symptoms_description,
        fileUrl,
        createdAt: data.created_at
    };
};

export const getDoctorTasks = async (doctorId: string) => {
    const { data, error } = await supabase
        .from('doctor_tasks')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }

    return (data || []).map(t => ({
        id: t.id,
        doctorId: t.doctor_id,
        patientId: t.patient_id,
        description: t.description,
        status: t.status,
        createdAt: t.created_at
    }));
};

export const addDoctorTask = async (doctorId: string, description: string, patientId?: string) => {
    const { error } = await supabase.from('doctor_tasks').insert({
        doctor_id: doctorId,
        description,
        patient_id: patientId || null,
        status: 'todo'
    });
    if (error) {
        console.error('Error adding task:', error);
        throw error;
    }
};

export const updateTaskStatus = async (taskId: string, status: 'todo' | 'done') => {
    const { error } = await supabase
        .from('doctor_tasks')
        .update({ status })
        .eq('id', taskId);
    if (error) {
        console.error('Error updating task:', error);
        throw error;
    }
};

export const getDoctorAppointmentsToday = async (doctorId: string, doctorName: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get appointments where doctor name matches, OR where patient is linked to doctor.
    // For simplicity, we just query appointments where doctor_name matches the doctor's name,
    // OR we could fetch patients for this doctor and then fetch their appointments.
    
    // We'll fetch patients for this doctor first
    const { data: links } = await supabase
        .from('doctor_patients')
        .select('patient_id')
        .eq('doctor_id', doctorId);
        
    const patientIds = links?.map(l => l.patient_id) || [];
    
    let query = supabase
        .from('appointments')
        .select('*')
        .gte('date_time', today.toISOString())
        .lt('date_time', tomorrow.toISOString());
        
    if (patientIds.length > 0) {
        query = query.in('user_id', patientIds);
    } else {
        // Fallback to name matching
        query = query.ilike('doctor_name', `%${doctorName}%`);
    }

    const { data, error } = await query.order('date_time', { ascending: true });

    if (error) {
        console.error('Error fetching doctor appointments:', error);
        return [];
    }

    // Heuristic no-show risk: look at each patient's past appointments and compute
    // the proportion that ended up 'No-Show' vs. 'Completed'/'No-Show'.
    const todaysPatientIds = Array.from(new Set((data || []).map(a => a.user_id).filter(Boolean)));
    const noShowRateByPatient = new Map<string, number>();
    if (todaysPatientIds.length > 0) {
        const { data: pastAppointments } = await supabase
            .from('appointments')
            .select('user_id, status, date_time')
            .in('user_id', todaysPatientIds)
            .lt('date_time', today.toISOString())
            .in('status', ['Completed', 'No-Show']);

        (pastAppointments || []).forEach(p => {
            if (!p.user_id) return;
            const counts = noShowRateByPatient.get(p.user_id) || 0;
            noShowRateByPatient.set(`${p.user_id}__total`, ((noShowRateByPatient.get(`${p.user_id}__total`) || 0) + 1));
            if (p.status === 'No-Show') {
                noShowRateByPatient.set(p.user_id, counts + 1);
            }
        });
    }

    return (data || []).map(a => {
        const noShows = noShowRateByPatient.get(a.user_id) || 0;
        const total = noShowRateByPatient.get(`${a.user_id}__total`) || 0;
        const rate = total >= 2 ? noShows / total : undefined;
        const risk: 'low' | 'medium' | 'high' | undefined =
            rate === undefined ? undefined : rate > 0.3 ? 'high' : rate > 0.15 ? 'medium' : 'low';

        return {
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
            status: a.status || 'Scheduled',
            patientId: a.user_id,
            noShowRate: rate,
            noShowRisk: risk,
        };
    });
};

export const addPatientToDoctor = async (doctorId: string, patientId: string): Promise<void> => {
    const { error } = await supabase
        .from('doctor_patients')
        .insert({
            doctor_id: doctorId,
            patient_id: patientId,
            status: 'active'
        });

    if (error) {
        console.error('Error linking patient to doctor:', error);
        throw error;
    }
};

// Helper function to resolve email to User ID (requires Edge Function or secure setup in production, 
// but we'll try a naive approach or require exact patient ID for now)
export const resolveEmailToUserId = async (email: string): Promise<string | null> => {
    // This is difficult in client-side Supabase as auth.users is restricted.
    // Assuming we have email stored in `profiles` (we don't right now), we can't easily search by email.
    // For now, this will just return null and the doctor must use the exact User ID.
    return null; 
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
        totalQuantity: m.total_quantity ?? undefined,
        refillReminderSentAt: m.refill_reminder_sent_at ?? undefined,
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
        total_quantity: med.totalQuantity ?? null,
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
            total_quantity: updatedMed.totalQuantity ?? null,
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

// Records today's (or a given date's) taken/missed status for a medication dose.
export const logMedicationDose = async (userId: string, medicationId: string, taken: boolean, date?: string): Promise<void> => {
    const logDate = date || new Date().toISOString().slice(0, 10);
    const { error } = await supabase
        .from('medication_logs')
        .upsert({
            user_id: userId,
            medication_id: medicationId,
            log_date: logDate,
            taken,
        }, { onConflict: 'medication_id,log_date' });

    if (error) {
        console.error('Error logging medication dose:', error);
        throw error;
    }
};

export const getMedicationAdherenceStats = async (userId: string, medicationId: string): Promise<MedicationAdherenceStats> => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoff = thirtyDaysAgo.toISOString().slice(0, 10);

    const { data, error } = await supabase
        .from('medication_logs')
        .select('log_date, taken')
        .eq('user_id', userId)
        .eq('medication_id', medicationId);

    if (error) {
        console.error('Error fetching medication adherence stats:', error);
        return { takenCount: 0, loggedCount: 0, last30Taken: 0, last30Logged: 0 };
    }

    const rows = data || [];
    const last30 = rows.filter(r => r.log_date >= cutoff);
    return {
        takenCount: rows.filter(r => r.taken).length,
        loggedCount: rows.length,
        last30Taken: last30.filter(r => r.taken).length,
        last30Logged: last30.length,
    };
};

// Checks each active medication with a known supply size and, if the remaining
// doses are running low, sends a one-time "refill reminder" notification.
export const checkRefillReminders = async (userId: string): Promise<void> => {
    const medications = await getMedications(userId).catch(() => []);

    for (const med of medications) {
        if (!med.isActive || !med.totalQuantity || med.refillReminderSentAt) continue;

        const stats = await getMedicationAdherenceStats(userId, med.id);
        const dosesPerDay = med.times && med.times.length > 0 ? med.times.length : 1;
        const remainingDoses = med.totalQuantity - stats.takenCount;
        const thresholdDoses = dosesPerDay * 3; // ~3 days of supply left

        if (remainingDoses <= thresholdDoses) {
            await createNotification({
                userId,
                type: 'system',
                title: `Refill reminder: ${med.name}`,
                body: remainingDoses > 0
                    ? `Your ${med.name} supply is running low (~${remainingDoses} dose${remainingDoses === 1 ? '' : 's'} left). Consider requesting a refill.`
                    : `Your ${med.name} supply may have run out. Consider requesting a refill.`,
                link: '/medications',
            });

            await supabase
                .from('medications')
                .update({ refill_reminder_sent_at: new Date().toISOString() })
                .eq('id', med.id)
                .eq('user_id', userId);
        }
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
        status: a.status || 'Scheduled',
        patientId: a.user_id,
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
            status: updatedAppointment.status || 'Scheduled',
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
// SLEEP LOGS
// ============================================================================

export const getSleepLogs = async (userId: string): Promise<SleepLog[]> => {
    const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching sleep logs:', error);
        throw error;
    }

    return (data || []).map(s => ({
        id: s.id,
        date: s.date,
        hours: s.hours,
        quality: s.quality,
        bedtime: s.bedtime,
        wakeTime: s.wake_time,
        notes: s.notes,
    }));
};

export const addSleepLog = async (userId: string, log: Omit<SleepLog, 'id'>): Promise<void> => {
    const { error } = await supabase.from('sleep_logs').insert({
        user_id: userId,
        date: log.date,
        hours: log.hours,
        quality: log.quality,
        bedtime: log.bedtime,
        wake_time: log.wakeTime,
        notes: log.notes,
    });

    if (error) {
        console.error('Error adding sleep log:', error);
        throw error;
    }
};

export const deleteSleepLog = async (userId: string, logId: string): Promise<void> => {
    const { error } = await supabase
        .from('sleep_logs')
        .delete()
        .eq('id', logId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting sleep log:', error);
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

export const addTestResult = async (
    userId: string,
    result: Omit<TestResult, 'id'>
): Promise<void> => {
    const { error } = await supabase.from('test_results').insert({
        user_id: userId,
        name: result.name,
        date: result.date,
        status: result.status,
        provider: result.provider,
        details: result.details,
    });

    if (error) {
        console.error('Error adding test result:', error);
        throw error;
    }
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

export const updatePreventiveCareStatus = async (
    userId: string,
    itemId: string,
    status: 'Due' | 'Overdue' | 'Up-to-date',
    lastCompleted?: string
): Promise<void> => {
    const updateData: any = { status };
    if (lastCompleted) updateData.last_completed = lastCompleted;
    if (status === 'Up-to-date' && !lastCompleted) {
        updateData.last_completed = new Date().toISOString().split('T')[0];
    }

    const { error } = await supabase
        .from('preventive_care')
        .update(updateData)
        .eq('id', itemId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error updating preventive care:', error);
        throw error;
    }
};

export const addPreventiveCareItem = async (
    userId: string,
    item: { name: string; dueDate: string }
): Promise<void> => {
    const { error } = await supabase.from('preventive_care').insert({
        user_id: userId,
        name: item.name,
        due_date: item.dueDate,
        status: 'Due',
    });

    if (error) {
        console.error('Error adding preventive care item:', error);
        throw error;
    }
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

export const addCarePlan = async (
    userId: string,
    plan: { conditionName: string; relatedMedicationIds: string[]; relatedTestResultIds: string[]; goals: { id: string; description: string; isComplete: boolean }[] }
): Promise<void> => {
    const { error } = await supabase.from('care_plans').insert({
        user_id: userId,
        condition_name: plan.conditionName,
        related_medication_ids: plan.relatedMedicationIds,
        related_test_result_ids: plan.relatedTestResultIds,
        goals: plan.goals,
    });

    if (error) {
        console.error('Error adding care plan:', error);
        throw error;
    }
};

export const updateCarePlanGoal = async (
    userId: string,
    planId: string,
    goalId: string,
    isComplete: boolean
): Promise<void> => {
    const { data: plan, error: fetchError } = await supabase
        .from('care_plans')
        .select('goals')
        .eq('id', planId)
        .eq('user_id', userId)
        .single();

    if (fetchError || !plan) throw fetchError;

    const updatedGoals = (plan.goals || []).map((g: any) =>
        g.id === goalId ? { ...g, isComplete } : g
    );

    const { error } = await supabase
        .from('care_plans')
        .update({ goals: updatedGoals })
        .eq('id', planId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error updating care plan goal:', error);
        throw error;
    }
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

export const updateQuestionnaireStatus = async (questionnaireId: string, status: 'Pending' | 'Completed'): Promise<void> => {
    const { error } = await supabase
        .from('questionnaires')
        .update({ status })
        .eq('id', questionnaireId);

    if (error) {
        console.error('Error updating questionnaire:', error);
        throw error;
    }
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

export const addAfterVisitSummary = async (
    userId: string,
    summary: { appointmentId: string; visitReason: string; clinicalNotes: string; followUpInstructions: string }
): Promise<string> => {
    const { data, error } = await supabase.from('after_visit_summaries').insert({
        user_id: userId,
        appointment_id: summary.appointmentId,
        visit_reason: summary.visitReason,
        clinical_notes: summary.clinicalNotes,
        follow_up_instructions: summary.followUpInstructions,
    }).select('id').single();

    if (error) {
        console.error('Error adding after visit summary:', error);
        throw error;
    }
    return data.id;
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
    // We purposefully embed the comments via a secondary fetch for simplicity,
    // although Supabase supports join syntax if foreign keys are set up strictly.
    const { data: posts, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .order('timestamp', { ascending: false });

    if (postsError) {
        console.error('Error fetching community posts:', postsError);
        throw postsError;
    }

    const { data: comments, error: commentsError } = await supabase
        .from('community_comments')
        .select('*')
        .order('created_at', { ascending: true });

    if (commentsError) {
        console.error('Error fetching community comments:', commentsError);
    }

    return (posts || []).map(p => {
        const postComments = (comments || []).filter(c => c.post_id === p.id).map(c => ({
            id: c.id,
            postId: c.post_id,
            authorId: c.author_id,
            authorName: c.author_name,
            authorPhotoURL: c.author_photo_url,
            content: c.content,
            isAnonymous: c.is_anonymous,
            likes: c.likes || [],
            createdAt: c.created_at,
        }));

        return {
            id: p.id,
            title: p.title,
            content: p.content,
            authorId: p.author_id,
            authorName: p.author_name,
            authorPhotoURL: p.author_photo_url,
            timestamp: p.timestamp,
            category: p.category || 'General',
            isAnonymous: p.is_anonymous || false,
            likes: p.likes || [],
            imageUrl: p.image_url,
            comments: postComments,
        };
    });
};

export const addCommunityPost = async (
    userId: string,
    post: { title: string; content: string; category?: string; isAnonymous?: boolean; imageUrl?: string },
    author: { name: string; photoURL: string | null }
): Promise<void> => {
    const { error } = await supabase.from('community_posts').insert({
        author_id: userId,
        author_name: post.isAnonymous ? 'Anonymous Member' : author.name,
        author_photo_url: post.isAnonymous ? null : author.photoURL,
        title: post.title,
        content: post.content,
        timestamp: new Date().toISOString(),
        category: post.category || 'General',
        is_anonymous: post.isAnonymous || false,
        image_url: post.imageUrl || null,
        likes: []
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

export const togglePostLike = async (postId: string, userId: string): Promise<void> => {
    const { data: post, error: fetchError } = await supabase
        .from('community_posts')
        .select('likes')
        .eq('id', postId)
        .single();

    if (fetchError || !post) throw fetchError;

    let currentLikes: string[] = post.likes || [];
    if (currentLikes.includes(userId)) {
        currentLikes = currentLikes.filter(id => id !== userId);
    } else {
        currentLikes.push(userId);
    }

    const { error: updateError } = await supabase
        .from('community_posts')
        .update({ likes: currentLikes })
        .eq('id', postId);

    if (updateError) throw updateError;
};

export const reportPost = async (postId: string, userId: string): Promise<void> => {
    const { data: post, error: fetchError } = await supabase
        .from('community_posts')
        .select('reported_by')
        .eq('id', postId)
        .single();

    if (fetchError || !post) throw fetchError;

    let reportedBy: string[] = post.reported_by || [];
    if (!reportedBy.includes(userId)) {
        reportedBy.push(userId);
    }

    const { error: updateError } = await supabase
        .from('community_posts')
        .update({ reported_by: reportedBy })
        .eq('id', postId);

    if (updateError) throw updateError;
};

export const addCommunityComment = async (
    postId: string,
    userId: string,
    content: string,
    author: { name: string; photoURL: string | null },
    isAnonymous: boolean = false
): Promise<void> => {
    const { error } = await supabase.from('community_comments').insert({
        post_id: postId,
        author_id: userId,
        author_name: isAnonymous ? 'Anonymous Member' : author.name,
        author_photo_url: isAnonymous ? null : author.photoURL,
        content: content,
        is_anonymous: isAnonymous,
        likes: [],
        created_at: new Date().toISOString()
    });

    if (error) {
        console.error('Error adding community comment:', error);
        throw error;
    }
};

export const deleteCommunityComment = async (commentId: string): Promise<void> => {
    const { error } = await supabase
        .from('community_comments')
        .delete()
        .eq('id', commentId);

    if (error) {
        console.error('Error deleting community comment:', error);
        throw error;
    }
};

export const toggleCommentLike = async (commentId: string, userId: string): Promise<void> => {
    const { data: comment, error: fetchError } = await supabase
        .from('community_comments')
        .select('likes')
        .eq('id', commentId)
        .single();

    if (fetchError || !comment) throw fetchError;

    let currentLikes: string[] = comment.likes || [];
    if (currentLikes.includes(userId)) {
        currentLikes = currentLikes.filter(id => id !== userId);
    } else {
        currentLikes.push(userId);
    }

    const { error: updateError } = await supabase
        .from('community_comments')
        .update({ likes: currentLikes })
        .eq('id', commentId);

    if (updateError) throw updateError;
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

// ============================================================================
// NATIVE CONNECTION WORKFLOWS
// ============================================================================

// --- 1. 6-Digit PIN Method ---

export const generateConnectionPin = async (patientId: string): Promise<string> => {
    // Generate a random 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    // Expires in 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60000).toISOString();

    const { error } = await supabase.from('patient_pins').insert({
        pin,
        patient_id: patientId,
        expires_at: expiresAt
    });

    if (error) {
        console.error('Error generating PIN:', error);
        throw error;
    }
    return pin;
};

export const connectViaPin = async (doctorId: string, pin: string): Promise<Profile | null> => {
    // First, try to fetch the PIN to see if it exists and is not expired
    const { data: pinData, error: pinError } = await supabase
        .from('patient_pins')
        .select('patient_id, expires_at')
        .eq('pin', pin)
        .single();

    if (pinError || !pinData) {
        console.error('PIN error or not found:', pinError);
        throw new Error('Invalid or expired PIN.');
    }

    if (new Date(pinData.expires_at) < new Date()) {
        throw new Error('This PIN has expired.');
    }

    const patientId = pinData.patient_id;

    // Link the patient to the doctor
    await addPatientToDoctor(doctorId, patientId);

    // Fetch the patient profile to return it
    const profile = await getProfile(patientId);

    // Delete the PIN so it can't be reused
    await supabase.from('patient_pins').delete().eq('pin', pin);

    return profile;
};

// --- 2. Global Search & Approval Workflow ---

export const searchPatients = async (query: string): Promise<Profile[]> => {
    if (!query) return [];

    const { data, error } = await supabase
        .rpc('search_profiles', { search_query: query, filter_role: 'patient' });

    if (error) {
        console.error('Error searching patients:', error);
        throw error;
    }

    return data || [];
};

export const sendConnectionRequest = async (doctorId: string, patientId: string): Promise<void> => {
    const { error } = await supabase.from('connection_requests').insert({
        doctor_id: doctorId,
        patient_id: patientId,
        status: 'pending'
    });

    if (error) {
        console.error('Error sending connection request:', error);
        throw error;
    }
};

export const getPendingRequests = async (patientId: string): Promise<any[]> => {
    const { data, error } = await supabase
        .from('connection_requests')
        .select('id, doctor_id, created_at, status')
        .eq('patient_id', patientId)
        .eq('status', 'pending');

    if (error) {
        console.error('Error getting pending requests:', error);
        return [];
    }

    // We need to fetch the doctor's name for each request
    const requests = [];
    for (const req of (data || [])) {
        const doctorProfile = await getProfile(req.doctor_id);
        requests.push({
            id: req.id,
            doctorId: req.doctor_id,
            doctorName: doctorProfile.name || 'Unknown Doctor',
            createdAt: req.created_at,
            status: req.status
        });
    }

    return requests;
};

export const approveConnectionRequest = async (requestId: string, patientId: string, doctorId: string): Promise<void> => {
    // Update status to approved
    const { error: updateError } = await supabase
        .from('connection_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

    if (updateError) {
        console.error('Error approving request:', updateError);
        throw updateError;
    }

    // Link the patient and doctor natively
    await addPatientToDoctor(doctorId, patientId);
};

export const rejectConnectionRequest = async (requestId: string): Promise<void> => {
    const { error } = await supabase
        .from('connection_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

    if (error) {
        console.error('Error rejecting request:', error);
        throw error;
    }
};

// ============================================================================
// PRESCRIPTIONS
// ============================================================================

const mapPrescription = (data: any): Prescription => ({
    id: data.id,
    doctorId: data.doctor_id,
    patientId: data.patient_id,
    appointmentId: data.appointment_id || undefined,
    diagnosis: data.diagnosis || undefined,
    diagnosisCodes: data.diagnosis_codes || [],
    medications: data.medications || [],
    testsAdvised: data.tests_advised || [],
    notes: data.notes || undefined,
    advice: data.advice || undefined,
    followUpDate: data.follow_up_date || undefined,
    createdAt: data.created_at,
});

export const getPrescriptionsForPatient = async (patientId: string): Promise<Prescription[]> => {
    const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching prescriptions:', error);
        throw error;
    }
    return (data || []).map(mapPrescription);
};

export const createPrescription = async (
    doctorId: string,
    patientId: string,
    prescription: {
        appointmentId?: string;
        diagnosis?: string;
        diagnosisCodes?: DiagnosisCode[];
        medications: PrescriptionMedication[];
        testsAdvised?: string[];
        notes?: string;
        advice?: string;
        followUpDate?: string;
    }
): Promise<Prescription> => {
    const { data, error } = await supabase
        .from('prescriptions')
        .insert({
            doctor_id: doctorId,
            patient_id: patientId,
            appointment_id: prescription.appointmentId || null,
            diagnosis: prescription.diagnosis || null,
            diagnosis_codes: prescription.diagnosisCodes || [],
            medications: prescription.medications,
            tests_advised: prescription.testsAdvised || [],
            notes: prescription.notes || null,
            advice: prescription.advice || null,
            follow_up_date: prescription.followUpDate || null,
        })
        .select('*')
        .single();

    if (error) {
        console.error('Error creating prescription:', error);
        throw error;
    }

    await createNotification({
        userId: patientId,
        type: 'message',
        title: 'New prescription from your doctor',
        body: prescription.diagnosis ? `Diagnosis: ${prescription.diagnosis}` : 'A new prescription has been added to your records.',
        link: '/medications',
    });

    return mapPrescription(data);
};

export const deletePrescription = async (prescriptionId: string): Promise<void> => {
    const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', prescriptionId);

    if (error) {
        console.error('Error deleting prescription:', error);
        throw error;
    }
};

// ============================================================================
// CLINICAL TEMPLATES (Rx-groups, complaint shortcuts, test panels)
// ============================================================================

const mapClinicalTemplate = (data: any): ClinicalTemplate => ({
    id: data.id,
    doctorId: data.doctor_id,
    type: data.type || 'rx_group',
    name: data.name,
    diagnosis: data.diagnosis || undefined,
    diagnosisCodes: data.diagnosis_codes || [],
    medications: data.medications || [],
    tests: data.tests || [],
    advice: data.advice || undefined,
    notes: data.notes || undefined,
    sortOrder: data.sort_order ?? 0,
    createdAt: data.created_at,
});

export const getClinicalTemplates = async (doctorId: string, type?: ClinicalTemplateType): Promise<ClinicalTemplate[]> => {
    let query = supabase
        .from('clinical_templates')
        .select('*')
        .eq('doctor_id', doctorId);

    if (type) query = query.eq('type', type);

    const { data, error } = await query
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching clinical templates:', error);
        throw error;
    }
    return (data || []).map(mapClinicalTemplate);
};

export const createClinicalTemplate = async (
    doctorId: string,
    template: {
        type: ClinicalTemplateType;
        name: string;
        diagnosis?: string;
        diagnosisCodes?: DiagnosisCode[];
        medications?: PrescriptionMedication[];
        tests?: string[];
        advice?: string;
        notes?: string;
    }
): Promise<ClinicalTemplate> => {
    const { data, error } = await supabase
        .from('clinical_templates')
        .insert({
            doctor_id: doctorId,
            type: template.type,
            name: template.name,
            diagnosis: template.diagnosis || null,
            diagnosis_codes: template.diagnosisCodes || [],
            medications: template.medications || [],
            tests: template.tests || [],
            advice: template.advice || null,
            notes: template.notes || null,
        })
        .select('*')
        .single();

    if (error) {
        console.error('Error creating clinical template:', error);
        throw error;
    }
    return mapClinicalTemplate(data);
};

export const deleteClinicalTemplate = async (templateId: string): Promise<void> => {
    const { error } = await supabase
        .from('clinical_templates')
        .delete()
        .eq('id', templateId);

    if (error) {
        console.error('Error deleting clinical template:', error);
        throw error;
    }
};

export const updateClinicalTemplate = async (
    templateId: string,
    updates: { name?: string; sortOrder?: number }
): Promise<void> => {
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;

    const { error } = await supabase
        .from('clinical_templates')
        .update(payload)
        .eq('id', templateId);

    if (error) {
        console.error('Error updating clinical template:', error);
        throw error;
    }
};

// ============================================================================
// DENTAL CHART
// ============================================================================

export const getDentalChart = async (doctorId: string, patientId: string): Promise<DentalChart | null> => {
    const { data, error } = await supabase
        .from('dental_charts')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('patient_id', patientId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching dental chart:', error);
        throw error;
    }
    if (!data) return null;
    return { teeth: data.teeth || {}, notes: data.notes || undefined, updatedAt: data.updated_at };
};

export const saveDentalChart = async (
    doctorId: string,
    patientId: string,
    chart: { teeth: Record<string, string>; notes?: string }
): Promise<void> => {
    const { error } = await supabase
        .from('dental_charts')
        .upsert({
            doctor_id: doctorId,
            patient_id: patientId,
            teeth: chart.teeth,
            notes: chart.notes || null,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'doctor_id,patient_id' });

    if (error) {
        console.error('Error saving dental chart:', error);
        throw error;
    }
};

// ============================================================================
// INVOICES / BILLING
// ============================================================================

const mapInvoice = (data: any): Invoice => ({
    id: data.id,
    doctorId: data.doctor_id,
    patientId: data.patient_id,
    patientName: data.patient_name || undefined,
    appointmentId: data.appointment_id || undefined,
    items: data.items || [],
    total: Number(data.total) || 0,
    status: data.status,
    issuedDate: data.issued_date,
    dueDate: data.due_date || undefined,
    notes: data.notes || undefined,
    createdAt: data.created_at,
});

export const getInvoicesForDoctor = async (doctorId: string): Promise<Invoice[]> => {
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('issued_date', { ascending: false });

    if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
    }
    return (data || []).map(mapInvoice);
};

export const getInvoicesForPatient = async (patientId: string): Promise<Invoice[]> => {
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('patient_id', patientId)
        .order('issued_date', { ascending: false });

    if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
    }
    return (data || []).map(mapInvoice);
};

export const createInvoice = async (
    doctorId: string,
    patientId: string,
    invoice: {
        patientName?: string;
        appointmentId?: string;
        items: InvoiceItem[];
        status?: 'due' | 'paid' | 'partial';
        issuedDate?: string;
        dueDate?: string;
        notes?: string;
    }
): Promise<Invoice> => {
    const total = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const { data, error } = await supabase
        .from('invoices')
        .insert({
            doctor_id: doctorId,
            patient_id: patientId,
            patient_name: invoice.patientName || null,
            appointment_id: invoice.appointmentId || null,
            items: invoice.items,
            total,
            status: invoice.status || 'due',
            issued_date: invoice.issuedDate || getTodayDateString(),
            due_date: invoice.dueDate || null,
            notes: invoice.notes || null,
        })
        .select('*')
        .single();

    if (error) {
        console.error('Error creating invoice:', error);
        throw error;
    }

    await createNotification({
        userId: patientId,
        type: 'billing',
        title: 'New invoice generated',
        body: `An invoice for ₹${total.toFixed(2)} has been generated for your visit.`,
        link: '/health-summary',
    });

    return mapInvoice(data);
};

export const updateInvoiceStatus = async (invoiceId: string, status: 'due' | 'paid' | 'partial'): Promise<void> => {
    const { error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', invoiceId);

    if (error) {
        console.error('Error updating invoice status:', error);
        throw error;
    }
};

export const deleteInvoice = async (invoiceId: string): Promise<void> => {
    const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

    if (error) {
        console.error('Error deleting invoice:', error);
        throw error;
    }
};

// ============================================================================
// PRACTICE ANALYTICS
// ============================================================================

export interface PracticeAnalytics {
    monthlyPatientCounts: { month: string; count: number }[]; // new patients added per month (last 6 months)
    monthlyAppointmentCounts: { month: string; count: number }[]; // appointments per month (last 6 months)
    monthlyRevenue: { month: string; total: number }[]; // invoice totals per month (last 6 months)
    topDiagnoses: { diagnosis: string; count: number }[];
    completionRate: number; // % of past appointments marked Completed
    totalPatients: number;
    totalAppointments: number;
}

const lastNMonthsLabels = (n: number): { key: string; label: string }[] => {
    const months: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        });
    }
    return months;
};

export const getDoctorAnalytics = async (doctorId: string): Promise<PracticeAnalytics> => {
    const months = lastNMonthsLabels(6);
    const monthKeyOf = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    };

    // Patients linked to this doctor
    const { data: links, error: linkError } = await supabase
        .from('doctor_patients')
        .select('patient_id, created_at')
        .eq('doctor_id', doctorId);

    if (linkError) {
        console.error('Error fetching doctor patients for analytics:', linkError);
        throw linkError;
    }
    const patientIds = (links || []).map(l => l.patient_id);

    const monthlyPatientCounts = months.map(({ key, label }) => ({
        month: label,
        count: (links || []).filter(l => monthKeyOf(l.created_at) === key).length,
    }));

    // Appointments for these patients
    let appointments: { date_time: string; status: string }[] = [];
    if (patientIds.length > 0) {
        const { data: appts, error: apptError } = await supabase
            .from('appointments')
            .select('date_time, status')
            .in('user_id', patientIds);

        if (apptError) {
            console.error('Error fetching appointments for analytics:', apptError);
        } else {
            appointments = appts || [];
        }
    }

    const monthlyAppointmentCounts = months.map(({ key, label }) => ({
        month: label,
        count: appointments.filter(a => monthKeyOf(a.date_time) === key).length,
    }));

    const now = new Date();
    const pastAppointments = appointments.filter(a => new Date(a.date_time) < now);
    const completionRate = pastAppointments.length > 0
        ? Math.round((pastAppointments.filter(a => a.status === 'Completed').length / pastAppointments.length) * 100)
        : 0;

    // Revenue from invoices
    const { data: invoices, error: invoiceError } = await supabase
        .from('invoices')
        .select('total, issued_date')
        .eq('doctor_id', doctorId);

    if (invoiceError) {
        console.error('Error fetching invoices for analytics:', invoiceError);
    }

    const monthlyRevenue = months.map(({ key, label }) => ({
        month: label,
        total: (invoices || [])
            .filter(inv => monthKeyOf(inv.issued_date) === key)
            .reduce((sum, inv) => sum + Number(inv.total || 0), 0),
    }));

    // Top diagnoses from prescriptions
    const { data: prescriptions, error: rxError } = await supabase
        .from('prescriptions')
        .select('diagnosis')
        .eq('doctor_id', doctorId)
        .not('diagnosis', 'is', null);

    if (rxError) {
        console.error('Error fetching prescriptions for analytics:', rxError);
    }

    const diagnosisCounts = new Map<string, number>();
    (prescriptions || []).forEach(p => {
        const d = (p.diagnosis || '').trim();
        if (!d) return;
        diagnosisCounts.set(d, (diagnosisCounts.get(d) || 0) + 1);
    });
    const topDiagnoses = Array.from(diagnosisCounts.entries())
        .map(([diagnosis, count]) => ({ diagnosis, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return {
        monthlyPatientCounts,
        monthlyAppointmentCounts,
        monthlyRevenue,
        topDiagnoses,
        completionRate,
        totalPatients: patientIds.length,
        totalAppointments: appointments.length,
    };
};

// ============================================================================
// REFERRAL MANAGEMENT
// ============================================================================

export const searchDoctors = async (query: string): Promise<Profile[]> => {
    if (!query) return [];

    const { data, error } = await supabase
        .rpc('search_profiles', { search_query: query, filter_role: 'doctor' });

    if (error) {
        console.error('Error searching doctors:', error);
        throw error;
    }

    return data || [];
};

export const getConnectedDoctorsForPatient = async (patientId: string): Promise<(Profile & { id: string })[]> => {
    const { data: links, error: linkError } = await supabase
        .from('doctor_patients')
        .select('doctor_id')
        .eq('patient_id', patientId)
        .eq('status', 'active');

    if (linkError) {
        console.error('Error fetching connected doctors:', linkError);
        return [];
    }

    const doctorIds = (links || []).map(l => l.doctor_id).filter(Boolean);
    if (doctorIds.length === 0) return [];

    const { data, error } = await supabase.from('profiles').select('*').in('id', doctorIds);
    if (error) {
        console.error('Error fetching connected doctor profiles:', error);
        return [];
    }
    return data || [];
};

const mapReferral = (row: any): Referral => ({
    id: row.id,
    referringDoctorId: row.referring_doctor_id,
    referringDoctorName: row.referring_doctor_name || undefined,
    patientId: row.patient_id,
    patientName: row.patient_name || undefined,
    referredToDoctorId: row.referred_to_doctor_id || undefined,
    referredToName: row.referred_to_name,
    specialty: row.specialty || undefined,
    reason: row.reason,
    notes: row.notes || undefined,
    status: row.status,
    createdAt: row.created_at,
});

export const createReferral = async (referral: {
    referringDoctorId: string;
    referringDoctorName?: string;
    patientId: string;
    patientName?: string;
    referredToDoctorId?: string;
    referredToName: string;
    specialty?: string;
    reason: string;
    notes?: string;
}): Promise<Referral> => {
    const { data, error } = await supabase
        .from('referrals')
        .insert({
            referring_doctor_id: referral.referringDoctorId,
            referring_doctor_name: referral.referringDoctorName || null,
            patient_id: referral.patientId,
            patient_name: referral.patientName || null,
            referred_to_doctor_id: referral.referredToDoctorId || null,
            referred_to_name: referral.referredToName,
            specialty: referral.specialty || null,
            reason: referral.reason,
            notes: referral.notes || null,
        })
        .select('*')
        .single();

    if (error) {
        console.error('Error creating referral:', error);
        throw error;
    }

    if (referral.referredToDoctorId) {
        await createNotification({
            userId: referral.referredToDoctorId,
            type: 'referral',
            title: 'New patient referral',
            body: `${referral.referringDoctorName || 'A doctor'} referred ${referral.patientName || 'a patient'} to you${referral.specialty ? ` (${referral.specialty})` : ''}.`,
            link: '/doctor-dashboard',
        });
    }

    return mapReferral(data);
};

export const getOutgoingReferrals = async (doctorId: string): Promise<Referral[]> => {
    const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referring_doctor_id', doctorId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching outgoing referrals:', error);
        throw error;
    }
    return (data || []).map(mapReferral);
};

export const getIncomingReferrals = async (doctorId: string): Promise<Referral[]> => {
    const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_to_doctor_id', doctorId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching incoming referrals:', error);
        throw error;
    }
    return (data || []).map(mapReferral);
};

export const getReferralsForPatient = async (doctorId: string, patientId: string): Promise<Referral[]> => {
    const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referring_doctor_id', doctorId)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching referrals for patient:', error);
        throw error;
    }
    return (data || []).map(mapReferral);
};

export const updateReferralStatus = async (
    referralId: string,
    status: Referral['status'],
    sharedRecordContext?: { referredToDoctorId: string; patientId: string }
): Promise<void> => {
    const { error } = await supabase
        .from('referrals')
        .update({ status })
        .eq('id', referralId);

    if (error) {
        console.error('Error updating referral status:', error);
        throw error;
    }

    // Acknowledging a referral grants the referred-to doctor access to the
    // patient's existing chart, by linking them like any other connected patient.
    if (status === 'acknowledged' && sharedRecordContext) {
        const { error: linkError } = await supabase
            .from('doctor_patients')
            .upsert(
                { doctor_id: sharedRecordContext.referredToDoctorId, patient_id: sharedRecordContext.patientId, status: 'active' },
                { onConflict: 'doctor_id,patient_id', ignoreDuplicates: true }
            );
        if (linkError) {
            console.error('Error linking referred patient to doctor:', linkError);
        }
    }
};

// ============================================================================
// PATIENT MESSAGES & REMINDERS (DOCTOR -> PATIENT)
// ============================================================================

const mapPatientMessage = (row: any): PatientMessage => ({
    id: row.id,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name || undefined,
    patientId: row.patient_id,
    type: row.type,
    title: row.title,
    body: row.body || undefined,
    scheduledFor: row.scheduled_for || undefined,
    isRead: row.is_read,
    createdAt: row.created_at,
});

export const sendPatientMessage = async (message: {
    doctorId: string;
    doctorName?: string;
    patientId: string;
    type: 'message' | 'reminder';
    title: string;
    body?: string;
    scheduledFor?: string;
}): Promise<PatientMessage> => {
    const { data, error } = await supabase
        .from('patient_messages')
        .insert({
            doctor_id: message.doctorId,
            doctor_name: message.doctorName || null,
            patient_id: message.patientId,
            type: message.type,
            title: message.title,
            body: message.body || null,
            scheduled_for: message.scheduledFor || null,
        })
        .select('*')
        .single();

    if (error) {
        console.error('Error sending patient message:', error);
        throw error;
    }

    await createNotification({
        userId: message.patientId,
        type: message.type === 'reminder' ? 'appointment' : 'message',
        title: message.title,
        body: message.body,
        link: '/reminders',
    });

    return mapPatientMessage(data);
};

export const getMessagesSentToPatient = async (doctorId: string, patientId: string): Promise<PatientMessage[]> => {
    const { data, error } = await supabase
        .from('patient_messages')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching sent messages:', error);
        throw error;
    }
    return (data || []).map(mapPatientMessage);
};

export const getMessagesForPatient = async (patientId: string): Promise<PatientMessage[]> => {
    const { data, error } = await supabase
        .from('patient_messages')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching patient messages:', error);
        throw error;
    }
    return (data || []).map(mapPatientMessage);
};

export const markMessageRead = async (messageId: string): Promise<void> => {
    const { error } = await supabase
        .from('patient_messages')
        .update({ is_read: true })
        .eq('id', messageId);

    if (error) {
        console.error('Error marking message as read:', error);
        throw error;
    }
};

export const deletePatientMessage = async (messageId: string): Promise<void> => {
    const { error } = await supabase
        .from('patient_messages')
        .delete()
        .eq('id', messageId);

    if (error) {
        console.error('Error deleting patient message:', error);
        throw error;
    }
};

// ============================================================================
// PUBLIC BOOKING PAGE
// ============================================================================

const mapAvailability = (row: any): DoctorAvailability => ({
    id: row.id,
    doctorId: row.doctor_id,
    dayOfWeek: row.day_of_week,
    startTime: row.start_time?.slice(0, 5),
    endTime: row.end_time?.slice(0, 5),
    slotDurationMinutes: row.slot_duration_minutes,
});

const mapBookingRequest = (row: any): BookingRequest => ({
    id: row.id,
    doctorId: row.doctor_id,
    patientName: row.patient_name,
    patientEmail: row.patient_email || undefined,
    patientPhone: row.patient_phone || undefined,
    requestedDateTime: row.requested_date_time,
    reason: row.reason || undefined,
    status: row.status,
    createdAt: row.created_at,
});

export const getDoctorPublicProfile = async (doctorId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
        .rpc('get_doctor_public_profile', { p_doctor_id: doctorId });

    if (error) {
        console.error('Error fetching doctor public profile:', error);
        throw error;
    }
    return data && data.length > 0 ? data[0] : null;
};

export const updatePublicBookingSettings = async (doctorId: string, settings: { publicBookingEnabled: boolean; bookingBio?: string }): Promise<void> => {
    const { error } = await supabase
        .from('profiles')
        .update({
            public_booking_enabled: settings.publicBookingEnabled,
            booking_bio: settings.bookingBio || null,
        })
        .eq('id', doctorId);

    if (error) {
        console.error('Error updating public booking settings:', error);
        throw error;
    }
};

export const getDoctorAvailability = async (doctorId: string): Promise<DoctorAvailability[]> => {
    const { data, error } = await supabase
        .from('doctor_availability')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('day_of_week', { ascending: true });

    if (error) {
        console.error('Error fetching doctor availability:', error);
        throw error;
    }
    return (data || []).map(mapAvailability);
};

export const setDoctorAvailability = async (doctorId: string, slots: { dayOfWeek: number; startTime: string; endTime: string; slotDurationMinutes: number }[]): Promise<void> => {
    const { error: deleteError } = await supabase
        .from('doctor_availability')
        .delete()
        .eq('doctor_id', doctorId);

    if (deleteError) {
        console.error('Error clearing doctor availability:', deleteError);
        throw deleteError;
    }

    if (slots.length === 0) return;

    const { error } = await supabase
        .from('doctor_availability')
        .insert(slots.map(s => ({
            doctor_id: doctorId,
            day_of_week: s.dayOfWeek,
            start_time: s.startTime,
            end_time: s.endTime,
            slot_duration_minutes: s.slotDurationMinutes,
        })));

    if (error) {
        console.error('Error saving doctor availability:', error);
        throw error;
    }
};

export const createBookingRequest = async (request: {
    doctorId: string;
    patientName: string;
    patientEmail?: string;
    patientPhone?: string;
    requestedDateTime: string;
    reason?: string;
}): Promise<BookingRequest> => {
    const { data, error } = await supabase
        .from('booking_requests')
        .insert({
            doctor_id: request.doctorId,
            patient_name: request.patientName,
            patient_email: request.patientEmail || null,
            patient_phone: request.patientPhone || null,
            requested_date_time: request.requestedDateTime,
            reason: request.reason || null,
        })
        .select('*')
        .single();

    if (error) {
        console.error('Error creating booking request:', error);
        throw error;
    }

    await createNotification({
        userId: request.doctorId,
        type: 'appointment',
        title: 'New booking request',
        body: `${request.patientName} requested an appointment for ${new Date(request.requestedDateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}.`,
        link: '/doctor-dashboard',
    });

    return mapBookingRequest(data);
};

export const getBookingRequests = async (doctorId: string): Promise<BookingRequest[]> => {
    const { data, error } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('requested_date_time', { ascending: true });

    if (error) {
        console.error('Error fetching booking requests:', error);
        throw error;
    }
    return (data || []).map(mapBookingRequest);
};

export const updateBookingRequestStatus = async (requestId: string, status: BookingRequest['status']): Promise<void> => {
    const { error } = await supabase
        .from('booking_requests')
        .update({ status })
        .eq('id', requestId);

    if (error) {
        console.error('Error updating booking request status:', error);
        throw error;
    }
};

// ============================================================================
// CLINIC DATA MODEL
// ============================================================================

const mapClinic = (row: any): Clinic => ({
    id: row.id,
    name: row.name,
    address: row.address || undefined,
    phone: row.phone || undefined,
    email: row.email || undefined,
    specialties: row.specialties || undefined,
    logoUrl: row.logo_url || undefined,
    createdAt: row.created_at,
});

const mapDepartment = (row: any): Department => ({
    id: row.id,
    clinicId: row.clinic_id,
    name: row.name,
    description: row.description || undefined,
    createdAt: row.created_at,
});

const mapClinicStaff = (row: any): ClinicStaff => ({
    id: row.id,
    clinicId: row.clinic_id,
    userId: row.user_id || undefined,
    staffName: row.staff_name || undefined,
    staffEmail: row.staff_email || undefined,
    role: row.role,
    departmentId: row.department_id || undefined,
    status: row.status,
    createdAt: row.created_at,
});

const mapQueueEntry = (row: any): ClinicQueueEntry => ({
    id: row.id,
    clinicId: row.clinic_id,
    patientName: row.patient_name,
    patientPhone: row.patient_phone || undefined,
    doctorId: row.doctor_id || undefined,
    departmentId: row.department_id || undefined,
    status: row.status,
    tokenNumber: row.token_number || undefined,
    notes: row.notes || undefined,
    checkedInAt: row.checked_in_at,
    calledAt: row.called_at || undefined,
    completedAt: row.completed_at || undefined,
});

export const getClinic = async (clinicId: string): Promise<Clinic | null> => {
    const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', clinicId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching clinic:', error);
        throw error;
    }
    return data ? mapClinic(data) : null;
};

export const saveClinic = async (clinicId: string, clinic: { name: string; address?: string; phone?: string; email?: string; specialties?: string[] }): Promise<Clinic> => {
    const { data, error } = await supabase
        .from('clinics')
        .upsert({
            id: clinicId,
            name: clinic.name,
            address: clinic.address || null,
            phone: clinic.phone || null,
            email: clinic.email || null,
            specialties: clinic.specialties || null,
        })
        .select('*')
        .single();

    if (error) {
        console.error('Error saving clinic:', error);
        throw error;
    }
    return mapClinic(data);
};

export const getDepartments = async (clinicId: string): Promise<Department[]> => {
    const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching departments:', error);
        throw error;
    }
    return (data || []).map(mapDepartment);
};

export const createDepartment = async (clinicId: string, name: string, description?: string): Promise<Department> => {
    const { data, error } = await supabase
        .from('departments')
        .insert({ clinic_id: clinicId, name, description: description || null })
        .select('*')
        .single();

    if (error) {
        console.error('Error creating department:', error);
        throw error;
    }
    return mapDepartment(data);
};

export const deleteDepartment = async (departmentId: string): Promise<void> => {
    const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', departmentId);

    if (error) {
        console.error('Error deleting department:', error);
        throw error;
    }
};

export const getDoctorClinics = async (doctorId: string): Promise<{ id: string; name: string }[]> => {
    const { data, error } = await supabase
        .from('clinic_staff')
        .select('clinic_id, clinics(name)')
        .eq('user_id', doctorId)
        .eq('role', 'doctor')
        .eq('status', 'active');

    if (error) {
        console.error('Error fetching doctor clinics:', error);
        return [];
    }
    return (data || [])
        .filter((row: any) => row.clinic_id)
        .map((row: any) => ({ id: row.clinic_id as string, name: row.clinics?.name || 'Clinic' }));
};

export const getClinicStaff = async (clinicId: string): Promise<ClinicStaff[]> => {
    const { data, error } = await supabase
        .from('clinic_staff')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching clinic staff:', error);
        throw error;
    }
    return (data || []).map(mapClinicStaff);
};

export const inviteClinicStaff = async (clinicId: string, invite: { email: string; role: ClinicStaff['role']; departmentId?: string }): Promise<ClinicStaff> => {
    // Try to find an existing profile with this email to link the invite
    const { data: matches } = await supabase
        .from('profiles')
        .select('id, name, email')
        .ilike('email', invite.email)
        .limit(1);

    const matchedProfile = matches && matches.length > 0 ? matches[0] : null;

    const { data, error } = await supabase
        .from('clinic_staff')
        .insert({
            clinic_id: clinicId,
            user_id: matchedProfile?.id || null,
            staff_name: matchedProfile?.name || null,
            staff_email: invite.email,
            role: invite.role,
            department_id: invite.departmentId || null,
            status: matchedProfile ? 'active' : 'pending',
        })
        .select('*')
        .single();

    if (error) {
        console.error('Error inviting clinic staff:', error);
        throw error;
    }
    return mapClinicStaff(data);
};

export const updateClinicStaff = async (staffId: string, patch: { role?: ClinicStaff['role']; departmentId?: string | null; status?: ClinicStaff['status'] }): Promise<void> => {
    const update: any = {};
    if (patch.role) update.role = patch.role;
    if (patch.departmentId !== undefined) update.department_id = patch.departmentId;
    if (patch.status) update.status = patch.status;

    const { error } = await supabase
        .from('clinic_staff')
        .update(update)
        .eq('id', staffId);

    if (error) {
        console.error('Error updating clinic staff:', error);
        throw error;
    }
};

export const removeClinicStaff = async (staffId: string): Promise<void> => {
    const { error } = await supabase
        .from('clinic_staff')
        .delete()
        .eq('id', staffId);

    if (error) {
        console.error('Error removing clinic staff:', error);
        throw error;
    }
};

export const getClinicQueue = async (clinicId: string): Promise<ClinicQueueEntry[]> => {
    const { data, error } = await supabase
        .from('clinic_queue')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('checked_in_at', { ascending: true });

    if (error) {
        console.error('Error fetching clinic queue:', error);
        throw error;
    }
    return (data || []).map(mapQueueEntry);
};

export const addToQueue = async (clinicId: string, entry: { patientName: string; patientPhone?: string; doctorId?: string; departmentId?: string; notes?: string; tokenNumber?: number }): Promise<ClinicQueueEntry> => {
    const { data, error } = await supabase
        .from('clinic_queue')
        .insert({
            clinic_id: clinicId,
            patient_name: entry.patientName,
            patient_phone: entry.patientPhone || null,
            doctor_id: entry.doctorId || null,
            department_id: entry.departmentId || null,
            notes: entry.notes || null,
            token_number: entry.tokenNumber || null,
        })
        .select('*')
        .single();

    if (error) {
        console.error('Error adding to clinic queue:', error);
        throw error;
    }
    return mapQueueEntry(data);
};

export const updateQueueStatus = async (queueId: string, status: ClinicQueueEntry['status']): Promise<void> => {
    const update: any = { status };
    if (status === 'in_progress') update.called_at = new Date().toISOString();
    if (status === 'completed') update.completed_at = new Date().toISOString();

    const { error } = await supabase
        .from('clinic_queue')
        .update(update)
        .eq('id', queueId);

    if (error) {
        console.error('Error updating queue status:', error);
        throw error;
    }
};

export const removeFromQueue = async (queueId: string): Promise<void> => {
    const { error } = await supabase
        .from('clinic_queue')
        .delete()
        .eq('id', queueId);

    if (error) {
        console.error('Error removing from queue:', error);
        throw error;
    }
};

// ============================================================================
// CLINIC-WIDE BILLING & ANALYTICS
// ============================================================================

const getActiveClinicDoctors = async (clinicId: string): Promise<{ id: string; name: string }[]> => {
    const { data, error } = await supabase
        .from('clinic_staff')
        .select('user_id, staff_name')
        .eq('clinic_id', clinicId)
        .eq('role', 'doctor')
        .eq('status', 'active')
        .not('user_id', 'is', null);

    if (error) {
        console.error('Error fetching clinic doctors:', error);
        throw error;
    }
    return (data || []).map(d => ({ id: d.user_id as string, name: d.staff_name || 'Doctor' }));
};

export interface ClinicInvoice extends Invoice {
    doctorName?: string;
}

export const getClinicInvoices = async (clinicId: string): Promise<ClinicInvoice[]> => {
    const doctors = await getActiveClinicDoctors(clinicId);
    if (doctors.length === 0) return [];
    const doctorNameMap = new Map(doctors.map(d => [d.id, d.name]));

    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .in('doctor_id', doctors.map(d => d.id))
        .order('issued_date', { ascending: false });

    if (error) {
        console.error('Error fetching clinic invoices:', error);
        throw error;
    }
    return (data || []).map(row => ({ ...mapInvoice(row), doctorName: doctorNameMap.get(row.doctor_id) || 'Doctor' }));
};

export interface ClinicAnalytics {
    totalDoctors: number;
    totalPatients: number;
    totalAppointments: number;
    completionRate: number;
    monthlyAppointmentCounts: { month: string; count: number }[];
    monthlyRevenue: { month: string; total: number }[];
    doctorUtilization: { doctorName: string; appointments: number }[];
    topDiagnoses: { diagnosis: string; count: number }[];
}

export const getClinicAnalytics = async (clinicId: string): Promise<ClinicAnalytics> => {
    const months = lastNMonthsLabels(6);
    const monthKeyOf = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    };

    const doctors = await getActiveClinicDoctors(clinicId);
    if (doctors.length === 0) {
        return {
            totalDoctors: 0,
            totalPatients: 0,
            totalAppointments: 0,
            completionRate: 0,
            monthlyAppointmentCounts: months.map(({ label }) => ({ month: label, count: 0 })),
            monthlyRevenue: months.map(({ label }) => ({ month: label, total: 0 })),
            doctorUtilization: [],
            topDiagnoses: [],
        };
    }
    const doctorIds = doctors.map(d => d.id);

    // Patients linked to any of the clinic's active doctors
    const { data: links, error: linkError } = await supabase
        .from('doctor_patients')
        .select('doctor_id, patient_id')
        .in('doctor_id', doctorIds);

    if (linkError) {
        console.error('Error fetching clinic doctor-patient links:', linkError);
        throw linkError;
    }

    const uniquePatientIds = Array.from(new Set((links || []).map(l => l.patient_id)));

    // Appointments for those patients
    let appointments: { date_time: string; status: string; user_id: string }[] = [];
    if (uniquePatientIds.length > 0) {
        const { data: appts, error: apptError } = await supabase
            .from('appointments')
            .select('date_time, status, user_id')
            .in('user_id', uniquePatientIds);

        if (apptError) {
            console.error('Error fetching clinic appointments:', apptError);
        } else {
            appointments = appts || [];
        }
    }

    const monthlyAppointmentCounts = months.map(({ key, label }) => ({
        month: label,
        count: appointments.filter(a => monthKeyOf(a.date_time) === key).length,
    }));

    const now = new Date();
    const pastAppointments = appointments.filter(a => new Date(a.date_time) < now);
    const completionRate = pastAppointments.length > 0
        ? Math.round((pastAppointments.filter(a => a.status === 'Completed').length / pastAppointments.length) * 100)
        : 0;

    // Doctor utilization: count appointments per doctor via the patient links
    const patientToDoctors = new Map<string, string[]>();
    (links || []).forEach(l => {
        const arr = patientToDoctors.get(l.patient_id) || [];
        arr.push(l.doctor_id);
        patientToDoctors.set(l.patient_id, arr);
    });
    const utilCounts = new Map<string, number>();
    appointments.forEach(a => {
        (patientToDoctors.get(a.user_id) || []).forEach(doctorId => {
            utilCounts.set(doctorId, (utilCounts.get(doctorId) || 0) + 1);
        });
    });
    const doctorUtilization = doctors
        .map(d => ({ doctorName: d.name, appointments: utilCounts.get(d.id) || 0 }))
        .sort((a, b) => b.appointments - a.appointments);

    // Revenue from invoices
    const { data: invoices, error: invError } = await supabase
        .from('invoices')
        .select('total, issued_date')
        .in('doctor_id', doctorIds);

    if (invError) {
        console.error('Error fetching clinic invoices for analytics:', invError);
    }

    const monthlyRevenue = months.map(({ key, label }) => ({
        month: label,
        total: (invoices || [])
            .filter(inv => monthKeyOf(inv.issued_date) === key)
            .reduce((sum, inv) => sum + Number(inv.total || 0), 0),
    }));

    // Top diagnoses across the clinic's doctors
    const { data: prescriptions, error: rxError } = await supabase
        .from('prescriptions')
        .select('diagnosis')
        .in('doctor_id', doctorIds)
        .not('diagnosis', 'is', null);

    if (rxError) {
        console.error('Error fetching clinic prescriptions for analytics:', rxError);
    }

    const diagnosisCounts = new Map<string, number>();
    (prescriptions || []).forEach(p => {
        const d = (p.diagnosis || '').trim();
        if (!d) return;
        diagnosisCounts.set(d, (diagnosisCounts.get(d) || 0) + 1);
    });
    const topDiagnoses = Array.from(diagnosisCounts.entries())
        .map(([diagnosis, count]) => ({ diagnosis, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return {
        totalDoctors: doctors.length,
        totalPatients: uniquePatientIds.length,
        totalAppointments: appointments.length,
        completionRate,
        monthlyAppointmentCounts,
        monthlyRevenue,
        doctorUtilization,
        topDiagnoses,
    };
};

// ============================================================================
// CLINIC PUBLIC PROFILE PAGE
// ============================================================================

export interface ClinicPublicProfile {
    clinic: Clinic;
    departments: Department[];
    doctors: Profile[];
}

// ─────────────────────────────────────────────────────────────────────────
// Audit log
// ─────────────────────────────────────────────────────────────────────────
const mapAuditLog = (row: any): AuditLogEntry => ({
    id: row.id,
    actorId: row.actor_id || undefined,
    actorName: row.actor_name || undefined,
    actorRole: row.actor_role || undefined,
    clinicId: row.clinic_id || undefined,
    action: row.action,
    entityType: row.entity_type || undefined,
    entityId: row.entity_id || undefined,
    details: row.details || undefined,
    createdAt: row.created_at,
});

export const logAuditEvent = async (entry: {
    actorId: string;
    actorName?: string;
    actorRole?: string;
    clinicId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    details?: Record<string, any>;
}): Promise<void> => {
    const { error } = await supabase.from('audit_logs').insert({
        actor_id: entry.actorId,
        actor_name: entry.actorName,
        actor_role: entry.actorRole,
        clinic_id: entry.clinicId,
        action: entry.action,
        entity_type: entry.entityType,
        entity_id: entry.entityId,
        details: entry.details,
    });
    if (error) {
        console.error('Error logging audit event:', error);
    }
};

export const getClinicAuditLog = async (clinicId: string, limit = 100): Promise<AuditLogEntry[]> => {
    const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching audit log:', error);
        return [];
    }
    return (data || []).map(mapAuditLog);
};

// ─────────────────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────────────────
const mapNotification = (row: any): AppNotification => ({
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body || undefined,
    link: row.link || undefined,
    isRead: row.is_read,
    createdAt: row.created_at,
});

export const createNotification = async (notification: {
    userId: string;
    type: AppNotification['type'];
    title: string;
    body?: string;
    link?: string;
}): Promise<void> => {
    const { error } = await supabase.from('notifications').insert({
        user_id: notification.userId,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        link: notification.link,
    });
    if (error) {
        console.error('Error creating notification:', error);
    }
};

export const getNotifications = async (userId: string, limit = 30): Promise<AppNotification[]> => {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
    return (data || []).map(mapNotification);
};

export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
    const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) {
        console.error('Error fetching unread notification count:', error);
        return 0;
    }
    return count || 0;
};

export const markNotificationRead = async (notificationId: string): Promise<void> => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
    if (error) {
        console.error('Error marking notification read:', error);
    }
};

export const markAllNotificationsRead = async (userId: string): Promise<void> => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
    if (error) {
        console.error('Error marking all notifications read:', error);
    }
};

// ─────────────────────────────────────────────────────────────────────────
// Patient feedback / reviews
// ─────────────────────────────────────────────────────────────────────────
const mapReview = (row: any): Review => ({
    id: row.id,
    patientId: row.patient_id,
    doctorId: row.doctor_id || undefined,
    clinicId: row.clinic_id || undefined,
    appointmentId: row.appointment_id || undefined,
    rating: row.rating,
    comment: row.comment || undefined,
    createdAt: row.created_at,
});

export const createReview = async (review: {
    patientId: string;
    doctorId?: string;
    clinicId?: string;
    appointmentId?: string;
    rating: number;
    comment?: string;
}): Promise<Review> => {
    const { data, error } = await supabase
        .from('reviews')
        .insert({
            patient_id: review.patientId,
            doctor_id: review.doctorId,
            clinic_id: review.clinicId,
            appointment_id: review.appointmentId,
            rating: review.rating,
            comment: review.comment,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating review:', error);
        throw error;
    }

    if (review.doctorId) {
        await createNotification({
            userId: review.doctorId,
            type: 'review',
            title: 'New patient feedback',
            body: `You received a ${review.rating}-star review${review.comment ? `: "${review.comment}"` : '.'}`,
            link: '/doctor-dashboard',
        });
    }

    return mapReview(data);
};

export const getReviewsForDoctor = async (doctorId: string): Promise<Review[]> => {
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching doctor reviews:', error);
        return [];
    }
    return (data || []).map(mapReview);
};

export const getReviewForAppointment = async (appointmentId: string): Promise<Review | null> => {
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('appointment_id', appointmentId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching review for appointment:', error);
        return null;
    }
    return data ? mapReview(data) : null;
};

// ─────────────────────────────────────────────────────────────────────────
// Dynamic scheduler config
// ─────────────────────────────────────────────────────────────────────────
const mapScheduleConfig = (row: any): DoctorScheduleConfig => ({
    doctorId: row.doctor_id,
    clinicId: row.clinic_id || undefined,
    slotDurationMinutes: row.slot_duration_minutes,
    bufferMinutes: row.buffer_minutes,
    allowOverbooking: row.allow_overbooking,
    walkinPriority: row.walkin_priority,
    updatedAt: row.updated_at,
});

export const getDoctorScheduleConfig = async (doctorId: string): Promise<DoctorScheduleConfig | null> => {
    const { data, error } = await supabase
        .from('doctor_schedule_config')
        .select('*')
        .eq('doctor_id', doctorId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching doctor schedule config:', error);
        return null;
    }
    return data ? mapScheduleConfig(data) : null;
};

export const saveDoctorScheduleConfig = async (doctorId: string, config: {
    clinicId?: string;
    slotDurationMinutes: number;
    bufferMinutes: number;
    allowOverbooking: boolean;
    walkinPriority: 'fifo' | 'scheduled_first';
}): Promise<void> => {
    const { error } = await supabase.from('doctor_schedule_config').upsert({
        doctor_id: doctorId,
        clinic_id: config.clinicId,
        slot_duration_minutes: config.slotDurationMinutes,
        buffer_minutes: config.bufferMinutes,
        allow_overbooking: config.allowOverbooking,
        walkin_priority: config.walkinPriority,
        updated_at: new Date().toISOString(),
    }, { onConflict: 'doctor_id' });

    if (error) {
        console.error('Error saving doctor schedule config:', error);
        throw error;
    }
};

export const getClinicScheduleConfigs = async (clinicId: string): Promise<DoctorScheduleConfig[]> => {
    const { data, error } = await supabase
        .from('doctor_schedule_config')
        .select('*')
        .eq('clinic_id', clinicId);

    if (error) {
        console.error('Error fetching clinic schedule configs:', error);
        return [];
    }
    return (data || []).map(mapScheduleConfig);
};

// ─────────────────────────────────────────────────────────────────────────
// Granular permission matrix (custom roles)
// ─────────────────────────────────────────────────────────────────────────
const mapRolePermissions = (row: any): ClinicRolePermissions => ({
    id: row.id,
    clinicId: row.clinic_id,
    roleName: row.role_name,
    permissions: row.permissions || {},
    isCustom: row.is_custom,
    createdAt: row.created_at,
});

export const getClinicRolePermissions = async (clinicId: string): Promise<ClinicRolePermissions[]> => {
    const { data, error } = await supabase
        .from('clinic_role_permissions')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching clinic role permissions:', error);
        return [];
    }
    return (data || []).map(mapRolePermissions);
};

export const saveClinicRolePermissions = async (clinicId: string, roleName: string, permissions: Record<string, boolean>, isCustom = false): Promise<void> => {
    const { error } = await supabase.from('clinic_role_permissions').upsert({
        clinic_id: clinicId,
        role_name: roleName,
        permissions,
        is_custom: isCustom,
    }, { onConflict: 'clinic_id,role_name' });

    if (error) {
        console.error('Error saving clinic role permissions:', error);
        throw error;
    }
};

export const deleteClinicRolePermissions = async (id: string): Promise<void> => {
    const { error } = await supabase.from('clinic_role_permissions').delete().eq('id', id);
    if (error) {
        console.error('Error deleting clinic role permissions:', error);
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────────────────
// Billing / rate-card configuration
// ─────────────────────────────────────────────────────────────────────────
const mapClinicService = (row: any): ClinicService => ({
    id: row.id,
    clinicId: row.clinic_id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    taxRate: Number(row.tax_rate),
    isActive: row.is_active,
    createdAt: row.created_at,
});

export const getClinicServices = async (clinicId: string, activeOnly = false): Promise<ClinicService[]> => {
    let query = supabase.from('clinic_services').select('*').eq('clinic_id', clinicId);
    if (activeOnly) query = query.eq('is_active', true);
    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching clinic services:', error);
        return [];
    }
    return (data || []).map(mapClinicService);
};

export const createClinicService = async (clinicId: string, service: { name: string; category: ClinicService['category']; price: number; taxRate: number }): Promise<ClinicService> => {
    const { data, error } = await supabase
        .from('clinic_services')
        .insert({
            clinic_id: clinicId,
            name: service.name,
            category: service.category,
            price: service.price,
            tax_rate: service.taxRate,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating clinic service:', error);
        throw error;
    }
    return mapClinicService(data);
};

export const updateClinicService = async (serviceId: string, patch: { name?: string; category?: ClinicService['category']; price?: number; taxRate?: number; isActive?: boolean }): Promise<void> => {
    const updates: Record<string, any> = {};
    if (patch.name !== undefined) updates.name = patch.name;
    if (patch.category !== undefined) updates.category = patch.category;
    if (patch.price !== undefined) updates.price = patch.price;
    if (patch.taxRate !== undefined) updates.tax_rate = patch.taxRate;
    if (patch.isActive !== undefined) updates.is_active = patch.isActive;

    const { error } = await supabase.from('clinic_services').update(updates).eq('id', serviceId);
    if (error) {
        console.error('Error updating clinic service:', error);
        throw error;
    }
};

export const deleteClinicService = async (serviceId: string): Promise<void> => {
    const { error } = await supabase.from('clinic_services').delete().eq('id', serviceId);
    if (error) {
        console.error('Error deleting clinic service:', error);
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────────────────
// Intake form builder
// ─────────────────────────────────────────────────────────────────────────
const mapIntakeTemplate = (row: any): ClinicIntakeTemplate => ({
    id: row.id,
    clinicId: row.clinic_id,
    name: row.name,
    fields: (row.fields || []) as IntakeField[],
    consentText: row.consent_text || undefined,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const getClinicIntakeTemplates = async (clinicId: string): Promise<ClinicIntakeTemplate[]> => {
    const { data, error } = await supabase
        .from('clinic_intake_templates')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching intake templates:', error);
        return [];
    }
    return (data || []).map(mapIntakeTemplate);
};

export const getActiveIntakeTemplateForDoctor = async (doctorId: string): Promise<ClinicIntakeTemplate | null> => {
    const { data: staffRow, error: staffError } = await supabase
        .from('clinic_staff')
        .select('clinic_id')
        .eq('user_id', doctorId)
        .eq('role', 'doctor')
        .eq('status', 'active')
        .maybeSingle();

    if (staffError || !staffRow) return null;

    const { data, error } = await supabase
        .from('clinic_intake_templates')
        .select('*')
        .eq('clinic_id', staffRow.clinic_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error || !data) return null;
    return mapIntakeTemplate(data);
};

export const saveIntakeTemplate = async (clinicId: string, template: { id?: string; name: string; fields: IntakeField[]; consentText?: string; isActive: boolean }): Promise<ClinicIntakeTemplate> => {
    const payload = {
        clinic_id: clinicId,
        name: template.name,
        fields: template.fields,
        consent_text: template.consentText,
        is_active: template.isActive,
        updated_at: new Date().toISOString(),
    };

    const query = template.id
        ? supabase.from('clinic_intake_templates').update(payload).eq('id', template.id)
        : supabase.from('clinic_intake_templates').insert(payload);

    const { data, error } = await query.select().single();

    if (error) {
        console.error('Error saving intake template:', error);
        throw error;
    }
    return mapIntakeTemplate(data);
};

export const deleteIntakeTemplate = async (templateId: string): Promise<void> => {
    const { error } = await supabase.from('clinic_intake_templates').delete().eq('id', templateId);
    if (error) {
        console.error('Error deleting intake template:', error);
        throw error;
    }
};

export const getClinicPublicProfile = async (clinicId: string): Promise<ClinicPublicProfile | null> => {
    const clinic = await getClinic(clinicId);
    if (!clinic) return null;

    const [departments, doctorsResult] = await Promise.all([
        getDepartments(clinicId),
        supabase.rpc('get_clinic_public_doctors', { p_clinic_id: clinicId }),
    ]);

    if (doctorsResult.error) {
        console.error('Error fetching clinic doctor profiles:', doctorsResult.error);
    }

    const doctors: Profile[] = doctorsResult.data || [];

    return { clinic, departments, doctors };
};

// ─────────────────────────────────────────────────────────────────────────
// Hospital Ops (Phase 3): beds, IPD, pharmacy, lab orders, insurance claims,
// equipment tracking, and clinic commerce settings
// ─────────────────────────────────────────────────────────────────────────

const mapHospitalBed = (row: any): HospitalBed => ({
    id: row.id,
    clinicId: row.clinic_id,
    wardName: row.ward_name,
    bedNumber: row.bed_number,
    bedType: row.bed_type,
    status: row.status,
    createdAt: row.created_at,
});

export const getHospitalBeds = async (clinicId: string): Promise<HospitalBed[]> => {
    const { data, error } = await supabase
        .from('hospital_beds')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('ward_name', { ascending: true })
        .order('bed_number', { ascending: true });

    if (error) {
        console.error('Error fetching hospital beds:', error);
        return [];
    }
    return (data || []).map(mapHospitalBed);
};

export const createHospitalBed = async (clinicId: string, bed: { wardName: string; bedNumber: string; bedType: HospitalBed['bedType'] }): Promise<HospitalBed> => {
    const { data, error } = await supabase
        .from('hospital_beds')
        .insert({
            clinic_id: clinicId,
            ward_name: bed.wardName,
            bed_number: bed.bedNumber,
            bed_type: bed.bedType,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating hospital bed:', error);
        throw error;
    }
    return mapHospitalBed(data);
};

export const updateHospitalBedStatus = async (bedId: string, status: HospitalBed['status']): Promise<void> => {
    const { error } = await supabase.from('hospital_beds').update({ status }).eq('id', bedId);
    if (error) {
        console.error('Error updating bed status:', error);
        throw error;
    }
};

export const deleteHospitalBed = async (bedId: string): Promise<void> => {
    const { error } = await supabase.from('hospital_beds').delete().eq('id', bedId);
    if (error) {
        console.error('Error deleting hospital bed:', error);
        throw error;
    }
};

const mapIpdAdmission = (row: any): IpdAdmission => ({
    id: row.id,
    clinicId: row.clinic_id,
    patientId: row.patient_id || undefined,
    patientName: row.patient_name,
    bedId: row.bed_id || undefined,
    admittingDoctorId: row.admitting_doctor_id || undefined,
    admittingDoctorName: row.admitting_doctor_name || undefined,
    diagnosis: row.diagnosis || undefined,
    admissionDate: row.admission_date,
    expectedDischargeDate: row.expected_discharge_date || undefined,
    dischargeDate: row.discharge_date || undefined,
    status: row.status,
    notes: row.notes || undefined,
    createdAt: row.created_at,
});

export const getIpdAdmissions = async (clinicId: string): Promise<IpdAdmission[]> => {
    const { data, error } = await supabase
        .from('ipd_admissions')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('admission_date', { ascending: false });

    if (error) {
        console.error('Error fetching IPD admissions:', error);
        return [];
    }
    return (data || []).map(mapIpdAdmission);
};

export const createIpdAdmission = async (clinicId: string, admission: {
    patientName: string;
    bedId?: string;
    admittingDoctorName?: string;
    diagnosis?: string;
    expectedDischargeDate?: string;
    notes?: string;
}): Promise<IpdAdmission> => {
    const { data, error } = await supabase
        .from('ipd_admissions')
        .insert({
            clinic_id: clinicId,
            patient_name: admission.patientName,
            bed_id: admission.bedId || null,
            admitting_doctor_name: admission.admittingDoctorName || null,
            diagnosis: admission.diagnosis || null,
            expected_discharge_date: admission.expectedDischargeDate || null,
            notes: admission.notes || null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating IPD admission:', error);
        throw error;
    }

    if (admission.bedId) {
        await updateHospitalBedStatus(admission.bedId, 'occupied');
    }

    return mapIpdAdmission(data);
};

export const dischargeIpdAdmission = async (admissionId: string, bedId?: string): Promise<void> => {
    const { error } = await supabase
        .from('ipd_admissions')
        .update({ status: 'discharged', discharge_date: new Date().toISOString() })
        .eq('id', admissionId);

    if (error) {
        console.error('Error discharging patient:', error);
        throw error;
    }

    if (bedId) {
        await updateHospitalBedStatus(bedId, 'available');
    }
};

const mapPharmacyInventoryItem = (row: any): PharmacyInventoryItem => ({
    id: row.id,
    clinicId: row.clinic_id,
    medicineName: row.medicine_name,
    category: row.category || undefined,
    sku: row.sku || undefined,
    unit: row.unit,
    stockQuantity: Number(row.stock_quantity),
    reorderLevel: Number(row.reorder_level),
    unitPrice: Number(row.unit_price),
    expiryDate: row.expiry_date || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const getPharmacyInventory = async (clinicId: string): Promise<PharmacyInventoryItem[]> => {
    const { data, error } = await supabase
        .from('pharmacy_inventory')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('medicine_name', { ascending: true });

    if (error) {
        console.error('Error fetching pharmacy inventory:', error);
        return [];
    }
    return (data || []).map(mapPharmacyInventoryItem);
};

export const createPharmacyInventoryItem = async (clinicId: string, item: {
    medicineName: string;
    category?: string;
    sku?: string;
    unit: string;
    stockQuantity: number;
    reorderLevel: number;
    unitPrice: number;
    expiryDate?: string;
}): Promise<PharmacyInventoryItem> => {
    const { data, error } = await supabase
        .from('pharmacy_inventory')
        .insert({
            clinic_id: clinicId,
            medicine_name: item.medicineName,
            category: item.category || null,
            sku: item.sku || null,
            unit: item.unit,
            stock_quantity: item.stockQuantity,
            reorder_level: item.reorderLevel,
            unit_price: item.unitPrice,
            expiry_date: item.expiryDate || null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating pharmacy inventory item:', error);
        throw error;
    }
    return mapPharmacyInventoryItem(data);
};

export const updatePharmacyInventoryItem = async (itemId: string, patch: {
    medicineName?: string;
    category?: string;
    sku?: string;
    unit?: string;
    stockQuantity?: number;
    reorderLevel?: number;
    unitPrice?: number;
    expiryDate?: string;
}): Promise<void> => {
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (patch.medicineName !== undefined) updates.medicine_name = patch.medicineName;
    if (patch.category !== undefined) updates.category = patch.category;
    if (patch.sku !== undefined) updates.sku = patch.sku;
    if (patch.unit !== undefined) updates.unit = patch.unit;
    if (patch.stockQuantity !== undefined) updates.stock_quantity = patch.stockQuantity;
    if (patch.reorderLevel !== undefined) updates.reorder_level = patch.reorderLevel;
    if (patch.unitPrice !== undefined) updates.unit_price = patch.unitPrice;
    if (patch.expiryDate !== undefined) updates.expiry_date = patch.expiryDate;

    const { error } = await supabase.from('pharmacy_inventory').update(updates).eq('id', itemId);
    if (error) {
        console.error('Error updating pharmacy inventory item:', error);
        throw error;
    }
};

export const deletePharmacyInventoryItem = async (itemId: string): Promise<void> => {
    const { error } = await supabase.from('pharmacy_inventory').delete().eq('id', itemId);
    if (error) {
        console.error('Error deleting pharmacy inventory item:', error);
        throw error;
    }
};

const mapPharmacyDispense = (row: any): PharmacyDispense => ({
    id: row.id,
    clinicId: row.clinic_id,
    inventoryId: row.inventory_id || undefined,
    medicineName: row.medicine_name,
    quantity: Number(row.quantity),
    patientName: row.patient_name || undefined,
    dispensedBy: row.dispensed_by || undefined,
    dispensedAt: row.dispensed_at,
});

export const getPharmacyDispenses = async (clinicId: string, limit = 50): Promise<PharmacyDispense[]> => {
    const { data, error } = await supabase
        .from('pharmacy_dispenses')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('dispensed_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching pharmacy dispenses:', error);
        return [];
    }
    return (data || []).map(mapPharmacyDispense);
};

export const dispensePharmacyItem = async (clinicId: string, dispense: {
    inventoryId: string;
    medicineName: string;
    quantity: number;
    currentStock: number;
    patientName?: string;
    dispensedBy?: string;
}): Promise<PharmacyDispense> => {
    const { data, error } = await supabase
        .from('pharmacy_dispenses')
        .insert({
            clinic_id: clinicId,
            inventory_id: dispense.inventoryId,
            medicine_name: dispense.medicineName,
            quantity: dispense.quantity,
            patient_name: dispense.patientName || null,
            dispensed_by: dispense.dispensedBy || null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error recording pharmacy dispense:', error);
        throw error;
    }

    await updatePharmacyInventoryItem(dispense.inventoryId, {
        stockQuantity: Math.max(0, dispense.currentStock - dispense.quantity),
    });

    return mapPharmacyDispense(data);
};

const mapLabOrder = (row: any): LabOrder => ({
    id: row.id,
    clinicId: row.clinic_id,
    patientId: row.patient_id || undefined,
    patientName: row.patient_name,
    doctorId: row.doctor_id || undefined,
    doctorName: row.doctor_name || undefined,
    testName: row.test_name,
    status: row.status,
    orderedAt: row.ordered_at,
    resultUrl: row.result_url || undefined,
    resultNotes: row.result_notes || undefined,
    completedAt: row.completed_at || undefined,
});

export const getLabOrders = async (clinicId: string): Promise<LabOrder[]> => {
    const { data, error } = await supabase
        .from('lab_orders')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('ordered_at', { ascending: false });

    if (error) {
        console.error('Error fetching lab orders:', error);
        return [];
    }
    return (data || []).map(mapLabOrder);
};

export const createLabOrder = async (clinicId: string, order: {
    patientName: string;
    doctorName?: string;
    testName: string;
}): Promise<LabOrder> => {
    const { data, error } = await supabase
        .from('lab_orders')
        .insert({
            clinic_id: clinicId,
            patient_name: order.patientName,
            doctor_name: order.doctorName || null,
            test_name: order.testName,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating lab order:', error);
        throw error;
    }
    return mapLabOrder(data);
};

export const updateLabOrder = async (orderId: string, patch: {
    status?: LabOrder['status'];
    resultUrl?: string;
    resultNotes?: string;
}): Promise<void> => {
    const updates: Record<string, any> = {};
    if (patch.status !== undefined) {
        updates.status = patch.status;
        if (patch.status === 'completed') updates.completed_at = new Date().toISOString();
    }
    if (patch.resultUrl !== undefined) updates.result_url = patch.resultUrl;
    if (patch.resultNotes !== undefined) updates.result_notes = patch.resultNotes;

    const { error } = await supabase.from('lab_orders').update(updates).eq('id', orderId);
    if (error) {
        console.error('Error updating lab order:', error);
        throw error;
    }
};

const mapInsuranceClaim = (row: any): InsuranceClaim => ({
    id: row.id,
    clinicId: row.clinic_id,
    patientId: row.patient_id || undefined,
    patientName: row.patient_name,
    invoiceId: row.invoice_id || undefined,
    insurerName: row.insurer_name,
    policyNumber: row.policy_number || undefined,
    claimAmount: Number(row.claim_amount),
    status: row.status,
    submittedAt: row.submitted_at || undefined,
    settledAt: row.settled_at || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
});

export const getInsuranceClaims = async (clinicId: string): Promise<InsuranceClaim[]> => {
    const { data, error } = await supabase
        .from('insurance_claims')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching insurance claims:', error);
        return [];
    }
    return (data || []).map(mapInsuranceClaim);
};

export const createInsuranceClaim = async (clinicId: string, claim: {
    patientName: string;
    insurerName: string;
    policyNumber?: string;
    claimAmount: number;
    notes?: string;
}): Promise<InsuranceClaim> => {
    const { data, error } = await supabase
        .from('insurance_claims')
        .insert({
            clinic_id: clinicId,
            patient_name: claim.patientName,
            insurer_name: claim.insurerName,
            policy_number: claim.policyNumber || null,
            claim_amount: claim.claimAmount,
            notes: claim.notes || null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating insurance claim:', error);
        throw error;
    }
    return mapInsuranceClaim(data);
};

export const updateInsuranceClaimStatus = async (claimId: string, status: InsuranceClaim['status']): Promise<void> => {
    const updates: Record<string, any> = { status };
    if (status === 'submitted') updates.submitted_at = new Date().toISOString();
    if (status === 'settled') updates.settled_at = new Date().toISOString();

    const { error } = await supabase.from('insurance_claims').update(updates).eq('id', claimId);
    if (error) {
        console.error('Error updating insurance claim:', error);
        throw error;
    }
};

const mapEquipmentAsset = (row: any): EquipmentAsset => ({
    id: row.id,
    clinicId: row.clinic_id,
    name: row.name,
    category: row.category || undefined,
    serialNumber: row.serial_number || undefined,
    location: row.location || undefined,
    status: row.status,
    purchaseDate: row.purchase_date || undefined,
    lastServiceDate: row.last_service_date || undefined,
    nextServiceDate: row.next_service_date || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
});

export const getEquipmentAssets = async (clinicId: string): Promise<EquipmentAsset[]> => {
    const { data, error } = await supabase
        .from('equipment_assets')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching equipment assets:', error);
        return [];
    }
    return (data || []).map(mapEquipmentAsset);
};

export const createEquipmentAsset = async (clinicId: string, asset: {
    name: string;
    category?: string;
    serialNumber?: string;
    location?: string;
    purchaseDate?: string;
    nextServiceDate?: string;
    notes?: string;
}): Promise<EquipmentAsset> => {
    const { data, error } = await supabase
        .from('equipment_assets')
        .insert({
            clinic_id: clinicId,
            name: asset.name,
            category: asset.category || null,
            serial_number: asset.serialNumber || null,
            location: asset.location || null,
            purchase_date: asset.purchaseDate || null,
            next_service_date: asset.nextServiceDate || null,
            notes: asset.notes || null,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating equipment asset:', error);
        throw error;
    }
    return mapEquipmentAsset(data);
};

export const updateEquipmentAsset = async (assetId: string, patch: {
    status?: EquipmentAsset['status'];
    location?: string;
    lastServiceDate?: string;
    nextServiceDate?: string;
    notes?: string;
}): Promise<void> => {
    const updates: Record<string, any> = {};
    if (patch.status !== undefined) updates.status = patch.status;
    if (patch.location !== undefined) updates.location = patch.location;
    if (patch.lastServiceDate !== undefined) updates.last_service_date = patch.lastServiceDate;
    if (patch.nextServiceDate !== undefined) updates.next_service_date = patch.nextServiceDate;
    if (patch.notes !== undefined) updates.notes = patch.notes;

    const { error } = await supabase.from('equipment_assets').update(updates).eq('id', assetId);
    if (error) {
        console.error('Error updating equipment asset:', error);
        throw error;
    }
};

export const deleteEquipmentAsset = async (assetId: string): Promise<void> => {
    const { error } = await supabase.from('equipment_assets').delete().eq('id', assetId);
    if (error) {
        console.error('Error deleting equipment asset:', error);
        throw error;
    }
};

const mapClinicCommerceSettings = (row: any): ClinicCommerceSettings => ({
    clinicId: row.clinic_id,
    commerceEnabled: row.commerce_enabled,
    pharmacyEnabled: row.pharmacy_enabled,
    labEnabled: row.lab_enabled,
    pharmacyMarkupPercent: Number(row.pharmacy_markup_percent),
    labMarkupPercent: Number(row.lab_markup_percent),
    deliveryFee: Number(row.delivery_fee),
    updatedAt: row.updated_at,
});

export const getClinicCommerceSettings = async (clinicId: string): Promise<ClinicCommerceSettings | null> => {
    const { data, error } = await supabase
        .from('clinic_commerce_settings')
        .select('*')
        .eq('clinic_id', clinicId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching clinic commerce settings:', error);
        return null;
    }
    return data ? mapClinicCommerceSettings(data) : null;
};

export const upsertClinicCommerceSettings = async (clinicId: string, settings: {
    commerceEnabled: boolean;
    pharmacyEnabled: boolean;
    labEnabled: boolean;
    pharmacyMarkupPercent: number;
    labMarkupPercent: number;
    deliveryFee: number;
}): Promise<ClinicCommerceSettings> => {
    const { data, error } = await supabase
        .from('clinic_commerce_settings')
        .upsert({
            clinic_id: clinicId,
            commerce_enabled: settings.commerceEnabled,
            pharmacy_enabled: settings.pharmacyEnabled,
            lab_enabled: settings.labEnabled,
            pharmacy_markup_percent: settings.pharmacyMarkupPercent,
            lab_markup_percent: settings.labMarkupPercent,
            delivery_fee: settings.deliveryFee,
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving clinic commerce settings:', error);
        throw error;
    }
    return mapClinicCommerceSettings(data);
};

