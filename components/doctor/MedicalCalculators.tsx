import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { Activity, HeartPulse, Pill, Baby, TestTube2 as FlaskConical } from '../icons/Icons';

interface MedicalCalculatorsProps {
  isOpen: boolean;
  onClose: () => void;
}

type CalcTab = 'bmi' | 'crcl' | 'bsa' | 'pediatric' | 'calcium';

const TABS: { id: CalcTab; label: string; icon: React.FC<any> }[] = [
  { id: 'bmi', label: 'BMI', icon: Activity },
  { id: 'crcl', label: 'CrCl / eGFR', icon: FlaskConical },
  { id: 'bsa', label: 'BSA', icon: HeartPulse },
  { id: 'pediatric', label: 'Pediatric Dose', icon: Baby },
  { id: 'calcium', label: 'Corrected Ca²⁺', icon: Pill },
];

const Field: React.FC<{ label: string; unit?: string; value: string; onChange: (v: string) => void; type?: string }> = ({ label, unit, value, onChange, type = 'number' }) => (
  <div>
    <label className="text-xs font-semibold text-muted-foreground">{label}{unit ? ` (${unit})` : ''}</label>
    <Input type={type} value={value} onChange={e => onChange(e.target.value)} className="mt-1" />
  </div>
);

const ResultBox: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className="text-2xl font-bold text-primary mt-1">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
  </div>
);

const MedicalCalculators: React.FC<MedicalCalculatorsProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<CalcTab>('bmi');

  // BMI
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const bmi = useMemo(() => {
    const w = parseFloat(weightKg), h = parseFloat(heightCm) / 100;
    if (!w || !h) return null;
    const value = w / (h * h);
    let category = 'Normal';
    if (value < 18.5) category = 'Underweight';
    else if (value >= 25 && value < 30) category = 'Overweight';
    else if (value >= 30) category = 'Obese';
    return { value: value.toFixed(1), category };
  }, [weightKg, heightCm]);

  // Creatinine Clearance (Cockcroft-Gault)
  const [age, setAge] = useState('');
  const [weightCrcl, setWeightCrcl] = useState('');
  const [creatinine, setCreatinine] = useState('');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const crcl = useMemo(() => {
    const a = parseFloat(age), w = parseFloat(weightCrcl), cr = parseFloat(creatinine);
    if (!a || !w || !cr) return null;
    let value = ((140 - a) * w) / (72 * cr);
    if (sex === 'female') value *= 0.85;
    return value.toFixed(1);
  }, [age, weightCrcl, creatinine, sex]);

  // BSA (Mosteller formula)
  const [weightBsa, setWeightBsa] = useState('');
  const [heightBsa, setHeightBsa] = useState('');
  const bsa = useMemo(() => {
    const w = parseFloat(weightBsa), h = parseFloat(heightBsa);
    if (!w || !h) return null;
    return Math.sqrt((w * h) / 3600).toFixed(2);
  }, [weightBsa, heightBsa]);

  // Pediatric dosage (Clark's rule based on adult dose)
  const [adultDose, setAdultDose] = useState('');
  const [childWeight, setChildWeight] = useState('');
  const pediatricDose = useMemo(() => {
    const dose = parseFloat(adultDose), w = parseFloat(childWeight);
    if (!dose || !w) return null;
    return ((w * dose) / 70).toFixed(2);
  }, [adultDose, childWeight]);

  // Corrected calcium
  const [measuredCa, setMeasuredCa] = useState('');
  const [albumin, setAlbumin] = useState('');
  const correctedCa = useMemo(() => {
    const ca = parseFloat(measuredCa), alb = parseFloat(albumin);
    if (!ca || !alb) return null;
    return (ca + 0.8 * (4 - alb)).toFixed(2);
  }, [measuredCa, albumin]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Medical Calculators" variant="glass">
      <div className="space-y-4 max-w-xl">
        <div className="flex flex-wrap gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === t.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
            >
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'bmi' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Weight" unit="kg" value={weightKg} onChange={setWeightKg} />
              <Field label="Height" unit="cm" value={heightCm} onChange={setHeightCm} />
            </div>
            {bmi && <ResultBox label="BMI" value={bmi.value} sub={bmi.category} />}
          </div>
        )}

        {tab === 'crcl' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Age" unit="years" value={age} onChange={setAge} />
              <Field label="Weight" unit="kg" value={weightCrcl} onChange={setWeightCrcl} />
              <Field label="Serum Creatinine" unit="mg/dL" value={creatinine} onChange={setCreatinine} />
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Sex</label>
                <select value={sex} onChange={e => setSex(e.target.value as 'male' | 'female')} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            {crcl && <ResultBox label="Creatinine Clearance (Cockcroft-Gault)" value={`${crcl} mL/min`} />}
          </div>
        )}

        {tab === 'bsa' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Weight" unit="kg" value={weightBsa} onChange={setWeightBsa} />
              <Field label="Height" unit="cm" value={heightBsa} onChange={setHeightBsa} />
            </div>
            {bsa && <ResultBox label="Body Surface Area (Mosteller)" value={`${bsa} m²`} />}
          </div>
        )}

        {tab === 'pediatric' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Adult Dose" unit="mg" value={adultDose} onChange={setAdultDose} />
              <Field label="Child Weight" unit="kg" value={childWeight} onChange={setChildWeight} />
            </div>
            {pediatricDose && <ResultBox label="Estimated Pediatric Dose (Clark's Rule)" value={`${pediatricDose} mg`} sub="Always verify against pediatric formularies" />}
          </div>
        )}

        {tab === 'calcium' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Measured Calcium" unit="mg/dL" value={measuredCa} onChange={setMeasuredCa} />
              <Field label="Serum Albumin" unit="g/dL" value={albumin} onChange={setAlbumin} />
            </div>
            {correctedCa && <ResultBox label="Corrected Calcium" value={`${correctedCa} mg/dL`} />}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground italic">For clinical reference only — always confirm against current guidelines.</p>
      </div>
    </Modal>
  );
};

export default MedicalCalculators;
