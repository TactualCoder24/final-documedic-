import React, { useEffect, useState, useCallback } from 'react';
import Button from '../ui/Button';
import { ClinicStaff, DoctorScheduleConfig } from '../../types';
import { getClinicStaff, getClinicScheduleConfigs, saveDoctorScheduleConfig } from '../../services/dataSupabase';
import { useToast } from '../../hooks/useToast';
import { Clock } from '../icons/Icons';

interface SchedulerConfigTabProps {
  clinicId: string;
}

interface RowState {
  slotDurationMinutes: number;
  bufferMinutes: number;
  allowOverbooking: boolean;
  walkinPriority: 'fifo' | 'scheduled_first';
}

const DEFAULT_ROW: RowState = {
  slotDurationMinutes: 15,
  bufferMinutes: 0,
  allowOverbooking: false,
  walkinPriority: 'fifo',
};

const SchedulerConfigTab: React.FC<SchedulerConfigTabProps> = ({ clinicId }) => {
  const { success, error: toastError } = useToast();
  const [doctors, setDoctors] = useState<ClinicStaff[]>([]);
  const [configs, setConfigs] = useState<Record<string, RowState>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [staff, scheduleConfigs] = await Promise.all([
        getClinicStaff(clinicId),
        getClinicScheduleConfigs(clinicId),
      ]);
      const activeDoctors = staff.filter(s => s.role === 'doctor' && s.status === 'active' && s.userId);
      setDoctors(activeDoctors);

      const configMap: Record<string, RowState> = {};
      activeDoctors.forEach(doc => {
        const existing = scheduleConfigs.find((c: DoctorScheduleConfig) => c.doctorId === doc.userId);
        configMap[doc.userId!] = existing
          ? {
              slotDurationMinutes: existing.slotDurationMinutes,
              bufferMinutes: existing.bufferMinutes,
              allowOverbooking: existing.allowOverbooking,
              walkinPriority: existing.walkinPriority,
            }
          : { ...DEFAULT_ROW };
      });
      setConfigs(configMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => { load(); }, [load]);

  const updateConfig = (doctorId: string, patch: Partial<RowState>) => {
    setConfigs(prev => ({ ...prev, [doctorId]: { ...prev[doctorId], ...patch } }));
  };

  const handleSave = async (doctorId: string) => {
    const config = configs[doctorId];
    if (!config) return;
    setSavingId(doctorId);
    try {
      await saveDoctorScheduleConfig(doctorId, { clinicId, ...config });
      success('Schedule settings saved');
    } catch (e) {
      console.error(e);
      toastError('Failed to save schedule settings');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-card border border-border/50 flex items-start gap-3">
        <Clock className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Configure appointment slot durations, buffer times, and walk-in handling for each doctor in your clinic.
        </p>
      </div>

      {loading ? (
        <div className="text-center p-6 text-muted-foreground">Loading doctors...</div>
      ) : doctors.length === 0 ? (
        <div className="text-center p-6 text-muted-foreground border border-dashed rounded-xl text-sm">
          No active doctors yet. Invite doctors from the Staff tab first.
        </div>
      ) : (
        <div className="space-y-4">
          {doctors.map(doc => {
            const config = configs[doc.userId!] || DEFAULT_ROW;
            return (
              <div key={doc.id} className="p-4 rounded-xl bg-card border border-border/40 space-y-3">
                <p className="font-semibold text-sm">{doc.staffName || doc.staffEmail}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Slot Duration (min)</label>
                    <input
                      type="number"
                      min={5}
                      step={5}
                      value={config.slotDurationMinutes}
                      onChange={e => updateConfig(doc.userId!, { slotDurationMinutes: Number(e.target.value) })}
                      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Buffer Between Slots (min)</label>
                    <input
                      type="number"
                      min={0}
                      step={5}
                      value={config.bufferMinutes}
                      onChange={e => updateConfig(doc.userId!, { bufferMinutes: Number(e.target.value) })}
                      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Walk-in Priority</label>
                    <select
                      value={config.walkinPriority}
                      onChange={e => updateConfig(doc.userId!, { walkinPriority: e.target.value as RowState['walkinPriority'] })}
                      className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                    >
                      <option value="fifo">First-come, first-served</option>
                      <option value="scheduled_first">Scheduled appointments first</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground h-9">
                      <input
                        type="checkbox"
                        checked={config.allowOverbooking}
                        onChange={e => updateConfig(doc.userId!, { allowOverbooking: e.target.checked })}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      Allow overbooking
                    </label>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => handleSave(doc.userId!)} disabled={savingId === doc.userId}>
                    {savingId === doc.userId ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SchedulerConfigTab;
