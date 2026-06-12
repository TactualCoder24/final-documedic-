import React, { useEffect, useState, useCallback } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { LabOrder } from '../../types';
import { getLabOrders, createLabOrder, updateLabOrder } from '../../services/dataSupabase';
import { useToast } from '../../hooks/useToast';
import { TestTube2, Plus } from '../icons/Icons';

interface LabOrdersTabProps {
  clinicId: string;
}

const STATUSES: LabOrder['status'][] = ['ordered', 'sample_collected', 'in_progress', 'completed', 'cancelled'];

const statusLabels: Record<LabOrder['status'], string> = {
  ordered: 'Ordered',
  sample_collected: 'Sample Collected',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const statusStyles: Record<LabOrder['status'], string> = {
  ordered: 'bg-secondary text-muted-foreground',
  sample_collected: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  in_progress: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  completed: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
  cancelled: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400',
};

const LabOrdersTab: React.FC<LabOrdersTabProps> = ({ clinicId }) => {
  const { success, error: toastError } = useToast();
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [testName, setTestName] = useState('');

  const [resultDrafts, setResultDrafts] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLabOrders(clinicId);
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!patientName.trim() || !testName.trim()) {
      toastError('Enter a patient name and test name');
      return;
    }
    setSaving(true);
    try {
      await createLabOrder(clinicId, {
        patientName: patientName.trim(),
        doctorName: doctorName.trim() || undefined,
        testName: testName.trim(),
      });
      setPatientName(''); setDoctorName(''); setTestName('');
      success('Lab order created');
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to create lab order');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (order: LabOrder, status: LabOrder['status']) => {
    try {
      await updateLabOrder(order.id, { status });
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status } : o));
    } catch (e) {
      console.error(e);
      toastError('Failed to update order');
    }
  };

  const handleSaveResultNotes = async (order: LabOrder) => {
    const notes = resultDrafts[order.id];
    if (notes === undefined) return;
    try {
      await updateLabOrder(order.id, { resultNotes: notes });
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, resultNotes: notes } : o));
      success('Result notes saved');
    } catch (e) {
      console.error(e);
      toastError('Failed to save notes');
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-card border border-border/50 flex items-start gap-3">
        <TestTube2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Track lab test orders from sample collection through to completed results.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
        <h3 className="font-bold font-heading mb-3 text-sm">New Lab Order</h3>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3">
          <Input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Patient name" />
          <Input value={doctorName} onChange={e => setDoctorName(e.target.value)} placeholder="Ordering doctor (optional)" />
          <Input value={testName} onChange={e => setTestName(e.target.value)} placeholder="Test name (e.g. CBC)" />
          <Button onClick={handleAdd} disabled={saving} className="gap-1.5">
            <Plus className="h-4 w-4" /> Order
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-6 text-muted-foreground">Loading lab orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center p-6 text-muted-foreground border border-dashed rounded-xl text-sm">No lab orders yet.</div>
      ) : (
        <div className="space-y-2">
          {orders.map(order => (
            <div key={order.id} className="p-3 rounded-xl bg-card border border-border/40">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">{order.testName} — {order.patientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.doctorName ? `Dr. ${order.doctorName} · ` : ''}Ordered {new Date(order.orderedAt).toLocaleDateString()}
                    {order.completedAt ? ` · Completed ${new Date(order.completedAt).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <select
                  value={order.status}
                  onChange={e => handleStatusChange(order, e.target.value as LabOrder['status'])}
                  className={`h-8 rounded-full px-2 text-xs font-semibold border-0 ${statusStyles[order.status]}`}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                </select>
              </div>
              {(order.status === 'in_progress' || order.status === 'completed') && (
                <div className="mt-2 flex gap-2">
                  <Input
                    value={resultDrafts[order.id] ?? order.resultNotes ?? ''}
                    onChange={e => setResultDrafts(prev => ({ ...prev, [order.id]: e.target.value }))}
                    onBlur={() => handleSaveResultNotes(order)}
                    placeholder="Result notes"
                    className="flex-1 h-9"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LabOrdersTab;
