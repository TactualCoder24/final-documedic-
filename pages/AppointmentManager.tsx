
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { CalendarDays, Plus, Trash2, Video, Star, Clock, ClipboardList } from '../components/icons/Icons';
import { Appointment, Profile, Review, ClinicIntakeTemplate } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { getAppointments, addAppointment, deleteAppointment, updateAppointment, submitIntakeForm, getConnectedDoctorsForPatient, createReview, getReviewForAppointment, getActiveIntakeTemplateForDoctor } from '../services/dataSupabase';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AppointmentManager: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [intakeFile, setIntakeFile] = useState<File | null>(null);
  const [isSubmittingIntake, setIsSubmittingIntake] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<ClinicIntakeTemplate | null>(null);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | boolean>>({});
  const [consentChecked, setConsentChecked] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewAppointment, setReviewAppointment] = useState<Appointment | null>(null);
  const [connectedDoctors, setConnectedDoctors] = useState<(Profile & { id: string })[]>([]);
  const [reviewsByAppointment, setReviewsByAppointment] = useState<Record<string, Review>>({});
  const [reviewDoctorId, setReviewDoctorId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const refreshAppointments = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const data = await getAppointments(user.uid);
      setAppointments(data);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshAppointments();
  }, [refreshAppointments]);

  const handleDelete = async (id: string) => {
    if (user && window.confirm(t('appointments.cancel_confirm', "Are you sure you want to cancel this appointment?"))) {
      await deleteAppointment(user.uid, id);
      await refreshAppointments();
    }
  };

  const handleAddAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const newAppointment = {
      doctorName: formData.get('doctor-name') as string,
      specialty: formData.get('specialty') as string,
      dateTime: formData.get('datetime') as string,
      location: formData.get('location') as string,
      notes: formData.get('notes') as string,
      type: formData.get('type') as 'In-Person' | 'Video',
    };
    if (newAppointment.doctorName && newAppointment.dateTime) {
      await addAppointment(user.uid, newAppointment);
      await refreshAppointments();
      setIsAddModalOpen(false);
    }
  };

  const handleECheckIn = (app: Appointment) => {
    setSelectedAppointment(app);
    setIsCheckInModalOpen(true);
  };

  const completeECheckIn = async () => {
    if (user && selectedAppointment) {
      await updateAppointment(user.uid, { ...selectedAppointment, eCheckInComplete: true });
      await refreshAppointments();
      setIsCheckInModalOpen(false);
      setSelectedAppointment(null);
    }
  };

  const handleWaitlist = async (app: Appointment) => {
    if (user) {
      await updateAppointment(user.uid, { ...app, onWaitlist: true });
      await refreshAppointments();
      setIsWaitlistModalOpen(true);
    }
  };

  const handleIntakeClick = async (app: Appointment) => {
    setSelectedAppointment(app);
    setIsIntakeModalOpen(true);
    setIntakeFile(null);
    setActiveTemplate(null);
    setCustomFieldValues({});
    setConsentChecked(false);
    setHasSignature(false);
    if (user) {
      try {
        const doctors = await getConnectedDoctorsForPatient(user.uid);
        const matched = doctors.find(d => d.name === app.doctorName);
        if (matched?.id) {
          const template = await getActiveIntakeTemplateForDoctor(matched.id);
          if (template) {
            setActiveTemplate(template);
            const defaults: Record<string, string | boolean> = {};
            template.fields.forEach(f => { defaults[f.id] = f.type === 'checkbox' ? false : ''; });
            setCustomFieldValues(defaults);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCustomFieldChange = (fieldId: string, value: string | boolean) => {
    setCustomFieldValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const point = 'touches' in e ? e.touches[0] : e;
    return { x: (point.clientX - rect.left) * scaleX, y: (point.clientY - rect.top) * scaleY };
  };

  const handleSignatureStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = signatureCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    const pos = getCanvasPos(e);
    if (!ctx || !pos) return;
    isDrawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const handleSignatureMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const canvas = signatureCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    const pos = getCanvasPos(e);
    if (!ctx || !pos) return;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const handleSignatureEnd = () => {
    isDrawingRef.current = false;
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleIntakeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !selectedAppointment) return;
    if (activeTemplate?.consentText && (!consentChecked || !hasSignature)) {
      alert('Please review the consent statement, sign, and check the consent box before submitting.');
      return;
    }
    setIsSubmittingIntake(true);
    try {
      const formData = new FormData(e.currentTarget);
      const symptomsDescription = formData.get('symptoms') as string;
      const customFields = activeTemplate ? {
        templateId: activeTemplate.id,
        customResponses: customFieldValues,
        signatureDataUrl: hasSignature ? signatureCanvasRef.current?.toDataURL('image/png') : undefined,
        consentAccepted: consentChecked,
      } : undefined;
      await submitIntakeForm(user.uid, selectedAppointment.id, selectedAppointment.doctorName, symptomsDescription, intakeFile || undefined, customFields);
      await updateAppointment(user.uid, { ...selectedAppointment, status: 'Waiting' });
      await refreshAppointments();
      setIsIntakeModalOpen(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error(err);
      alert('Failed to submit intake form. Please try again.');
    } finally {
      setIsSubmittingIntake(false);
    }
  };

  const now = new Date();
  const upcomingAppointments = appointments.filter(a => new Date(a.dateTime) >= now);
  const pastAppointments = appointments
    .filter(a => new Date(a.dateTime) < now)
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  useEffect(() => {
    if (!user || pastAppointments.length === 0) return;
    let cancelled = false;
    Promise.all(pastAppointments.map(app => getReviewForAppointment(app.id)))
      .then(results => {
        if (cancelled) return;
        const map: Record<string, Review> = {};
        results.forEach((review, i) => {
          if (review) map[pastAppointments[i].id] = review;
        });
        setReviewsByAppointment(map);
      })
      .catch(console.error);
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, appointments]);

  const handleFeedbackClick = async (app: Appointment) => {
    if (!user) return;
    setReviewAppointment(app);
    const existing = reviewsByAppointment[app.id];
    setReviewRating(existing?.rating || 5);
    setReviewComment(existing?.comment || '');
    try {
      const doctors = await getConnectedDoctorsForPatient(user.uid);
      setConnectedDoctors(doctors);
      setReviewDoctorId(existing?.doctorId || doctors[0]?.id || '');
    } catch (err) {
      console.error(err);
      setConnectedDoctors([]);
    }
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !reviewAppointment) return;
    setIsSubmittingReview(true);
    try {
      const review = await createReview({
        patientId: user.uid,
        doctorId: reviewDoctorId || undefined,
        appointmentId: reviewAppointment.id,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setReviewsByAppointment(prev => ({ ...prev, [reviewAppointment.id]: review }));
      setIsReviewModalOpen(false);
      setReviewAppointment(null);
    } catch (err) {
      console.error(err);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };


  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading">{t('appointments.title', 'Appointment Manager')}</h1>
          <p className="text-muted-foreground">{t('appointments.subtitle', 'Keep track of your medical consultations and check-ups.')}</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> {t('appointments.new', 'New Appointment')}
        </Button>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('appointments.upcoming_title', 'Upcoming Appointments')}</CardTitle>
            {!isLoading && <CardDescription>{t('appointments.upcoming_count', 'You have {{count}} upcoming appointments.', { count: upcomingAppointments.length })}</CardDescription>}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-muted-foreground text-center py-10">{t('appointments.loading', 'Loading appointments...')}</p>
              ) : upcomingAppointments.length > 0 ? (
                upcomingAppointments.map(app => (
                  <Card key={app.id} className="overflow-hidden">
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-lg">{app.specialty} {t('appointments.with', 'with')} {app.doctorName}</p>
                        <p className="text-sm font-bold text-primary">{new Date(app.dateTime).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                          {app.type === 'Video' ? <Video className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
                          {app.location}
                        </p>
                      </div>
                      <div>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-yellow-500"><Star className="h-5 w-5" /></Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {app.notes && <p className="text-sm italic p-3 bg-secondary/50 rounded-md">{t('appointments.notes', 'Notes:')} "{app.notes}"</p>}
                    </CardContent>
                    <div className="bg-secondary/30 p-3 flex flex-wrap gap-2 justify-end">
                      {app.status === 'Waiting' || app.status === 'In-Progress' || app.status === 'Completed' ? (
                         <span className="text-sm font-medium text-emerald-600 self-center mr-auto ml-3">
                           ✓ Intake Complete ({app.status})
                         </span>
                      ) : (
                         <Button size="sm" onClick={() => handleIntakeClick(app)} className="mr-auto ml-3">Complete Intake Form</Button>
                      )}
                      {app.eCheckInComplete ? (
                        <span className="text-sm font-medium text-green-600 self-center">eCheck-in Complete!</span>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleECheckIn(app)}>{t('appointments.echeckin', 'eCheck-In')}</Button>
                      )}
                      {app.type === 'Video' && (
                        <Button asChild size="sm" variant="secondary">
                          <Link to={`/consult/${app.id}`}>
                            <Video className="mr-2 h-4 w-4" />{t('appointments.join_video', 'Join Video Visit')}
                          </Link>
                        </Button>
                      )}
                      {!app.onWaitlist && <Button size="sm" variant="outline" onClick={() => handleWaitlist(app)}><Clock className="mr-2 h-4 w-4" />{t('appointments.waitlist', 'Waitlist')}</Button>}
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(app.id)}>{t('appointments.cancel', 'Cancel')}</Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">{t('appointments.no_upcoming', 'No upcoming appointments. Schedule one to get started.')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('appointments.past_title', 'Past Appointments')}</CardTitle>
            {!isLoading && <CardDescription>{t('appointments.past_count', 'You have {{count}} past appointments in your history.', { count: pastAppointments.length })}</CardDescription>}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {isLoading ? (
                <p className="text-muted-foreground text-center py-10">{t('appointments.loading_history', 'Loading history...')}</p>
              ) : pastAppointments.length > 0 ? (
                pastAppointments.map(app => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                    <div className="flex items-center gap-4">
                      <CalendarDays className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{app.specialty} {t('appointments.with', 'with')} {app.doctorName}</p>
                        <p className="text-sm text-muted-foreground">{new Date(app.dateTime).toLocaleDateString([], { dateStyle: 'full' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {app.summaryId ? (
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/appointments/${app.id}/summary`}>{t('appointments.view_summary', 'View Summary')}</Link>
                        </Button>
                      ) : <span className="text-xs text-muted-foreground">{t('appointments.no_summary', 'No Summary Available')}</span>}
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleFeedbackClick(app)}>
                        <Star className={`h-4 w-4 ${reviewsByAppointment[app.id] ? 'fill-yellow-400 text-yellow-500' : ''}`} />
                        {reviewsByAppointment[app.id] ? 'Edit Feedback' : 'Leave Feedback'}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">{t('appointments.no_history', 'No appointment history yet.')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal title={t('appointments.modals.add_title', 'Add New Appointment')} isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <form className="space-y-4" onSubmit={handleAddAppointment}>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1">{t('appointments.modals.visit_type', 'Visit Type')}</label>
            <select id="type" name="type" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="In-Person">{t('appointments.modals.in_person', 'In-Person')}</option>
              <option value="Video">{t('appointments.modals.video', 'Video')}</option>
            </select>
          </div>
          <div>
            <label htmlFor="doctor-name" className="block text-sm font-medium text-foreground mb-1">{t('appointments.modals.doc_name', "Doctor's Name")}</label>
            <Input id="doctor-name" name="doctor-name" placeholder={t('appointments.modals.doc_placeholder', 'e.g., Dr. Sharma')} required />
          </div>
          <div>
            <label htmlFor="specialty" className="block text-sm font-medium text-foreground mb-1">{t('appointments.modals.specialty', 'Specialty')}</label>
            <Input id="specialty" name="specialty" placeholder={t('appointments.modals.spec_placeholder', 'e.g., Cardiologist')} required />
          </div>
          <div>
            <label htmlFor="datetime" className="block text-sm font-medium text-foreground mb-1">{t('appointments.modals.datetime', 'Date & Time')}</label>
            <Input id="datetime" name="datetime" type="datetime-local" required />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1">{t('appointments.modals.location', 'Location')}</label>
            <Input id="location" name="location" placeholder={t('appointments.modals.loc_placeholder', "e.g., City Hospital, or 'Virtual'")} required />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1">{t('appointments.modals.notes', 'Notes / Questions for Doctor (Optional)')}</label>
            <Input id="notes" name="notes" placeholder={t('appointments.modals.notes_placeholder', 'e.g., Ask about new medication options')} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>{t('appointments.modals.cancel', 'Cancel')}</Button>
            <Button type="submit">{t('appointments.modals.add_btn', 'Add Appointment')}</Button>
          </div>
        </form>
      </Modal>

      <Modal title={t('appointments.modals.checkin_title', 'eCheck-In')} isOpen={isCheckInModalOpen} onClose={() => setIsCheckInModalOpen(false)}>
        <p className="text-sm text-muted-foreground mb-4">{t('appointments.modals.checkin_desc', 'Save time at the clinic by completing your check-in now. Please verify your information and sign the consent form.')}</p>
        <div className="space-y-4">
          <div className="p-3 bg-secondary rounded-md">
            <h4 className="font-semibold text-sm">{t('appointments.modals.verify_info', 'Verify Information')}</h4>
            <p className="text-xs text-muted-foreground">{t('appointments.modals.name', 'Name:')} {user?.displayName}, {t('appointments.modals.dob', 'DOB: 01/01/1980 (mock)')}</p>
          </div>
          <div className="p-3 bg-secondary rounded-md">
            <h4 className="font-semibold text-sm">{t('appointments.modals.consent', 'Consent to Treat')}</h4>
            <p className="text-xs text-muted-foreground">{t('appointments.modals.consent_desc', 'I consent to treatment from the provider...')}</p>
            <div className="flex items-center space-x-2 mt-2">
              <input type="checkbox" id="consent" name="consent" className="rounded border-gray-300 text-primary focus:ring-primary" />
              <label htmlFor="consent" className="text-xs font-medium text-foreground">{t('appointments.modals.agree', 'I agree to the terms.')}</label>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={completeECheckIn}>{t('appointments.modals.complete_checkin', 'Complete Check-In')}</Button>
        </div>
      </Modal>

      <Modal title={t('appointments.modals.waitlist_title', 'Fast Pass Waitlist')} isOpen={isWaitlistModalOpen} onClose={() => setIsWaitlistModalOpen(false)}>
        <p>{t('appointments.modals.waitlist_desc', "You've been added to the waitlist! We will notify you via email if an earlier appointment slot becomes available.")}</p>
        <div className="flex justify-end pt-4">
          <Button onClick={() => setIsWaitlistModalOpen(false)}>{t('appointments.modals.ok', 'OK')}</Button>
        </div>
      </Modal>

      <Modal title="Pre-Visit Intake Form" isOpen={isIntakeModalOpen} onClose={() => setIsIntakeModalOpen(false)}>
        <p className="text-sm text-muted-foreground mb-4">Please provide context about your upcoming visit with {selectedAppointment?.doctorName}. This helps your doctor prepare for your visit.</p>
        <form onSubmit={handleIntakeSubmit} className="space-y-4">
          <div>
            <label htmlFor="symptoms" className="block text-sm font-medium text-foreground mb-1">Reason for Visit / Symptoms</label>
            <textarea 
              id="symptoms" 
              name="symptoms" 
              rows={4} 
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
              placeholder="Describe what you are experiencing..." 
              required
            ></textarea>
          </div>
          <div>
             <label htmlFor="file-upload" className="block text-sm font-medium text-foreground mb-1">Upload Photo/Document (Optional)</label>
             <input 
               id="file-upload" 
               type="file" 
               accept="image/*,application/pdf"
               onChange={(e) => setIntakeFile(e.target.files?.[0] || null)}
               className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
             />
             <p className="text-xs text-muted-foreground mt-1">Share a picture of a visible symptom or a related document.</p>
          </div>

          {activeTemplate && activeTemplate.fields.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-border/50">
              <h4 className="text-sm font-semibold">{activeTemplate.name}</h4>
              {activeTemplate.fields.map(field => (
                <div key={field.id}>
                  {field.type === 'checkbox' ? (
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <input
                        type="checkbox"
                        checked={!!customFieldValues[field.id]}
                        onChange={(e) => handleCustomFieldChange(field.id, e.target.checked)}
                        required={field.required}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      {field.label}{field.required && ' *'}
                    </label>
                  ) : field.type === 'textarea' ? (
                    <>
                      <label className="block text-sm font-medium text-foreground mb-1">{field.label}{field.required && ' *'}</label>
                      <textarea
                        rows={3}
                        value={(customFieldValues[field.id] as string) || ''}
                        onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                        required={field.required}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      ></textarea>
                    </>
                  ) : field.type === 'select' ? (
                    <>
                      <label className="block text-sm font-medium text-foreground mb-1">{field.label}{field.required && ' *'}</label>
                      <select
                        value={(customFieldValues[field.id] as string) || ''}
                        onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                        required={field.required}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Select...</option>
                        {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </>
                  ) : (
                    <>
                      <label className="block text-sm font-medium text-foreground mb-1">{field.label}{field.required && ' *'}</label>
                      <Input
                        value={(customFieldValues[field.id] as string) || ''}
                        onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                        required={field.required}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTemplate?.consentText && (
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="p-3 bg-secondary rounded-md">
                <h4 className="font-semibold text-sm mb-1">Consent</h4>
                <p className="text-xs text-muted-foreground">{activeTemplate.consentText}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Signature</label>
                <canvas
                  ref={signatureCanvasRef}
                  width={500}
                  height={150}
                  className="w-full h-32 rounded-md border border-input bg-background touch-none"
                  onMouseDown={handleSignatureStart}
                  onMouseMove={handleSignatureMove}
                  onMouseUp={handleSignatureEnd}
                  onMouseLeave={handleSignatureEnd}
                  onTouchStart={handleSignatureStart}
                  onTouchMove={handleSignatureMove}
                  onTouchEnd={handleSignatureEnd}
                />
                <div className="flex justify-end mt-1">
                  <Button type="button" variant="ghost" size="sm" onClick={clearSignature}>Clear</Button>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                I have read and agree to the consent statement above.
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsIntakeModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmittingIntake}>
               {isSubmittingIntake ? 'Submitting...' : 'Submit to Doctor'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal title="Leave Feedback" isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)}>
        <p className="text-sm text-muted-foreground mb-4">
          Share your experience from your visit{reviewAppointment ? ` on ${new Date(reviewAppointment.dateTime).toLocaleDateString([], { dateStyle: 'medium' })}` : ''}.
        </p>
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          {connectedDoctors.length > 0 && (
            <div>
              <label htmlFor="review-doctor" className="block text-sm font-medium text-foreground mb-1">Doctor</label>
              <select
                id="review-doctor"
                value={reviewDoctorId}
                onChange={(e) => setReviewDoctorId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {connectedDoctors.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name || 'Doctor'}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  className="p-0.5"
                >
                  <Star className={`h-6 w-6 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-500' : 'text-muted-foreground'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="review-comment" className="block text-sm font-medium text-foreground mb-1">Comments (Optional)</label>
            <textarea
              id="review-comment"
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Tell us about your experience..."
            ></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsReviewModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmittingReview}>
              {isSubmittingReview ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AppointmentManager;