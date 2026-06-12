import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { PatientMessage, Profile } from '../../types';
import { sendPatientMessage, getMessagesSentToPatient, deletePatientMessage } from '../../services/dataSupabase';
import { useToast } from '../../hooks/useToast';
import { MessageCircle, Bell, Trash2, Send } from '../icons/Icons';

interface PatientMessagesProps {
  doctorId: string;
  doctorName?: string;
  patient: Profile & { id: string };
}

const PatientMessages: React.FC<PatientMessagesProps> = ({ doctorId, doctorName, patient }) => {
  const { success, error: toastError } = useToast();
  const [messages, setMessages] = useState<PatientMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState<'message' | 'reminder'>('message');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const fetched = await getMessagesSentToPatient(doctorId, patient.id);
      setMessages(fetched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [doctorId, patient.id]);

  useEffect(() => { load(); }, [load]);

  const reset = () => {
    setType('message'); setTitle(''); setBody(''); setScheduledFor('');
  };

  const handleClose = () => { reset(); setIsModalOpen(false); };

  const handleSend = async () => {
    if (!title.trim()) {
      toastError('Please enter a title');
      return;
    }
    if (type === 'reminder' && !scheduledFor) {
      toastError('Please select a date/time for the reminder');
      return;
    }
    setSaving(true);
    try {
      await sendPatientMessage({
        doctorId,
        doctorName,
        patientId: patient.id,
        type,
        title: title.trim(),
        body: body.trim() || undefined,
        scheduledFor: type === 'reminder' ? new Date(scheduledFor).toISOString() : undefined,
      });
      success(type === 'reminder' ? 'Reminder sent' : 'Message sent');
      handleClose();
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to send');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePatientMessage(id);
      success('Removed');
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to remove');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold font-heading flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-orange-500 inline-block" />
          Messages & Reminders
        </h2>
        <Button size="sm" onClick={() => setIsModalOpen(true)} className="gap-1.5">
          <Send className="h-3.5 w-3.5" /> New
        </Button>
      </div>

      {loading ? (
        <div className="text-center p-6 text-muted-foreground text-sm">Loading...</div>
      ) : messages.length === 0 ? (
        <div className="text-center p-6 text-muted-foreground border border-dashed rounded-xl text-sm flex flex-col items-center gap-2">
          <MessageCircle className="h-6 w-6 opacity-50" />
          No messages sent yet.
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className="p-4 rounded-xl bg-card border border-border/40 flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {msg.type === 'reminder'
                    ? <Bell className="h-3.5 w-3.5 text-amber-500" />
                    : <MessageCircle className="h-3.5 w-3.5 text-blue-500" />}
                  <p className="font-semibold text-sm">{msg.title}</p>
                  {!msg.isRead && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">Unread</span>
                  )}
                </div>
                {msg.body && <p className="text-sm text-muted-foreground">{msg.body}</p>}
                {msg.scheduledFor && (
                  <p className="text-xs text-muted-foreground mt-1">For: {new Date(msg.scheduledFor).toLocaleString()}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{new Date(msg.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => handleDelete(msg.id)} aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleClose} title={`New Message — ${patient.name || 'Patient'}`} variant="glass">
        <div className="space-y-4 max-w-lg">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('message')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${type === 'message' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground'}`}
            >
              <MessageCircle className="h-4 w-4" /> Message
            </button>
            <button
              type="button"
              onClick={() => setType('reminder')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${type === 'reminder' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground'}`}
            >
              <Bell className="h-4 w-4" /> Reminder
            </button>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground">Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={type === 'reminder' ? 'e.g. Take your evening medication' : 'e.g. Your test results look good'} className="mt-1" />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground">Details</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Optional additional details for the patient"
              rows={3}
              className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {type === 'reminder' && (
            <div>
              <label className="text-sm font-semibold text-foreground">Reminder date & time</label>
              <Input type="datetime-local" value={scheduledFor} onChange={e => setScheduledFor(e.target.value)} className="mt-1" />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving}>Cancel</Button>
            <Button type="button" onClick={handleSend} disabled={saving} className="gap-1.5">
              <Send className="h-4 w-4" /> {saving ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PatientMessages;
