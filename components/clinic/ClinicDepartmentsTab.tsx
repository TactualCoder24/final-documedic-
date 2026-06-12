import React, { useState, useEffect, useCallback } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Department } from '../../types';
import { getDepartments, createDepartment, deleteDepartment } from '../../services/dataSupabase';
import { useToast } from '../../hooks/useToast';
import { ClipboardList, Plus, Trash2 } from '../icons/Icons';

interface ClinicDepartmentsTabProps {
  clinicId: string;
}

const ClinicDepartmentsTab: React.FC<ClinicDepartmentsTabProps> = ({ clinicId }) => {
  const { success, error: toastError } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const fetched = await getDepartments(clinicId);
      setDepartments(fetched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!name.trim()) {
      toastError('Department name is required');
      return;
    }
    setSaving(true);
    try {
      await createDepartment(clinicId, name.trim(), description.trim() || undefined);
      setName(''); setDescription('');
      success('Department added');
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to add department');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDepartment(id);
      success('Department removed');
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to remove department');
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
        <h3 className="font-bold font-heading mb-4 flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-emerald-500" /> Add Department
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-3">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Department name (e.g. Cardiology)" />
          <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" />
          <Button onClick={handleAdd} disabled={saving} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="text-center p-6 text-muted-foreground">Loading departments...</div>
        ) : departments.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground border border-dashed rounded-xl text-sm">No departments yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map(dept => (
              <div key={dept.id} className="p-4 rounded-xl bg-card border border-border/40 flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">{dept.name}</p>
                  {dept.description && <p className="text-xs text-muted-foreground mt-1">{dept.description}</p>}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => handleDelete(dept.id)} aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicDepartmentsTab;
