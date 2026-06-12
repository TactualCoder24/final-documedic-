import React, { useState, useEffect, useCallback } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ClinicStaff, Department } from '../../types';
import { getClinicStaff, inviteClinicStaff, updateClinicStaff, removeClinicStaff, getDepartments, logAuditEvent } from '../../services/dataSupabase';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { Users, Plus, Trash2 } from '../icons/Icons';

interface ClinicStaffTabProps {
  clinicId: string;
}

const ROLES: ClinicStaff['role'][] = ['doctor', 'nurse', 'front_desk', 'admin'];

const roleLabels: Record<ClinicStaff['role'], string> = {
  doctor: 'Doctor',
  nurse: 'Nurse',
  front_desk: 'Front Desk',
  admin: 'Admin',
};

const statusStyles: Record<ClinicStaff['status'], string> = {
  pending: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  active: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
  inactive: 'bg-secondary text-muted-foreground',
};

const ClinicStaffTab: React.FC<ClinicStaffTabProps> = ({ clinicId }) => {
  const { success, error: toastError } = useToast();
  const { user } = useAuth();
  const logEvent = (action: string, entityId: string, details?: Record<string, any>) =>
    logAuditEvent({ actorId: clinicId, actorName: user?.displayName || 'Clinic Admin', actorRole: 'clinic', clinicId, action, entityType: 'clinic_staff', entityId, details });
  const [staff, setStaff] = useState<ClinicStaff[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ClinicStaff['role']>('doctor');
  const [departmentId, setDepartmentId] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedStaff, fetchedDepts] = await Promise.all([
        getClinicStaff(clinicId),
        getDepartments(clinicId),
      ]);
      setStaff(fetchedStaff);
      setDepartments(fetchedDepts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => { load(); }, [load]);

  const handleInvite = async () => {
    if (!email.trim()) {
      toastError('Enter an email address');
      return;
    }
    setSaving(true);
    try {
      const invited = await inviteClinicStaff(clinicId, { email: email.trim(), role, departmentId: departmentId || undefined });
      logEvent('staff.invite', invited.id, { email: email.trim(), role });
      setEmail(''); setDepartmentId('');
      success('Staff member invited');
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to invite staff member');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (staffId: string, newRole: ClinicStaff['role']) => {
    try {
      await updateClinicStaff(staffId, { role: newRole });
      logEvent('staff.role_change', staffId, { role: newRole });
      setStaff(prev => prev.map(s => s.id === staffId ? { ...s, role: newRole } : s));
    } catch (e) {
      console.error(e);
      toastError('Failed to update role');
    }
  };

  const handleDeptChange = async (staffId: string, deptId: string) => {
    try {
      await updateClinicStaff(staffId, { departmentId: deptId || null });
      setStaff(prev => prev.map(s => s.id === staffId ? { ...s, departmentId: deptId || undefined } : s));
    } catch (e) {
      console.error(e);
      toastError('Failed to update department');
    }
  };

  const handleStatusToggle = async (staffMember: ClinicStaff) => {
    const newStatus = staffMember.status === 'active' ? 'inactive' : 'active';
    try {
      await updateClinicStaff(staffMember.id, { status: newStatus });
      logEvent('staff.status_change', staffMember.id, { status: newStatus });
      setStaff(prev => prev.map(s => s.id === staffMember.id ? { ...s, status: newStatus } : s));
    } catch (e) {
      console.error(e);
      toastError('Failed to update status');
    }
  };

  const handleRemove = async (staffId: string) => {
    try {
      await removeClinicStaff(staffId);
      logEvent('staff.remove', staffId);
      success('Staff member removed');
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to remove staff member');
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
        <h3 className="font-bold font-heading mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-500" /> Invite Staff
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-3">
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Staff member's email" />
          <select value={role} onChange={e => setRole(e.target.value as ClinicStaff['role'])} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            {ROLES.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
          </select>
          <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">No department</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <Button onClick={handleInvite} disabled={saving} className="gap-1.5">
            <Plus className="h-4 w-4" /> Invite
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">If the email matches an existing DocuMedic account, they'll be linked and marked active immediately. Otherwise the invite stays pending until they sign up.</p>
      </div>

      <div>
        {loading ? (
          <div className="text-center p-6 text-muted-foreground">Loading staff...</div>
        ) : staff.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground border border-dashed rounded-xl text-sm">No staff members yet.</div>
        ) : (
          <div className="space-y-3">
            {staff.map(member => (
              <div key={member.id} className="p-4 rounded-xl bg-card border border-border/40 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm">{member.staffName || member.staffEmail}</p>
                  {member.staffName && <p className="text-xs text-muted-foreground">{member.staffEmail}</p>}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select value={member.role} onChange={e => handleRoleChange(member.id, e.target.value as ClinicStaff['role'])} className="h-9 rounded-md border border-input bg-background px-2 text-xs">
                    {ROLES.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
                  </select>
                  <select value={member.departmentId || ''} onChange={e => handleDeptChange(member.id, e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-xs">
                    <option value="">No department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <button onClick={() => handleStatusToggle(member)} className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full ${statusStyles[member.status]}`}>
                    {member.status}
                  </button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemove(member.id)} aria-label="Remove">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicStaffTab;
