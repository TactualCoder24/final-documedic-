import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Plus, Trash2, FileDown, Mic, MicOff, Sparkles } from '../icons/Icons';
import { PrescriptionMedication, DiagnosisCode, Profile } from '../../types';
import { createPrescription } from '../../services/dataSupabase';
import { searchDrugs, searchIcd10, COMMON_FREQUENCIES, COMMON_DURATIONS } from '../../services/medicalReference';
import { generatePrescriptionPdf } from '../../services/prescriptionPdf';
import { parsePrescriptionFromDictation } from '../../services/aiService';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useToast } from '../../hooks/useToast';

const emptyMed = (): PrescriptionMedication => ({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });

interface PrescriptionWriterProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  doctorProfile: Profile | null;
  patient: Profile & { id: string };
  appointmentId?: string;
  onSaved?: () => void;
}

const PrescriptionWriter: React.FC<PrescriptionWriterProps> = ({ isOpen, onClose, doctorId, doctorProfile, patient, appointmentId, onSaved }) => {
  const { success: toastSuccess, error: toastError } = useToast();
  const [diagnosis, setDiagnosis] = useState('');
  const [diagnosisCodes, setDiagnosisCodes] = useState<DiagnosisCode[]>([]);
  const [icdQuery, setIcdQuery] = useState('');
  const [medications, setMedications] = useState<PrescriptionMedication[]>([emptyMed()]);
  const [advice, setAdvice] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [activeDrugSuggestIdx, setActiveDrugSuggestIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [applyingDictation, setApplyingDictation] = useState(false);
  const speech = useSpeechRecognition();

  const reset = () => {
    setDiagnosis(''); setDiagnosisCodes([]); setIcdQuery('');
    setMedications([emptyMed()]); setAdvice(''); setNotes(''); setFollowUpDate('');
    speech.reset();
  };

  const handleClose = () => { reset(); onClose(); };

  const handleApplyDictation = async () => {
    if (!speech.transcript.trim()) return;
    setApplyingDictation(true);
    try {
      const todayISO = new Date().toISOString().slice(0, 10);
      const parsed = await parsePrescriptionFromDictation(speech.transcript, todayISO);

      if (parsed.diagnosis && !diagnosis.trim()) setDiagnosis(parsed.diagnosis);
      if (parsed.advice) setAdvice(prev => prev.trim() ? `${prev}\n${parsed.advice}` : parsed.advice!);
      if (parsed.notes) setNotes(prev => prev.trim() ? `${prev}\n${parsed.notes}` : parsed.notes!);
      if (parsed.followUpDate && !followUpDate) setFollowUpDate(parsed.followUpDate);

      const dictatedMeds = (parsed.medications || []).filter(m => m.name.trim());
      if (dictatedMeds.length > 0) {
        setMedications(prev => {
          const existing = prev.filter(m => m.name.trim());
          return [...existing, ...dictatedMeds];
        });
      }

      if (dictatedMeds.length === 0 && !parsed.diagnosis && !parsed.advice && !parsed.notes) {
        toastError('Could not extract prescription details from dictation');
      } else {
        toastSuccess('Applied dictation to prescription');
      }
      speech.reset();
    } catch (err) {
      console.error(err);
      toastError('Failed to process dictation');
    } finally {
      setApplyingDictation(false);
    }
  };

  const updateMed = (idx: number, patch: Partial<PrescriptionMedication>) => {
    setMedications(prev => prev.map((m, i) => i === idx ? { ...m, ...patch } : m));
  };

  const addMedRow = () => setMedications(prev => [...prev, emptyMed()]);
  const removeMedRow = (idx: number) => setMedications(prev => prev.filter((_, i) => i !== idx));

  const addIcdCode = (code: DiagnosisCode) => {
    if (!diagnosisCodes.find(c => c.code === code.code)) {
      setDiagnosisCodes(prev => [...prev, code]);
    }
    setIcdQuery('');
  };
  const removeIcdCode = (code: string) => setDiagnosisCodes(prev => prev.filter(c => c.code !== code));

  const validMeds = medications.filter(m => m.name.trim());

  const handleSave = async (downloadPdf: boolean) => {
    if (validMeds.length === 0) {
      toastError('Add at least one medication');
      return;
    }
    setSaving(true);
    try {
      const created = await createPrescription(doctorId, patient.id, {
        appointmentId,
        diagnosis: diagnosis.trim() || undefined,
        diagnosisCodes,
        medications: validMeds,
        advice: advice.trim() || undefined,
        notes: notes.trim() || undefined,
        followUpDate: followUpDate || undefined,
      });

      if (downloadPdf) {
        await generatePrescriptionPdf({
          prescription: created,
          doctorName: doctorProfile?.name || 'Doctor',
          doctorSpecialty: doctorProfile?.specialty,
          patientName: patient.name || 'Patient',
          patientAge: patient.age,
        });
      }

      toastSuccess('Prescription saved');
      onSaved?.();
      handleClose();
    } catch (err) {
      console.error(err);
      toastError('Failed to save prescription');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`New Prescription — ${patient.name || 'Patient'}`} variant="glass">
      <div className="space-y-5 max-w-2xl">
        {/* Voice dictation */}
        {speech.isSupported && (
          <div className="p-3 rounded-xl border border-dashed border-border/60 bg-card/40 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Mic className="h-4 w-4" /> Voice Dictation
              </label>
              <Button
                type="button"
                variant={speech.isListening ? 'destructive' : 'outline'}
                size="sm"
                className="gap-1.5"
                onClick={() => speech.isListening ? speech.stop() : speech.start()}
              >
                {speech.isListening ? <><MicOff className="h-3.5 w-3.5" /> Stop</> : <><Mic className="h-3.5 w-3.5" /> Start</>}
              </Button>
            </div>
            {(speech.transcript || speech.isListening) && (
              <>
                <textarea
                  value={speech.transcript}
                  readOnly
                  placeholder="Listening..."
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="gap-1.5"
                  disabled={applyingDictation || !speech.transcript.trim()}
                  onClick={handleApplyDictation}
                >
                  <Sparkles className="h-3.5 w-3.5" /> {applyingDictation ? 'Applying...' : 'Apply to Prescription'}
                </Button>
              </>
            )}
          </div>
        )}

        {/* Diagnosis */}
        <div>
          <label className="text-sm font-semibold text-foreground">Diagnosis</label>
          <Input
            value={diagnosis}
            onChange={e => setDiagnosis(e.target.value)}
            placeholder="e.g. Acute upper respiratory infection"
            className="mt-1"
          />
          <div className="relative mt-2">
            <Input
              value={icdQuery}
              onChange={e => setIcdQuery(e.target.value)}
              placeholder="Search ICD-10 code or condition..."
            />
            {icdQuery.trim() && (
              <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {searchIcd10(icdQuery).map(c => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => addIcdCode(c)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-primary/5 flex justify-between gap-2"
                  >
                    <span className="font-semibold">{c.code}</span>
                    <span className="text-muted-foreground truncate">{c.description}</span>
                  </button>
                ))}
                {searchIcd10(icdQuery).length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">No matches</div>
                )}
              </div>
            )}
          </div>
          {diagnosisCodes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {diagnosisCodes.map(c => (
                <span key={c.code} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {c.code} — {c.description}
                  <button type="button" onClick={() => removeIcdCode(c.code)} className="hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Medications */}
        <div>
          <label className="text-sm font-semibold text-foreground">Medications (Rx)</label>
          <div className="space-y-3 mt-2">
            {medications.map((med, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-border/60 bg-card/50 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={med.name}
                      onChange={e => { updateMed(idx, { name: e.target.value }); setActiveDrugSuggestIdx(idx); }}
                      onFocus={() => setActiveDrugSuggestIdx(idx)}
                      onBlur={() => setTimeout(() => setActiveDrugSuggestIdx(null), 150)}
                      placeholder="Drug name"
                    />
                    {activeDrugSuggestIdx === idx && med.name.trim() && (
                      <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-xl shadow-lg max-h-44 overflow-y-auto">
                        {searchDrugs(med.name).map(d => (
                          <button
                            key={d.name}
                            type="button"
                            onMouseDown={() => updateMed(idx, {
                              name: d.name,
                              dosage: med.dosage || d.commonDosages[0],
                              frequency: med.frequency || d.defaultFrequency,
                            })}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-primary/5"
                          >
                            <span className="font-semibold">{d.name}</span>
                            <span className="text-muted-foreground ml-2">{d.commonDosages.join(', ')}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeMedRow(idx)} className="text-destructive shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input value={med.dosage} onChange={e => updateMed(idx, { dosage: e.target.value })} placeholder="Dosage (e.g. 500mg)" />
                  <Input value={med.frequency} onChange={e => updateMed(idx, { frequency: e.target.value })} placeholder="Frequency (1-0-1)" list={`freq-${idx}`} />
                  <Input value={med.duration} onChange={e => updateMed(idx, { duration: e.target.value })} placeholder="Duration" list={`dur-${idx}`} />
                  <datalist id={`freq-${idx}`}>{COMMON_FREQUENCIES.map(f => <option key={f} value={f} />)}</datalist>
                  <datalist id={`dur-${idx}`}>{COMMON_DURATIONS.map(d => <option key={d} value={d} />)}</datalist>
                </div>
                <Input value={med.instructions} onChange={e => updateMed(idx, { instructions: e.target.value })} placeholder="Instructions (e.g. After food)" />
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addMedRow} className="mt-2 gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add medication
          </Button>
        </div>

        {/* Advice */}
        <div>
          <label className="text-sm font-semibold text-foreground">Advice</label>
          <textarea
            value={advice}
            onChange={e => setAdvice(e.target.value)}
            placeholder="Lifestyle advice, dietary recommendations, etc."
            rows={2}
            className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-semibold text-foreground">Notes (internal)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Clinical notes for this prescription"
            rows={2}
            className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {/* Follow-up */}
        <div>
          <label className="text-sm font-semibold text-foreground">Follow-up date</label>
          <Input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} className="mt-1" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button type="button" variant="secondary" onClick={() => handleSave(true)} disabled={saving} className="gap-1.5">
            <FileDown className="h-4 w-4" /> Save & Download PDF
          </Button>
          <Button type="button" onClick={() => handleSave(false)} disabled={saving}>
            {saving ? 'Saving...' : 'Save Prescription'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PrescriptionWriter;
