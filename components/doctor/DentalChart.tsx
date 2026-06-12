import React, { useState, useEffect, useCallback } from 'react';
import { getDentalChart, saveDentalChart } from '../../services/dataSupabase';
import { useToast } from '../../hooks/useToast';
import Button from '../ui/Button';

// FDI tooth numbering: upper right (18-11), upper left (21-28), lower left (38-31), lower right (41-48)
const UPPER_RIGHT = ['18', '17', '16', '15', '14', '13', '12', '11'];
const UPPER_LEFT = ['21', '22', '23', '24', '25', '26', '27', '28'];
const LOWER_LEFT = ['31', '32', '33', '34', '35', '36', '37', '38'];
const LOWER_RIGHT = ['48', '47', '46', '45', '44', '43', '42', '41'];

const CONDITIONS = [
  { value: '', label: 'Healthy', color: 'bg-secondary text-secondary-foreground' },
  { value: 'Caries', label: 'Caries', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  { value: 'Filled', label: 'Filled', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { value: 'Crown', label: 'Crown', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  { value: 'Missing', label: 'Missing', color: 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
  { value: 'Root Canal', label: 'Root Canal', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  { value: 'Implant', label: 'Implant', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
];

const conditionColor = (cond?: string) => CONDITIONS.find(c => c.value === (cond || ''))?.color || CONDITIONS[0].color;

interface ToothProps {
  number: string;
  condition?: string;
  selected: boolean;
  onClick: () => void;
}

const Tooth: React.FC<ToothProps> = ({ number, condition, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={condition || 'Healthy'}
    className={`flex flex-col items-center justify-center w-10 h-12 rounded-lg border text-[11px] font-semibold transition-all ${conditionColor(condition)} ${selected ? 'ring-2 ring-primary' : 'border-border/40'}`}
  >
    <span>{number}</span>
  </button>
);

interface DentalChartProps {
  doctorId: string;
  patientId: string;
}

const DentalChart: React.FC<DentalChartProps> = ({ doctorId, patientId }) => {
  const { success, error } = useToast();
  const [teeth, setTeeth] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const chart = await getDentalChart(doctorId, patientId);
      setTeeth(chart?.teeth || {});
      setNotes(chart?.notes || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [doctorId, patientId]);

  useEffect(() => { load(); }, [load]);

  const setCondition = (cond: string) => {
    if (!selectedTooth) return;
    setTeeth(prev => {
      const next = { ...prev };
      if (cond) next[selectedTooth] = cond;
      else delete next[selectedTooth];
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveDentalChart(doctorId, patientId, { teeth, notes });
      success('Dental chart saved');
    } catch (e) {
      console.error(e);
      error('Failed to save dental chart');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-6 text-muted-foreground text-sm">Loading dental chart...</div>;

  const renderRow = (nums: string[]) => (
    <div className="flex gap-1.5 justify-center flex-wrap">
      {nums.map(n => (
        <Tooth key={n} number={n} condition={teeth[n]} selected={selectedTooth === n} onClick={() => setSelectedTooth(n)} />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-card border border-border/50 space-y-2">
        {renderRow(UPPER_RIGHT.concat(UPPER_LEFT))}
        <div className="border-t border-dashed border-border/60 my-2" />
        {renderRow(LOWER_RIGHT.concat(LOWER_LEFT))}
      </div>

      {selectedTooth && (
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-sm font-semibold mb-2">Tooth {selectedTooth} — set condition</p>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map(c => (
              <button
                key={c.value}
                onClick={() => setCondition(c.value)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.color} ${(teeth[selectedTooth] || '') === c.value ? 'ring-2 ring-primary' : ''}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-muted-foreground">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="Additional dental notes..."
          className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Dental Chart'}</Button>
    </div>
  );
};

export default DentalChart;
