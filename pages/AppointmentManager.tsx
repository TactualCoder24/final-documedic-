import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { CalendarDays, Plus, Trash2 } from '../components/icons/Icons';
import { Appointment } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { getAppointments, addAppointment, deleteAppointment } from '../services/data';

const AppointmentManager: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshAppointments = React.useCallback(() => {
    if (user) {
      setAppointments(getAppointments(user.uid));
    }
  }, [user]);

  useEffect(() => {
    refreshAppointments();
  }, [refreshAppointments]);

  const handleDelete = (id: string) => {
    if (user) {
      deleteAppointment(user.uid, id);
      refreshAppointments();
    }
  };

  const handleAddAppointment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const newAppointment = {
        doctorName: formData.get('doctor-name') as string,
        specialty: formData.get('specialty') as string,
        dateTime: formData.get('datetime') as string,
        location: formData.get('location') as string,
        notes: formData.get('notes') as string,
    };
    if (newAppointment.doctorName && newAppointment.dateTime) {
        addAppointment(user.uid, newAppointment);
        refreshAppointments();
        setIsModalOpen(false);
    }
  };

  const now = new Date();
  const upcomingAppointments = appointments.filter(a => new Date(a.dateTime) >= now);
  // Sort past appointments with the most recent first for better UX.
  const pastAppointments = appointments
    .filter(a => new Date(a.dateTime) < now)
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());


  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading">Appointment Manager</h1>
          <p className="text-muted-foreground">Keep track of your medical consultations and check-ups.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Appointment
        </Button>
      </div>

      <div className="space-y-8">
        <Card>
            <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>You have {upcomingAppointments.length} upcoming appointments.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                {upcomingAppointments.map(app => (
                <div key={app.id} className="flex items-start justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-start gap-4">
                    <div className="mt-1">
                        <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold">{app.specialty} with {app.doctorName}</p>
                        <p className="text-sm font-bold text-primary">{new Date(app.dateTime).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>
                        <p className="text-sm text-muted-foreground mt-1">Location: {app.location}</p>
                        {app.notes && <p className="text-sm text-muted-foreground mt-1">Notes: {app.notes}</p>}
                    </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-muted-foreground hover:text-destructive flex-shrink-0" 
                        onClick={() => handleDelete(app.id)}
                        aria-label={`Delete appointment with ${app.doctorName}`}
                    >
                    <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                ))}
                {upcomingAppointments.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">No upcoming appointments. Schedule one to get started.</p>
                    </div>
                )}
            </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>Past Appointments</CardTitle>
            <CardDescription>You have {pastAppointments.length} past appointments in your history.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="space-y-4">
                {pastAppointments.map(app => (
                <div key={app.id} className="flex items-start justify-between p-3 rounded-lg bg-secondary/50 opacity-70">
                    <div className="flex items-start gap-4">
                    <div className="mt-1">
                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-semibold">{app.specialty} with {app.doctorName}</p>
                        <p className="text-sm text-muted-foreground">{new Date(app.dateTime).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>
                    </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-muted-foreground hover:text-destructive flex-shrink-0" 
                        onClick={() => handleDelete(app.id)}
                        aria-label={`Delete appointment with ${app.doctorName}`}
                    >
                    <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                ))}
                {pastAppointments.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">No appointment history yet.</p>
                    </div>
                )}
            </div>
            </CardContent>
        </Card>
      </div>

      <Modal title="Add New Appointment" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
         <form className="space-y-4" onSubmit={handleAddAppointment}>
            <div>
              <label htmlFor="doctor-name" className="block text-sm font-medium text-foreground mb-1">Doctor's Name</label>
              <Input id="doctor-name" name="doctor-name" placeholder="e.g., Dr. Sharma" required />
            </div>
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-foreground mb-1">Specialty</label>
              <Input id="specialty" name="specialty" placeholder="e.g., Cardiologist" required />
            </div>
            <div>
              <label htmlFor="datetime" className="block text-sm font-medium text-foreground mb-1">Date & Time</label>
              <Input id="datetime" name="datetime" type="datetime-local" required />
            </div>
             <div>
              <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1">Location</label>
              <Input id="location" name="location" placeholder="e.g., City Hospital, 2nd Floor" required />
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1">Notes / Questions for Doctor (Optional)</label>
              <Input id="notes" name="notes" placeholder="e.g., Ask about new medication options" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
               <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
               <Button type="submit">Add Appointment</Button>
            </div>
         </form>
      </Modal>
    </>
  );
};

export default AppointmentManager;