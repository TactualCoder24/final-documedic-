import React, { useEffect, useState, useCallback } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { HospitalBed, IpdAdmission } from '../../types';
import {
  getHospitalBeds, createHospitalBed, updateHospitalBedStatus, deleteHospitalBed,
  getIpdAdmissions, createIpdAdmission, dischargeIpdAdmission,
} from '../../services/dataSupabase';
import { useToast } from '../../hooks/useToast';
import { BedDouble, Plus, Trash2, Users } from '../icons/Icons';

interface BedManagementTabProps {
  clinicId: string;
}

const BED_TYPES: HospitalBed['bedType'][] = ['general', 'private', 'icu', 'emergency'];

const bedTypeLabels: Record<HospitalBed['bedType'], string> = {
  general: 'General',
  private: 'Private',
  icu: 'ICU',
  emergency: 'Emergency',
};

const statusStyles: Record<HospitalBed['status'], string> = {
  available: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
  occupied: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  maintenance: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400',
};

const BedManagementTab: React.FC<BedManagementTabProps> = ({ clinicId }) => {
  const { success, error: toastError } = useToast();
  const [beds, setBeds] = useState<HospitalBed[]>([]);
  const [admissions, setAdmissions] = useState<IpdAdmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [wardName, setWardName] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  const [bedType, setBedType] = useState<HospitalBed['bedType']>('general');

  const [showAdmitForm, setShowAdmitForm] = useState(false);
  const [admitPatientName, setAdmitPatientName] = useState('');
  const [admitBedId, setAdmitBedId] = useState('');
  const [admitDoctorName, setAdmitDoctorName] = useState('');
  const [admitDiagnosis, setAdmitDiagnosis] = useState('');
  const [admitExpectedDischarge, setAdmitExpectedDischarge] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bedsData, admissionsData] = await Promise.all([
        getHospitalBeds(clinicId),
        getIpdAdmissions(clinicId),
      ]);
      setBeds(bedsData);
      setAdmissions(admissionsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => { load(); }, [load]);

  const handleAddBed = async () => {
    if (!wardName.trim() || !bedNumber.trim()) {
      toastError('Enter a ward name and bed number');
      return;
    }
    setSaving(true);
    try {
      await createHospitalBed(clinicId, { wardName: wardName.trim(), bedNumber: bedNumber.trim(), bedType });
      setWardName(''); setBedNumber(''); setBedType('general');
      success('Bed added');
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to add bed');
    } finally {
      setSaving(false);
    }
  };

  const handleBedStatus = async (bed: HospitalBed, status: HospitalBed['status']) => {
    try {
      await updateHospitalBedStatus(bed.id, status);
      setBeds(prev => prev.map(b => b.id === bed.id ? { ...b, status } : b));
    } catch (e) {
      console.error(e);
      toastError('Failed to update bed status');
    }
  };

  const handleDeleteBed = async (bedId: string) => {
    if (!window.confirm('Remove this bed?')) return;
    try {
      await deleteHospitalBed(bedId);
      success('Bed removed');
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to remove bed');
    }
  };

  const handleAdmit = async () => {
    if (!admitPatientName.trim()) {
      toastError('Enter a patient name');
      return;
    }
    setSaving(true);
    try {
      await createIpdAdmission(clinicId, {
        patientName: admitPatientName.trim(),
        bedId: admitBedId || undefined,
        admittingDoctorName: admitDoctorName.trim() || undefined,
        diagnosis: admitDiagnosis.trim() || undefined,
        expectedDischargeDate: admitExpectedDischarge || undefined,
      });
      setAdmitPatientName(''); setAdmitBedId(''); setAdmitDoctorName(''); setAdmitDiagnosis(''); setAdmitExpectedDischarge('');
      setShowAdmitForm(false);
      success('Patient admitted');
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to admit patient');
    } finally {
      setSaving(false);
    }
  };

  const handleDischarge = async (admission: IpdAdmission) => {
    if (!window.confirm(`Discharge ${admission.patientName}?`)) return;
    try {
      await dischargeIpdAdmission(admission.id, admission.bedId);
      success('Patient discharged');
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to discharge patient');
    }
  };

  const availableBeds = beds.filter(b => b.status === 'available');
  const activeAdmissions = admissions.filter(a => a.status === 'admitted');
  const pastAdmissions = admissions.filter(a => a.status === 'discharged');
  const bedById = (id?: string) => beds.find(b => b.id === id);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-card border border-border/50 flex items-start gap-3">
        <BedDouble className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Manage wards, beds, and in-patient (IPD) admissions. Admitting a patient automatically marks their bed as occupied; discharging frees it up.
        </p>
      </div>

      {/* Bed inventory */}
      <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
        <h3 className="font-bold font-heading mb-3 text-sm">Add Bed</h3>
        <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1fr_auto] gap-3">
          <Input value={wardName} onChange={e => setWardName(e.target.value)} placeholder="Ward name (e.g. General Ward A)" />
          <Input value={bedNumber} onChange={e => setBedNumber(e.target.value)} placeholder="Bed number (e.g. B-101)" />
          <select value={bedType} onChange={e => setBedType(e.target.value as HospitalBed['bedType'])} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            {BED_TYPES.map(t => <option key={t} value={t}>{bedTypeLabels[t]}</option>)}
          </select>
          <Button onClick={handleAddBed} disabled={saving} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-6 text-muted-foreground">Loading beds...</div>
      ) : beds.length === 0 ? (
        <div className="text-center p-6 text-muted-foreground border border-dashed rounded-xl text-sm">No beds configured yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {beds.map(bed => (
            <div key={bed.id} className="p-3 rounded-xl bg-card border border-border/40 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{bed.wardName}</p>
                  <p className="text-xs text-muted-foreground">Bed {bed.bedNumber} · {bedTypeLabels[bed.bedType]}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteBed(bed.id)} aria-label="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <select
                value={bed.status}
                onChange={e => handleBedStatus(bed, e.target.value as HospitalBed['status'])}
                className={`h-8 rounded-full px-2 text-xs font-semibold border-0 ${statusStyles[bed.status]}`}
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          ))}
        </div>
      )}

      {/* IPD admissions */}
      <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold font-heading text-sm flex items-center gap-1.5"><Users className="h-4 w-4" /> IPD Admissions</h3>
          <Button size="sm" onClick={() => setShowAdmitForm(s => !s)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Admit Patient
          </Button>
        </div>

        {showAdmitForm && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3 rounded-xl border border-border/40">
            <Input value={admitPatientName} onChange={e => setAdmitPatientName(e.target.value)} placeholder="Patient name" />
            <select value={admitBedId} onChange={e => setAdmitBedId(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">No bed assigned</option>
              {availableBeds.map(b => <option key={b.id} value={b.id}>{b.wardName} · Bed {b.bedNumber}</option>)}
            </select>
            <Input value={admitDoctorName} onChange={e => setAdmitDoctorName(e.target.value)} placeholder="Admitting doctor" />
            <Input value={admitDiagnosis} onChange={e => setAdmitDiagnosis(e.target.value)} placeholder="Diagnosis" />
            <Input type="date" value={admitExpectedDischarge} onChange={e => setAdmitExpectedDischarge(e.target.value)} placeholder="Expected discharge date" />
            <Button onClick={handleAdmit} disabled={saving}>Admit</Button>
          </div>
        )}

        {loading ? (
          <div className="text-center p-6 text-muted-foreground">Loading admissions...</div>
        ) : activeAdmissions.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground border border-dashed rounded-xl text-sm">No patients currently admitted.</div>
        ) : (
          <div className="space-y-2">
            {activeAdmissions.map(adm => {
              const bed = bedById(adm.bedId);
              return (
                <div key={adm.id} className="p-3 rounded-xl bg-card border border-border/40 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{adm.patientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {bed ? `${bed.wardName} · Bed ${bed.bedNumber}` : 'No bed assigned'}
                      {adm.admittingDoctorName ? ` · Dr. ${adm.admittingDoctorName}` : ''}
                      {adm.diagnosis ? ` · ${adm.diagnosis}` : ''}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Admitted {new Date(adm.admissionDate).toLocaleDateString()}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleDischarge(adm)}>Discharge</Button>
                </div>
              );
            })}
          </div>
        )}

        {pastAdmissions.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Discharge History</h4>
            <div className="space-y-2">
              {pastAdmissions.slice(0, 10).map(adm => (
                <div key={adm.id} className="p-2.5 rounded-lg bg-muted/40 flex items-center justify-between text-sm">
                  <span>{adm.patientName}</span>
                  <span className="text-xs text-muted-foreground">
                    {adm.dischargeDate ? `Discharged ${new Date(adm.dischargeDate).toLocaleDateString()}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BedManagementTab;
