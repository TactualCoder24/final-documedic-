import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HeartPulse, Pill, FileText, Bell, AlertTriangle, Activity, Plus, Send } from '../../components/icons/Icons';
import { getVitals, getRecords, getMedications, getSymptoms, getPrescriptionsForPatient, getReferralsForPatient } from '../../services/dataSupabase';
import { Vital, MedicalRecord, Medication, Profile, Symptom, Prescription, Referral } from '../../types';
import { calculateHealthScore } from '../../services/healthScore';
import Button from '../ui/Button';
import PrescriptionWriter from './PrescriptionWriter';
import PrescriptionHistory from './PrescriptionHistory';
import DentalChart from './DentalChart';
import ReferralModal from './ReferralModal';
import ReferralHistory from './ReferralHistory';
import PatientMessages from './PatientMessages';

/* ── tiny sparkline component (CSS-only) ─────────────────────────── */
const Sparkline: React.FC<{ values: number[]; color?: string }> = ({ values, color = 'hsl(var(--primary))' }) => {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1 h-8 mt-2 opacity-80">
      {values.slice(-6).map((v, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full"
          style={{ height: `${Math.max(14, (v / max) * 100)}%`, background: i === values.slice(-6).length - 1 ? color : 'currentColor' }}
        />
      ))}
    </div>
  );
};

/* ── stat tile ────────────────────────────────────────────────────── */
const StatTile = ({ label, value, sub, iconBg = 'bg-blue-50 dark:bg-primary/10', icon, trend, sparkValues }: any) => {
  const trendEl = trend === 'up'
    ? <span className="text-xs font-semibold text-red-500">↑</span>
    : trend === 'down'
    ? <span className="text-xs font-semibold text-emerald-500">↓</span>
    : trend === 'stable'
    ? <span className="text-xs font-semibold text-slate-400">→</span>
    : null;

  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl bg-card border border-border/50 shadow-sm cursor-default">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
        <div className={`flex items-center justify-center w-9 h-9 rounded-xl ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="flex items-end gap-1.5">
          <span className="text-2xl font-bold font-heading text-foreground leading-none">{value}</span>
          {trendEl}
        </div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
      {sparkValues && <Sparkline values={sparkValues} color="var(--primary)" />}
    </div>
  );
};

interface PatientProfileProps {
  patient: Profile;
  patientId: string;
  doctorId?: string;
  doctorProfile?: Profile | null;
}

const PatientProfile = ({ patient, patientId, doctorId, doctorProfile }: PatientProfileProps) => {
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRxWriterOpen, setIsRxWriterOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);

  const refreshPrescriptions = useCallback(async () => {
    try {
      const fetched = await getPrescriptionsForPatient(patientId);
      setPrescriptions(fetched);
    } catch (error) {
      console.error("Error fetching prescriptions", error);
    }
  }, [patientId]);

  const refreshReferrals = useCallback(async () => {
    if (!doctorId) return;
    try {
      const fetched = await getReferralsForPatient(doctorId, patientId);
      setReferrals(fetched);
    } catch (error) {
      console.error("Error fetching referrals", error);
    }
  }, [doctorId, patientId]);

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      try {
        const [fetchedVitals, fetchedRecords, fetchedMeds, fetchedSymptoms, fetchedRx, fetchedReferrals] = await Promise.all([
          getVitals(patientId),
          getRecords(patientId),
          getMedications(patientId),
          getSymptoms(patientId),
          getPrescriptionsForPatient(patientId),
          doctorId ? getReferralsForPatient(doctorId, patientId) : Promise.resolve([])
        ]);
        setVitals(fetchedVitals);
        setRecords(fetchedRecords);
        setMedications(fetchedMeds);
        setSymptoms(fetchedSymptoms);
        setPrescriptions(fetchedRx);
        setReferrals(fetchedReferrals);
      } catch (error) {
        console.error("Error fetching patient specific data", error);
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchPatientData();
  }, [patientId, doctorId]);

  if (loading) {
    return <div className="text-center p-12 text-muted-foreground">Loading patient data...</div>;
  }

  const bpData = vitals.filter(v => v.systolic && v.diastolic);
  const latestBP = bpData[bpData.length - 1];
  
  const timelineEvents = [
    ...records.map(r => ({
      id: r.id, date: r.date, type: 'record', title: r.name, sub: r.analysis?.summary, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50'
    })),
    ...vitals.map(v => ({
      id: v.date, date: v.date, type: 'vital', title: v.systolic ? `BP: ${v.systolic}/${v.diastolic}` : `Sugar: ${v.sugar}`, sub: 'Logged by patient', icon: HeartPulse, color: 'text-rose-500', bg: 'bg-rose-50'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const healthData = calculateHealthScore(vitals, medications, symptoms, 0, patient.waterGoal || 8);
  const healthScore = healthData.total;
  const patientName = patient.name || 'Patient ' + patientId.substring(0,6);

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 rounded-3xl bg-card border border-border/50 shadow-sm">
         <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold ring-4 ring-background shadow-lg">
              {patientName.charAt(0).toUpperCase()}
            </div>
            <div>
               <h1 className="text-3xl font-bold font-heading text-foreground mb-1">{patientName}</h1>
               <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="bg-secondary/50 px-2 py-1 rounded-md">{patient.age || 'Unknown'} years old</span>
                  <span className="bg-secondary/50 px-2 py-1 rounded-md">{patient.bloodType || 'Unknown'}</span>
                  <span className="bg-secondary/50 px-2 py-1 rounded-md">{patient.conditions || 'No conditions listed'}</span>
               </div>
            </div>
         </div>
         <div className="flex gap-4">
             <div className="text-center">
                 <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Health Score</p>
                 <div className={`text-4xl font-black ${healthScore >= 80 ? 'text-emerald-500' : healthScore >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                    {healthScore}
                 </div>
             </div>
         </div>
      </div>

      {/* Vitals Stat Grid */}
      <div>
         <h2 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-primary inline-block" />
            Current Vitals & Adherence
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatTile
              label="Blood Pressure"
              value={latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : 'N/A'}
              sub="mmHg — latest"
              icon={<HeartPulse className="h-5 w-5 text-rose-500" />}
              iconBg="bg-rose-50 dark:bg-rose-900/20"
              sparkValues={bpData.slice(-6).map(v => v.systolic || 0)}
              trend={latestBP && (latestBP.systolic ?? 0) > 130 ? 'up' : 'stable'}
            />
            <StatTile
              label="Active Medications"
              value={medications.length}
              sub={`${medications.filter(m => m.takenToday).length} taken today`}
              icon={<Pill className="h-5 w-5 text-emerald-500" />}
              iconBg="bg-emerald-50 dark:bg-emerald-900/20"
            />
            <StatTile
              label="Recent Records"
              value={records.length}
              sub="Available"
              icon={<FileText className="h-5 w-5 text-blue-500" />}
              iconBg="bg-blue-50 dark:bg-blue-900/20"
            />
         </div>
      </div>

      {/* Prescriptions */}
      <div>
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-heading flex items-center gap-2">
               <span className="w-1.5 h-5 rounded-full bg-emerald-500 inline-block" />
               Prescriptions
            </h2>
            {doctorId && (
              <Button size="sm" onClick={() => setIsRxWriterOpen(true)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> New Prescription
              </Button>
            )}
         </div>
         <PrescriptionHistory
            prescriptions={prescriptions}
            doctorProfile={doctorProfile || null}
            patient={{ ...patient, id: patientId }}
            onChange={refreshPrescriptions}
         />
      </div>

      {/* Specialty template: Dental chart for dentists */}
      {doctorId && doctorProfile?.specialty?.toLowerCase().includes('dent') && (
        <div>
           <h2 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-blue-500 inline-block" />
              Dental Chart
           </h2>
           <DentalChart doctorId={doctorId} patientId={patientId} />
        </div>
      )}

      {/* Messages & Reminders */}
      {doctorId && (
        <PatientMessages doctorId={doctorId} doctorName={doctorProfile?.name} patient={{ ...patient, id: patientId }} />
      )}

      {/* Referrals */}
      {doctorId && (
        <div>
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-heading flex items-center gap-2">
                 <span className="w-1.5 h-5 rounded-full bg-purple-500 inline-block" />
                 Referrals
              </h2>
              <Button size="sm" onClick={() => setIsReferralOpen(true)} className="gap-1.5">
                <Send className="h-3.5 w-3.5" /> Refer Patient
              </Button>
           </div>
           <ReferralHistory referrals={referrals} />
        </div>
      )}

      {doctorId && (
        <PrescriptionWriter
          isOpen={isRxWriterOpen}
          onClose={() => setIsRxWriterOpen(false)}
          doctorId={doctorId}
          doctorProfile={doctorProfile || null}
          patient={{ ...patient, id: patientId }}
          onSaved={refreshPrescriptions}
        />
      )}

      {doctorId && (
        <ReferralModal
          isOpen={isReferralOpen}
          onClose={() => setIsReferralOpen(false)}
          doctorId={doctorId}
          doctorProfile={doctorProfile || null}
          patient={{ ...patient, id: patientId }}
          onSaved={refreshReferrals}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Charts Column */}
         <div className="lg:col-span-2 space-y-8">
            <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
               <h3 className="font-bold font-heading mb-6">Blood Pressure Trend</h3>
               {bpData.length > 0 ? (
                 <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={bpData.map(v => ({ ...v, date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }))}>
                       <defs>
                          <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.5} />
                             <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorDia" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.5} />
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                       <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                       <YAxis stroke="hsl(var(--muted-foreground))" domain={['dataMin - 10', 'dataMax + 10']} fontSize={11} unit=" mmHg" />
                       <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                       <Legend />
                       <Area type="monotone" dataKey="systolic"  name="Systolic"  stroke="#ef4444" fillOpacity={1} fill="url(#colorSys)" strokeWidth={2} activeDot={{ r: 5 }} />
                       <Area type="monotone" dataKey="diastolic" name="Diastolic" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDia)" strokeWidth={2} activeDot={{ r: 5 }} />
                    </AreaChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="flex items-center justify-center h-[260px] text-muted-foreground border border-dashed rounded-xl">
                   No Blood Pressure data available.
                 </div>
               )}
            </div>
         </div>

         {/* Feed Column */}
         <div className="space-y-6">
            <h3 className="font-bold font-heading flex items-center gap-2">
               <span className="w-1.5 h-5 rounded-full bg-indigo-500 inline-block" />
               Patient Activity Feed
            </h3>
            <div className="space-y-4">
               {timelineEvents.length > 0 ? timelineEvents.map((evt, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-card border border-border/40">
                     <div className={`w-10 h-10 rounded-xl ${evt.bg} flex items-center justify-center shrink-0`}>
                        <evt.icon className={`h-5 w-5 ${evt.color}`} />
                     </div>
                     <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase">{evt.type}</p>
                        <p className="font-bold text-foreground text-sm mt-0.5">{evt.title}</p>
                        {evt.sub && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{evt.sub}</p>}
                        <p className="text-[10px] text-muted-foreground mt-2">{new Date(evt.date).toLocaleDateString()}</p>
                     </div>
                  </div>
               )) : (
                 <div className="text-center p-6 text-muted-foreground border border-dashed rounded-xl text-sm">
                   No recent activity.
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default PatientProfile;
