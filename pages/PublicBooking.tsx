import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Skeleton from '../components/ui/Skeleton';
import { Stethoscope, CalendarDays, Clock, CheckCircle2 } from '../components/icons/Icons';
import { getDoctorPublicProfile, getDoctorAvailability, createBookingRequest } from '../services/dataSupabase';
import { Profile, DoctorAvailability } from '../types';

const PublicBooking: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!doctorId) return;
      setLoading(true);
      try {
        const [doctorProfile, slots] = await Promise.all([
          getDoctorPublicProfile(doctorId),
          getDoctorAvailability(doctorId),
        ]);
        setProfile(doctorProfile);
        setAvailability(slots);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [doctorId]);

  const generateTimeSlots = useCallback((dateStr: string): string[] => {
    if (!dateStr) return [];
    const dayOfWeek = new Date(dateStr + 'T00:00:00').getDay();
    const dayAvailability = availability.find(a => a.dayOfWeek === dayOfWeek);
    if (!dayAvailability) return [];

    const slots: string[] = [];
    const [startH, startM] = dayAvailability.startTime.split(':').map(Number);
    const [endH, endM] = dayAvailability.endTime.split(':').map(Number);
    let cur = startH * 60 + startM;
    const end = endH * 60 + endM;
    while (cur + dayAvailability.slotDurationMinutes <= end) {
      const h = Math.floor(cur / 60);
      const m = cur % 60;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      cur += dayAvailability.slotDurationMinutes;
    }
    return slots;
  }, [availability]);

  const timeSlots = generateTimeSlots(selectedDate);

  const handleSubmit = async () => {
    setFormError('');
    if (!name.trim()) { setFormError('Please enter your name'); return; }
    if (!selectedDate || !selectedTime) { setFormError('Please choose a date and time'); return; }
    if (!email.trim() && !phone.trim()) { setFormError('Please provide an email or phone number'); return; }
    if (!doctorId) return;

    setSubmitting(true);
    try {
      await createBookingRequest({
        doctorId,
        patientName: name.trim(),
        patientEmail: email.trim() || undefined,
        patientPhone: phone.trim() || undefined,
        requestedDateTime: new Date(`${selectedDate}T${selectedTime}:00`).toISOString(),
        reason: reason.trim() || undefined,
      });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      setFormError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen soft-aurora flex pt-20 justify-center">
        <Skeleton variant="dashboard" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center bg-background p-4">
        <h1 className="text-3xl font-bold text-destructive">Booking page not available</h1>
        <p className="mt-4 text-muted-foreground">This doctor hasn't enabled public booking, or the link is invalid.</p>
      </div>
    );
  }

  const minDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen soft-aurora p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold mx-auto mb-3">
            {(profile.name || 'D').charAt(0).toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold font-heading flex items-center justify-center gap-2">
            <Stethoscope className="h-6 w-6 text-primary" /> Dr. {profile.name}
          </h1>
          {profile.specialty && <p className="text-muted-foreground mt-1">{profile.specialty}</p>}
          {(profile as any).booking_bio && <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">{(profile as any).booking_bio}</p>}
        </header>

        {submitted ? (
          <Card className="shadow-xl">
            <CardContent className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold font-heading">Request Sent!</h2>
              <p className="text-muted-foreground mt-2">Your appointment request has been sent to Dr. {profile.name}. They'll confirm with you shortly.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" /> Request an Appointment</CardTitle>
              <CardDescription>Pick a date and available time slot below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-foreground">Date</label>
                  <Input type="date" min={minDate} value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setSelectedTime(''); }} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Time slot</label>
                  <select
                    value={selectedTime}
                    onChange={e => setSelectedTime(e.target.value)}
                    disabled={!selectedDate || timeSlots.length === 0}
                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
                  >
                    <option value="">{!selectedDate ? 'Select a date first' : timeSlots.length === 0 ? 'No slots available' : 'Choose a time'}</option>
                    {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-foreground">Your name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground">Phone</label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" className="mt-1" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground">Email</label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1" />
              </div>

              <div>
                <label className="text-sm font-semibold text-foreground">Reason for visit (optional)</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={2}
                  className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              {formError && <p className="text-sm text-destructive">{formError}</p>}

              <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                {submitting ? 'Submitting...' : 'Request Appointment'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PublicBooking;
