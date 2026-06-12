import React, { useState, useEffect, useCallback } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import {
  getProfile,
  updatePublicBookingSettings,
  getDoctorAvailability,
  setDoctorAvailability,
  getBookingRequests,
  updateBookingRequestStatus,
} from '../../services/dataSupabase';
import { DoctorAvailability, BookingRequest } from '../../types';
import { Globe, Copy, CheckCircle2, XCircle, CalendarDays } from '../icons/Icons';
import { useToast } from '../../hooks/useToast';

interface BookingSettingsTabProps {
  doctorId: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface DaySlot {
  enabled: boolean;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

const defaultDaySlot = (): DaySlot => ({ enabled: false, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30 });

const statusStyles: Record<BookingRequest['status'], string> = {
  pending: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  confirmed: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
  declined: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400',
};

const BookingSettingsTab: React.FC<BookingSettingsTabProps> = ({ doctorId }) => {
  const { success, error: toastError } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [bio, setBio] = useState('');
  const [days, setDays] = useState<DaySlot[]>(() => Array.from({ length: 7 }, defaultDaySlot));
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [profile, availability, bookingRequests] = await Promise.all([
        getProfile(doctorId),
        getDoctorAvailability(doctorId),
        getBookingRequests(doctorId),
      ]);
      setEnabled(!!(profile as any).public_booking_enabled);
      setBio((profile as any).booking_bio || '');
      setRequests(bookingRequests);

      const dayMap = new Map<number, DoctorAvailability>();
      availability.forEach(a => dayMap.set(a.dayOfWeek, a));
      setDays(Array.from({ length: 7 }, (_, i) => {
        const a = dayMap.get(i);
        return a
          ? { enabled: true, startTime: a.startTime, endTime: a.endTime, slotDurationMinutes: a.slotDurationMinutes }
          : defaultDaySlot();
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => { load(); }, [load]);

  const updateDay = (idx: number, patch: Partial<DaySlot>) => {
    setDays(prev => prev.map((d, i) => i === idx ? { ...d, ...patch } : d));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePublicBookingSettings(doctorId, { publicBookingEnabled: enabled, bookingBio: bio });
      const slots = days
        .map((d, i) => ({ ...d, dayOfWeek: i }))
        .filter(d => d.enabled)
        .map(d => ({ dayOfWeek: d.dayOfWeek, startTime: d.startTime, endTime: d.endTime, slotDurationMinutes: d.slotDurationMinutes }));
      await setDoctorAvailability(doctorId, slots);
      success('Booking settings saved');
    } catch (e) {
      console.error(e);
      toastError('Failed to save booking settings');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: BookingRequest['status']) => {
    setUpdatingId(id);
    try {
      await updateBookingRequestStatus(id, status);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      success('Booking request updated');
    } catch (e) {
      console.error(e);
      toastError('Failed to update booking request');
    } finally {
      setUpdatingId(null);
    }
  };

  const bookingUrl = `${window.location.origin}${window.location.pathname}#/book/${doctorId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    success('Booking link copied');
  };

  if (loading) return <div className="text-center p-12 text-muted-foreground">Loading booking settings...</div>;

  return (
    <div className="space-y-6">
      {/* Public page toggle & link */}
      <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold font-heading flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Public Booking Page
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Let patients request appointments via a public link, even if they don't have an account.</p>
          </div>
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${enabled ? 'bg-primary' : 'bg-secondary'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {enabled && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/40 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate flex-1">{bookingUrl}</span>
            <Button size="sm" variant="outline" onClick={handleCopyLink} className="gap-1.5 shrink-0">
              <Copy className="h-3.5 w-3.5" /> Copy
            </Button>
          </div>
        )}

        <div>
          <label className="text-sm font-semibold text-foreground">Bio shown to patients</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="A short introduction shown on your public booking page."
            rows={3}
            className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      {/* Weekly availability */}
      <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
        <h3 className="font-bold font-heading mb-4 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" /> Weekly Availability
        </h3>
        <div className="space-y-2">
          {DAYS.map((label, idx) => (
            <div key={label} className="flex flex-wrap items-center gap-3 p-2 rounded-xl border border-border/40">
              <label className="flex items-center gap-2 w-28 shrink-0">
                <input type="checkbox" checked={days[idx].enabled} onChange={e => updateDay(idx, { enabled: e.target.checked })} className="h-4 w-4" />
                <span className="text-sm font-semibold">{label}</span>
              </label>
              {days[idx].enabled && (
                <>
                  <Input type="time" value={days[idx].startTime} onChange={e => updateDay(idx, { startTime: e.target.value })} className="w-32" />
                  <span className="text-sm text-muted-foreground">to</span>
                  <Input type="time" value={days[idx].endTime} onChange={e => updateDay(idx, { endTime: e.target.value })} className="w-32" />
                  <select
                    value={days[idx].slotDurationMinutes}
                    onChange={e => updateDay(idx, { slotDurationMinutes: Number(e.target.value) })}
                    className="h-10 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value={15}>15 min slots</option>
                    <option value={20}>20 min slots</option>
                    <option value={30}>30 min slots</option>
                    <option value={45}>45 min slots</option>
                    <option value={60}>60 min slots</option>
                  </select>
                </>
              )}
            </div>
          ))}
        </div>
        <Button onClick={handleSave} disabled={saving} className="mt-4">
          {saving ? 'Saving...' : 'Save Booking Settings'}
        </Button>
      </div>

      {/* Booking requests */}
      <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
        <h3 className="font-bold font-heading mb-4">Booking Requests</h3>
        {requests.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground border border-dashed rounded-xl text-sm">
            No booking requests yet.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="p-4 rounded-xl bg-card border border-border/40 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{req.patientName}</p>
                    <p className="text-xs text-muted-foreground">{req.patientEmail}{req.patientEmail && req.patientPhone ? ' • ' : ''}{req.patientPhone}</p>
                    <p className="text-sm font-bold text-primary mt-1">{new Date(req.requestedDateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    {req.reason && <p className="text-sm text-muted-foreground mt-1">{req.reason}</p>}
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full shrink-0 ${statusStyles[req.status]}`}>
                    {req.status}
                  </span>
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="gap-1.5" disabled={updatingId === req.id} onClick={() => handleStatusChange(req.id, 'confirmed')}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Confirm
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 text-destructive" disabled={updatingId === req.id} onClick={() => handleStatusChange(req.id, 'declined')}>
                      <XCircle className="h-3.5 w-3.5" /> Decline
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSettingsTab;
