
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { CalendarDays, Plus, Trash2, Video, Star, Clock, ClipboardList } from '../components/icons/Icons';
import { Appointment } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { getAppointments, addAppointment, deleteAppointment, updateAppointment } from '../services/dataSupabase';
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
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

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

  const now = new Date();
  const upcomingAppointments = appointments.filter(a => new Date(a.dateTime) >= now);
  const pastAppointments = appointments
    .filter(a => new Date(a.dateTime) < now)
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());


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
                      {app.eCheckInComplete ? (
                        <span className="text-sm font-medium text-green-600 self-center mr-auto ml-3">{t('appointments.echeckin_complete', 'eCheck-in Complete!')}</span>
                      ) : (
                        <Button size="sm" onClick={() => handleECheckIn(app)}>{t('appointments.echeckin', 'eCheck-In')}</Button>
                      )}
                      {app.type === 'Video' && <Button size="sm" variant="secondary">{t('appointments.join_video', 'Join Video Visit')}</Button>}
                      {!app.onWaitlist && <Button size="sm" variant="outline" onClick={() => handleWaitlist(app)}><Clock className="mr-2 h-4 w-4" />{t('appointments.waitlist', 'Add to Waitlist')}</Button>}
                      <Link to={`/appointments/${app.id}/prep`}><Button size="sm" variant="outline"><ClipboardList className="mr-2 h-4 w-4" />{t('appointments.prepare', 'Prepare')}</Button></Link>
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
                    {app.summaryId ? (
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/appointments/${app.id}/summary`}>{t('appointments.view_summary', 'View Summary')}</Link>
                      </Button>
                    ) : <span className="text-xs text-muted-foreground">{t('appointments.no_summary', 'No Summary Available')}</span>}
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
    </>
  );
};

export default AppointmentManager;