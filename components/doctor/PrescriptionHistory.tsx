import React, { useState } from 'react';
import { Pill, FileDown, Trash2, ClipboardList } from '../icons/Icons';
import { Prescription, Profile } from '../../types';
import { deletePrescription } from '../../services/dataSupabase';
import { generatePrescriptionPdf } from '../../services/prescriptionPdf';
import { useToast } from '../../hooks/useToast';
import Button from '../ui/Button';

interface PrescriptionHistoryProps {
  prescriptions: Prescription[];
  doctorProfile: Profile | null;
  patient: Profile & { id: string };
  onChange: () => void;
}

const PrescriptionHistory: React.FC<PrescriptionHistoryProps> = ({ prescriptions, doctorProfile, patient, onChange }) => {
  const { success, error } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDownload = async (rx: Prescription) => {
    try {
      await generatePrescriptionPdf({
        prescription: rx,
        doctorName: doctorProfile?.name || 'Doctor',
        doctorSpecialty: doctorProfile?.specialty,
        patientName: patient.name || 'Patient',
        patientAge: patient.age,
      });
    } catch (e) {
      console.error(e);
      error('Failed to generate PDF');
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deletePrescription(id);
      success('Prescription deleted');
      onChange();
    } catch (e) {
      console.error(e);
      error('Failed to delete prescription');
    } finally {
      setDeletingId(null);
    }
  };

  if (prescriptions.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground border border-dashed rounded-xl text-sm flex flex-col items-center gap-2">
        <ClipboardList className="h-6 w-6 opacity-50" />
        No prescriptions yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {prescriptions.map(rx => (
        <div key={rx.id} className="p-4 rounded-xl bg-card border border-border/40 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">{new Date(rx.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              {rx.diagnosis && <p className="font-semibold text-sm mt-0.5">{rx.diagnosis}</p>}
              {rx.diagnosisCodes && rx.diagnosisCodes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {rx.diagnosisCodes.map(c => (
                    <span key={c.code} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{c.code}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(rx)} aria-label="Download PDF">
                <FileDown className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(rx.id)} disabled={deletingId === rx.id} aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {rx.medications.map((m, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full">
                <Pill className="h-3 w-3" /> {m.name} {m.dosage} — {m.frequency}
              </span>
            ))}
          </div>
          {rx.followUpDate && (
            <p className="text-xs text-muted-foreground">Follow-up: {new Date(rx.followUpDate).toLocaleDateString()}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default PrescriptionHistory;
