import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Profile } from '../../types';
import { createReferral, searchDoctors } from '../../services/dataSupabase';
import { useToast } from '../../hooks/useToast';
import { Send } from '../icons/Icons';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  doctorProfile: Profile | null;
  patient: Profile & { id: string };
  onSaved?: () => void;
}

const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose, doctorId, doctorProfile, patient, onSaved }) => {
  const { success: toastSuccess, error: toastError } = useToast();
  const [doctorQuery, setDoctorQuery] = useState('');
  const [doctorResults, setDoctorResults] = useState<Profile[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Profile | null>(null);
  const [externalName, setExternalName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setDoctorQuery(''); setDoctorResults([]); setSelectedDoctor(null);
    setExternalName(''); setSpecialty(''); setReason(''); setNotes('');
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSearch = async (query: string) => {
    setDoctorQuery(query);
    setSelectedDoctor(null);
    if (!query.trim()) {
      setDoctorResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await searchDoctors(query);
      setDoctorResults(results.filter(d => d.id !== doctorId));
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const selectDoctor = (doc: Profile) => {
    setSelectedDoctor(doc);
    setDoctorQuery(doc.name || '');
    setDoctorResults([]);
    if (doc.specialty) setSpecialty(doc.specialty);
  };

  const handleSave = async () => {
    const referredToName = selectedDoctor ? (selectedDoctor.name || 'Doctor') : externalName.trim();
    if (!referredToName) {
      toastError('Select a doctor or enter an external doctor/specialist name');
      return;
    }
    if (!reason.trim()) {
      toastError('Please enter a reason for referral');
      return;
    }
    setSaving(true);
    try {
      await createReferral({
        referringDoctorId: doctorId,
        referringDoctorName: doctorProfile?.name,
        patientId: patient.id,
        patientName: patient.name,
        referredToDoctorId: selectedDoctor?.id,
        referredToName,
        specialty: specialty.trim() || undefined,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
      });
      toastSuccess('Referral sent');
      onSaved?.();
      handleClose();
    } catch (err) {
      console.error(err);
      toastError('Failed to create referral');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Refer Patient — ${patient.name || 'Patient'}`} variant="glass">
      <div className="space-y-5 max-w-xl">
        <div>
          <label className="text-sm font-semibold text-foreground">Refer to (in-app doctor)</label>
          <div className="relative mt-1">
            <Input
              value={doctorQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search doctor by name or specialty..."
            />
            {doctorQuery.trim() && !selectedDoctor && (
              <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {searching && <div className="px-3 py-2 text-sm text-muted-foreground">Searching...</div>}
                {!searching && doctorResults.map(d => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => selectDoctor(d)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-primary/5 flex justify-between gap-2"
                  >
                    <span className="font-semibold">Dr. {d.name}</span>
                    <span className="text-muted-foreground truncate">{d.specialty}</span>
                  </button>
                ))}
                {!searching && doctorResults.length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">No doctors found</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">OR refer externally</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground">External doctor / specialist name</label>
          <Input
            value={selectedDoctor ? '' : externalName}
            onChange={e => { setExternalName(e.target.value); setSelectedDoctor(null); setDoctorQuery(''); }}
            placeholder="e.g. Dr. Mehta, City Cardiology Center"
            className="mt-1"
            disabled={!!selectedDoctor}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground">Specialty</label>
          <Input
            value={specialty}
            onChange={e => setSpecialty(e.target.value)}
            placeholder="e.g. Cardiology"
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground">Reason for referral</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Clinical reason for this referral"
            rows={2}
            className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground">Additional notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Relevant history, attached reports, etc."
            rows={2}
            className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button type="button" onClick={handleSave} disabled={saving} className="gap-1.5">
            <Send className="h-4 w-4" /> {saving ? 'Sending...' : 'Send Referral'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReferralModal;
