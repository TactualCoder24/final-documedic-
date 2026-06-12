import React, { useState, useEffect, useCallback } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { getClinic, saveClinic } from '../../services/dataSupabase';
import { useToast } from '../../hooks/useToast';
import { Building2 } from '../icons/Icons';

interface ClinicProfileTabProps {
  clinicId: string;
  defaultName?: string;
}

const ClinicProfileTab: React.FC<ClinicProfileTabProps> = ({ clinicId, defaultName }) => {
  const { success, error: toastError } = useToast();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialtiesInput, setSpecialtiesInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const clinic = await getClinic(clinicId);
      if (clinic) {
        setName(clinic.name);
        setAddress(clinic.address || '');
        setPhone(clinic.phone || '');
        setEmail(clinic.email || '');
        setSpecialtiesInput((clinic.specialties || []).join(', '));
      } else {
        setName(defaultName || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [clinicId, defaultName]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!name.trim()) {
      toastError('Clinic name is required');
      return;
    }
    setSaving(true);
    try {
      await saveClinic(clinicId, {
        name: name.trim(),
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        specialties: specialtiesInput.split(',').map(s => s.trim()).filter(Boolean),
      });
      success('Clinic profile saved');
    } catch (e) {
      console.error(e);
      toastError('Failed to save clinic profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-12 text-muted-foreground">Loading clinic profile...</div>;

  return (
    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm max-w-2xl space-y-4">
      <h3 className="font-bold font-heading flex items-center gap-2">
        <Building2 className="h-4 w-4 text-emerald-500" /> Clinic Profile
      </h3>
      <div>
        <label className="text-sm font-semibold text-foreground">Clinic / Hospital name</label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sunrise Multi-Specialty Clinic" className="mt-1" />
      </div>
      <div>
        <label className="text-sm font-semibold text-foreground">Address</label>
        <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, City, State" className="mt-1" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-foreground">Phone</label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Contact number" className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground">Email</label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@clinic.com" className="mt-1" />
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-foreground">Specialties offered</label>
        <Input value={specialtiesInput} onChange={e => setSpecialtiesInput(e.target.value)} placeholder="e.g. Cardiology, Dermatology, Pediatrics (comma separated)" className="mt-1" />
      </div>
      <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
    </div>
  );
};

export default ClinicProfileTab;
