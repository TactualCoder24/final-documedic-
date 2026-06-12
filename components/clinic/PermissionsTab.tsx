import React, { useEffect, useState, useCallback } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ClinicRolePermissions } from '../../types';
import { getClinicRolePermissions, saveClinicRolePermissions, deleteClinicRolePermissions } from '../../services/dataSupabase';
import { useToast } from '../../hooks/useToast';
import { ShieldCheck, Plus, Trash2 } from '../icons/Icons';

interface PermissionsTabProps {
  clinicId: string;
}

const PERMISSION_KEYS: { key: string; label: string }[] = [
  { key: 'view_patients', label: 'View Patient Records' },
  { key: 'edit_patients', label: 'Edit Patient Records' },
  { key: 'manage_appointments', label: 'Manage Appointments' },
  { key: 'manage_queue', label: 'Manage OPD Queue' },
  { key: 'manage_billing', label: 'Manage Billing & Invoices' },
  { key: 'manage_prescriptions', label: 'Write Prescriptions' },
  { key: 'manage_referrals', label: 'Manage Referrals' },
  { key: 'view_analytics', label: 'View Analytics' },
  { key: 'manage_staff', label: 'Manage Staff' },
  { key: 'manage_intake_forms', label: 'Manage Intake Forms' },
  { key: 'view_audit_log', label: 'View Audit Log' },
];

const BUILTIN_ROLES: { roleName: string; label: string; defaults: Record<string, boolean> }[] = [
  {
    roleName: 'doctor', label: 'Doctor', defaults: {
      view_patients: true, edit_patients: true, manage_appointments: true, manage_queue: true,
      manage_billing: true, manage_prescriptions: true, manage_referrals: true, view_analytics: true,
      manage_staff: false, manage_intake_forms: false, view_audit_log: false,
    },
  },
  {
    roleName: 'nurse', label: 'Nurse', defaults: {
      view_patients: true, edit_patients: true, manage_appointments: true, manage_queue: true,
      manage_billing: false, manage_prescriptions: false, manage_referrals: false, view_analytics: false,
      manage_staff: false, manage_intake_forms: false, view_audit_log: false,
    },
  },
  {
    roleName: 'front_desk', label: 'Front Desk', defaults: {
      view_patients: true, edit_patients: false, manage_appointments: true, manage_queue: true,
      manage_billing: true, manage_prescriptions: false, manage_referrals: false, view_analytics: false,
      manage_staff: false, manage_intake_forms: true, view_audit_log: false,
    },
  },
  {
    roleName: 'admin', label: 'Admin', defaults: {
      view_patients: true, edit_patients: true, manage_appointments: true, manage_queue: true,
      manage_billing: true, manage_prescriptions: false, manage_referrals: true, view_analytics: true,
      manage_staff: true, manage_intake_forms: true, view_audit_log: true,
    },
  },
];

const PermissionsTab: React.FC<PermissionsTabProps> = ({ clinicId }) => {
  const { success, error: toastError } = useToast();
  const [profiles, setProfiles] = useState<ClinicRolePermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClinicRolePermissions(clinicId);
      setProfiles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => { load(); }, [load]);

  // Merge builtin role defaults with any saved overrides
  const allRoles: { roleName: string; label: string; permissions: Record<string, boolean>; isCustom: boolean; id?: string }[] = [
    ...BUILTIN_ROLES.map(r => {
      const saved = profiles.find(p => p.roleName === r.roleName && !p.isCustom);
      return { roleName: r.roleName, label: r.label, permissions: saved?.permissions || r.defaults, isCustom: false, id: saved?.id };
    }),
    ...profiles.filter(p => p.isCustom).map(p => ({ roleName: p.roleName, label: p.roleName, permissions: p.permissions, isCustom: true, id: p.id })),
  ];

  const togglePermission = (roleName: string, isCustom: boolean, permKey: string) => {
    setProfiles(prev => {
      const existing = prev.find(p => p.roleName === roleName && p.isCustom === isCustom);
      if (existing) {
        return prev.map(p => p === existing ? { ...p, permissions: { ...p.permissions, [permKey]: !p.permissions[permKey] } } : p);
      }
      // Not yet saved - create from builtin defaults
      const builtin = BUILTIN_ROLES.find(r => r.roleName === roleName);
      const basePermissions = builtin ? builtin.defaults : {};
      return [...prev, {
        id: '', clinicId, roleName, isCustom,
        permissions: { ...basePermissions, [permKey]: !basePermissions[permKey] },
        createdAt: new Date().toISOString(),
      }];
    });
  };

  const handleSaveRole = async (roleName: string, isCustom: boolean) => {
    const role = allRoles.find(r => r.roleName === roleName && r.isCustom === isCustom);
    if (!role) return;
    setSavingRole(roleName);
    try {
      await saveClinicRolePermissions(clinicId, roleName, role.permissions, isCustom);
      success(`Permissions saved for ${role.label}`);
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to save permissions');
    } finally {
      setSavingRole(null);
    }
  };

  const handleAddCustomRole = async () => {
    const name = newRoleName.trim();
    if (!name) return;
    if (allRoles.some(r => r.roleName.toLowerCase() === name.toLowerCase())) {
      toastError('A role with this name already exists');
      return;
    }
    try {
      const defaultPermissions = Object.fromEntries(PERMISSION_KEYS.map(p => [p.key, false]));
      await saveClinicRolePermissions(clinicId, name, defaultPermissions, true);
      setNewRoleName('');
      success('Custom role created');
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to create role');
    }
  };

  const handleDeleteCustomRole = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Delete this custom role?')) return;
    try {
      await deleteClinicRolePermissions(id);
      success('Role deleted');
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to delete role');
    }
  };

  if (loading) return <div className="text-center p-6 text-muted-foreground">Loading permissions...</div>;

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-card border border-border/50 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Define what each role can see and do within your clinic. Changes apply the next time staff sign in.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
        <h3 className="font-bold font-heading mb-3 text-sm">Add Custom Role</h3>
        <div className="flex gap-2">
          <Input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="e.g., Lab Technician" />
          <Button onClick={handleAddCustomRole} className="gap-1.5 flex-shrink-0">
            <Plus className="h-4 w-4" /> Add Role
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {allRoles.map(role => (
          <div key={`${role.roleName}-${role.isCustom}`} className="p-4 rounded-xl bg-card border border-border/40 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm capitalize">{role.label.replace('_', ' ')}{role.isCustom && <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">Custom</span>}</p>
              {role.isCustom && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteCustomRole(role.id)} aria-label="Delete role">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {PERMISSION_KEYS.map(perm => (
                <label key={perm.key} className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-secondary/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!role.permissions[perm.key]}
                    onChange={() => togglePermission(role.roleName, role.isCustom, perm.key)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  {perm.label}
                </label>
              ))}
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => handleSaveRole(role.roleName, role.isCustom)} disabled={savingRole === role.roleName}>
                {savingRole === role.roleName ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PermissionsTab;
