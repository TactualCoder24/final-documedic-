import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import { Pill, FileText, BrainCircuit, ClipboardList, Search, Bell, Share2, Lightbulb, Activity, GlassWater, Utensils, Plus, HeartPulse, Stethoscope, MapPin, CalendarDays, Settings } from '../components/icons/Icons';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';
import { Vital, MedicalRecord, Medication, Reminder, Profile, Symptom, TestOrProcedure } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { getVitals, getRecords, getMedications, getReminders, getProfile, saveProfile, addVital, getSymptoms, getWaterIntake, updateWaterIntake, getTestsAndProcedures } from '../services/dataSupabase';
import { getMoodHistory, MoodEntry } from '../services/mentibotSupabase';

const categoryInfo = {
  record:     { title: 'Medical Records', icon: FileText,  color: 'text-blue-500' },
  medication: { title: 'Medications',     icon: Pill,      color: 'text-emerald-500' },
  reminder:   { title: 'Reminders',       icon: Bell,      color: 'text-amber-500' },
};

const getTodayDateString = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

/* ── tiny sparkline component (CSS-only) ─────────────────────────── */
const Sparkline: React.FC<{ values: number[]; color?: string }> = ({ values, color = 'hsl(var(--primary))' }) => {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  return (
    <div className="sparkline">
      {values.slice(-6).map((v, i) => (
        <div
          key={i}
          className="sparkline-bar"
          style={{ height: `${Math.max(14, (v / max) * 100)}%`, background: i === values.slice(-6).length - 1 ? color : undefined }}
        />
      ))}
    </div>
  );
};

/* ── stat tile ────────────────────────────────────────────────────── */
interface StatTileProps {
  label: string;
  value: string | React.ReactNode;
  sub?: string;
  iconBg?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  sparkValues?: number[];
  onClick?: () => void;
  tourAttr?: string;
}

const StatTile: React.FC<StatTileProps> = ({ label, value, sub, iconBg = 'bg-blue-50 dark:bg-primary/10', icon, trend, sparkValues, onClick, tourAttr }) => {
  const trendEl = trend === 'up'
    ? <span className="text-xs font-semibold text-red-500">↑</span>
    : trend === 'down'
    ? <span className="text-xs font-semibold text-emerald-500">↓</span>
    : trend === 'stable'
    ? <span className="text-xs font-semibold text-slate-400">→</span>
    : null;

  return (
    <div
      className="stat-tile flex flex-col gap-3 cursor-default"
      onClick={onClick}
      {...(tourAttr ? { 'data-tour': tourAttr } : {})}
    >
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
      {sparkValues && <Sparkline values={sparkValues} />}
    </div>
  );
};

/* ── timeline event types ─────────────────────────────────────────── */
type TimelineEvent = {
  id: string;
  date: string;
  type: 'record' | 'vital' | 'medication' | 'reminder';
  title: string;
  sub?: string;
  badge?: { label: string; color: string };
  link?: string;
  analysis?: any;
};

const typeColors: Record<TimelineEvent['type'], { dot: string; bg: string; icon: React.FC<any> }> = {
  record:     { dot: 'border-blue-500 shadow-blue-200',       bg: 'bg-blue-50 dark:bg-blue-900/20',    icon: FileText },
  vital:      { dot: 'border-rose-500 shadow-rose-200',       bg: 'bg-rose-50 dark:bg-rose-900/20',    icon: HeartPulse },
  medication: { dot: 'border-emerald-500 shadow-emerald-200', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: Pill },
  reminder:   { dot: 'border-amber-500 shadow-amber-200',     bg: 'bg-amber-50 dark:bg-amber-900/20',  icon: Bell },
};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [vitals, setVitals]         = React.useState<Vital[]>([]);
  const [records, setRecords]       = React.useState<MedicalRecord[]>([]);
  const [medications, setMedications] = React.useState<Medication[]>([]);
  const [reminders, setReminders]   = React.useState<Reminder[]>([]);
  const [symptoms, setSymptoms]     = React.useState<Symptom[]>([]);
  const [tests, setTests]           = React.useState<TestOrProcedure[]>([]);
  const [waterIntake, setWaterIntake] = React.useState(0);
  const [profile, setProfile]       = React.useState<Profile | null>(null);
  const [moodHistory, setMoodHistory] = React.useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading]   = React.useState(true);

  const [isVitalsModalOpen, setIsVitalsModalOpen]   = React.useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery]               = React.useState('');
  const { t } = useTranslation();

  const todayStr = getTodayDateString();

  const refreshData = React.useCallback(async () => {
    if (user) {
      setIsLoading(true);
      try {
        const fetchPromise = Promise.all([
          getVitals(user.uid).catch(e => { console.error('getVitals error:', e); return []; }),
          getRecords(user.uid).catch(e => { console.error('getRecords error:', e); return []; }),
          getMedications(user.uid).catch(e => { console.error('getMedications error:', e); return []; }),
          getReminders(user.uid).catch(e => { console.error('getReminders error:', e); return []; }),
          getSymptoms(user.uid).catch(e => { console.error('getSymptoms error:', e); return []; }),
          getWaterIntake(user.uid, todayStr).catch(e => { console.error('getWaterIntake error:', e); return 0; }),
          getProfile(user.uid).catch(e => { console.error('getProfile error:', e); return null; }),
          getTestsAndProcedures(user.uid).catch(e => { console.error('getTestsAndProcedures error:', e); return []; }),
          getMoodHistory(user.uid).catch(e => { console.error('getMoodHistory error:', e); return []; }),
        ]);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Dashboard data fetch timeout')), 10000)
        );
        const result = await Promise.race([fetchPromise, timeoutPromise]) as any[];
        const [vitalsData, recordsData, medsData, remindersData, symptomsData, waterIntakeData, profileData, testsData, moodData] = result;

        setVitals(vitalsData);
        setRecords(recordsData);
        setMedications(medsData);
        setReminders(remindersData);
        setSymptoms(symptomsData);
        setTests(testsData);
        setWaterIntake(waterIntakeData);
        setProfile(profileData);
        setMoodHistory(moodData);

        const lastProfileSkipDate = localStorage.getItem('profileUpdateSkippedDate');
        if (lastProfileSkipDate !== todayStr && profileData && !profileData.age && !profileData.conditions && !profileData.goals) {
          setIsProfileModalOpen(true);
        }
      } catch (error) {
        console.error('Dashboard data fetching error:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [user, todayStr]);

  React.useEffect(() => {
    refreshData();
    window.addEventListener('onboarding-data-saved', refreshData);
    return () => window.removeEventListener('onboarding-data-saved', refreshData);
  }, [refreshData]);

  const handleUpdateVitals = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const sugar = Number(formData.get('sugar'));
    const systolic = Number(formData.get('systolic'));
    const diastolic = Number(formData.get('diastolic'));

    const newVitals: { sugar?: number; systolic?: number; diastolic?: number } = {};
    if (sugar > 0) newVitals.sugar = sugar;
    if (systolic > 0 && diastolic > 0) {
      newVitals.systolic = systolic;
      newVitals.diastolic = diastolic;
    } else if (systolic > 0 || diastolic > 0) {
      toast.warning('Please enter both systolic and diastolic values for blood pressure.');
      return;
    }
    if (Object.keys(newVitals).length > 0) {
      await addVital(user.uid, newVitals);
      setVitals(await getVitals(user.uid));
      setIsVitalsModalOpen(false);
      e.currentTarget.reset();
    } else {
      toast.warning('Please enter at least one valid vital measurement.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    try {
      const formData = new FormData(e.currentTarget);
      const newProfile: Profile = {
        age: formData.get('age') as string,
        conditions: formData.get('conditions') as string,
        goals: formData.get('goals') as string,
        bloodType: formData.get('bloodType') as string,
        emergencyContactName: formData.get('contactName') as string,
        emergencyContactPhone: formData.get('contactPhone') as string,
        targetBloodSugar: formData.get('targetBloodSugar') as string,
        waterGoal: Number(formData.get('waterGoal')) || 8,
      };
      await saveProfile(user.uid, newProfile);
      setProfile(newProfile);
      setIsProfileModalOpen(false);
      refreshData();
      toast.success('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    }
  };

  const handleSkipProfileUpdate = () => {
    localStorage.setItem('profileUpdateSkippedDate', todayStr);
    setIsProfileModalOpen(false);
  };

  const handleShareProfile = () => {
    if (!user) return;
    const url = `${window.location.origin}${window.location.pathname}#/emergency/${user.uid}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Emergency profile link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const handleWaterChange = async (amount: number) => {
    if (!user) return;
    await updateWaterIntake(user.uid, todayStr, amount);
    setWaterIntake(await getWaterIntake(user.uid, todayStr));
  };

  // Search
  const searchableData = [
    ...records.map(item    => ({ ...item, type: 'record',     name: item.name,  path: '/records' })),
    ...medications.map(item => ({ ...item, type: 'medication', name: item.name,  path: '/medications' })),
    ...reminders.map(item   => ({ ...item, type: 'reminder',   name: item.title, path: '/reminders' })),
  ];
  const filteredResults = searchQuery
    ? searchableData.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const resultsByType = filteredResults.reduce((acc, item) => {
    const key = item.type as keyof typeof categoryInfo;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<keyof typeof categoryInfo, any[]>);

  // Derived vitals
  const nextMedication   = medications.find(m => !m.takenToday);
  const waterGoal        = profile?.waterGoal || 8;
  const latestBPressure  = [...vitals].reverse().find(v => v.systolic && v.diastolic);
  const bpData           = vitals.filter(v => v.systolic && v.diastolic);
  const latestMood       = moodHistory.length > 0 ? moodHistory[0] : null;

  /* ── Build Smart Timeline ─────────────────────────────────────── */
  const timelineEvents: TimelineEvent[] = [
    ...records.slice(0, 5).map(r => ({
      id: `rec-${r.id}`,
      date: r.date,
      type: 'record' as const,
      title: r.name,
      sub: r.type,
      link: '/records',
      analysis: r.analysis,
    })),
    ...vitals.slice(-5).map(v => ({
      id: `vital-${v.id}`,
      date: v.date,
      type: 'vital' as const,
      title: v.systolic ? `BP: ${v.systolic}/${v.diastolic} mmHg` : `Sugar: ${v.sugar} mg/dL`,
      sub: v.systolic ? 'Blood Pressure' : 'Blood Sugar',
    })),
    ...medications.slice(0, 3).map(m => ({
      id: `med-${m.id}`,
      date: todayStr,
      type: 'medication' as const,
      title: m.name,
      sub: `${m.dosage} · ${m.frequency}`,
      badge: m.takenToday ? { label: '✓ Taken', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' } : { label: 'Pending', color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  /* ── Empty state ─────────────────────────────────────────────── */
  const hasAnyData = records.length > 0 || vitals.length > 0 || medications.length > 0;

  const EmptyDashboard = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-primary/10 dark:to-indigo-900/20 flex items-center justify-center empty-float">
          <HeartPulse className="h-12 w-12 text-primary" />
        </div>
        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary animate-ping opacity-50" />
      </div>
      <h2 className="text-2xl font-bold font-heading text-foreground">Your health story starts here</h2>
      <p className="mt-2 text-muted-foreground max-w-sm text-sm leading-relaxed">
        Upload your first document, log vitals, or add medications to get a personalized view of your health.
      </p>
      <div className="flex flex-wrap gap-3 mt-8 justify-center">
        <Button onClick={() => navigate('/records')} className="gap-2">
          <FileText className="h-4 w-4" />
          Upload a Document
        </Button>
        <Button variant="outline" onClick={() => setIsVitalsModalOpen(true)} className="gap-2">
          <Activity className="h-4 w-4" />
          Log Vitals
        </Button>
      </div>
    </div>
  );

  /* ── Main Dashboard content ──────────────────────────────────── */
  const DashboardContent = () => {
    if (!hasAnyData) return <EmptyDashboard />;

    return (
      <div className="space-y-8">

        {/* ── QUICK ACTIONS ─────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3" data-tour="quick-actions">
          {[
            { label: 'Schedule', icon: CalendarDays, bg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600 dark:text-blue-400', path: '/appointments' },
            { label: 'Find Care', icon: MapPin, bg: 'bg-cyan-50 dark:bg-cyan-900/20', iconColor: 'text-cyan-600 dark:text-cyan-400', path: '/find-care' },
            { label: 'Log Vitals', icon: ClipboardList, bg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600 dark:text-emerald-400', action: () => setIsVitalsModalOpen(true) },
          ].map(({ label, icon: Icon, bg, iconColor, path, action }) => (
            <button
              key={label}
              onClick={action ?? (() => navigate(path!))}
              className="flex flex-col items-center justify-center gap-2 py-5 px-3 rounded-2xl bg-white dark:bg-card border border-slate-100 dark:border-border/50 hover:border-primary/30 hover:shadow-[0_4px_16px_rgba(37,99,235,0.12)] transition-all duration-200 group"
            >
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`h-6 w-6 ${iconColor}`} />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-foreground">{label}</span>
            </button>
          ))}
        </div>

        {/* ── VITALS STAT GRID ──────────────────────────────────── */}
        <div>
          <h2 className="text-base font-bold font-heading text-foreground mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-primary inline-block" />
            Today's Overview
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile
              label="Water Intake"
              value={`${waterIntake}/${waterGoal}`}
              sub="glasses today"
              icon={<GlassWater className="h-5 w-5 text-cyan-500" />}
              iconBg="bg-cyan-50 dark:bg-cyan-900/20"
              sparkValues={[waterGoal * 0.3, waterGoal * 0.5, waterGoal * 0.6, waterGoal * 0.8, waterIntake]}
              tourAttr="water-intake"
            />
            <StatTile
              label="Blood Pressure"
              value={latestBPressure ? `${latestBPressure.systolic}/${latestBPressure.diastolic}` : 'N/A'}
              sub={latestBPressure ? 'mmHg — latest' : 'Log your BP'}
              icon={<HeartPulse className="h-5 w-5 text-rose-500" />}
              iconBg="bg-rose-50 dark:bg-rose-900/20"
              sparkValues={bpData.slice(-6).map(v => v.systolic || 0)}
              trend={latestBPressure && latestBPressure.systolic > 130 ? 'up' : latestBPressure ? 'stable' : undefined}
              tourAttr="blood-pressure"
            />
            <StatTile
              label="Next Medication"
              value={nextMedication ? nextMedication.name : 'All Done!'}
              sub={nextMedication ? nextMedication.dosage : 'Great job today 🎉'}
              icon={<Pill className="h-5 w-5 text-emerald-500" />}
              iconBg="bg-emerald-50 dark:bg-emerald-900/20"
              onClick={() => navigate('/medications')}
            />
            <StatTile
              label="Latest Mood"
              value={latestMood?.mood_label || '—'}
              sub={latestMood ? latestMood.notes?.slice(0, 28) || 'Tracked via AI Wellness' : 'Not logged yet'}
              icon={<BrainCircuit className="h-5 w-5 text-violet-500" />}
              iconBg="bg-violet-50 dark:bg-violet-900/20"
              onClick={() => navigate('/dashboard/mentibot/mood')}
            />
          </div>
        </div>

        {/* ── SMART TIMELINE ────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-indigo-500 inline-block" />
              Health Feed
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/records')} className="text-xs text-primary hover:bg-blue-50 dark:hover:bg-primary/10">
              View all →
            </Button>
          </div>

          {timelineEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No health events yet. Start by uploading a document or logging vitals.
            </div>
          ) : (
            <div className="timeline-root space-y-0" data-tour="recent-uploads">
              {timelineEvents.map((event, idx) => {
                const cfg = typeColors[event.type];
                const Icon = cfg.icon;
                return (
                  <div key={event.id} className="relative pl-6 pb-1">
                    {/* connector dot */}
                    <div className={`timeline-dot border-2 ${cfg.dot}`} style={{ top: '1rem', left: '-0.625rem' }}>
                      <Icon className="h-2.5 w-2.5 text-muted-foreground" />
                    </div>

                    {/* event card */}
                    <div
                      className="timeline-item stagger-item"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.bg} ${
                              event.type === 'record' ? 'text-blue-600 dark:text-blue-400'
                              : event.type === 'vital' ? 'text-rose-600 dark:text-rose-400'
                              : event.type === 'medication' ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                            }`}>
                              {event.type}
                            </span>
                            {event.badge && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${event.badge.color}`}>
                                {event.badge.label}
                              </span>
                            )}
                            <span className="text-[11px] text-muted-foreground ml-auto shrink-0">
                              {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className="font-semibold text-sm text-foreground mt-1 truncate">{event.title}</p>
                          {event.sub && <p className="text-xs text-muted-foreground mt-0.5">{event.sub}</p>}
                        </div>
                        {event.link && (
                          <button
                            onClick={() => navigate(event.link!)}
                            className="shrink-0 text-xs font-semibold text-primary hover:bg-blue-50 dark:hover:bg-primary/10 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── UPCOMING TESTS ────────────────────────────────────── */}
        {tests.length > 0 && (
          <div>
            <h2 className="text-base font-bold font-heading text-foreground mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-amber-500 inline-block" />
              Upcoming Tests & Procedures
            </h2>
            <div className="space-y-3">
              {tests.map(test => (
                <div key={test.id} className="flex items-start gap-4 p-4 bg-white dark:bg-card border border-slate-100 dark:border-border/50 rounded-xl">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Stethoscope className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{test.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(test.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      {test.location ? ` · ${test.location}` : ''}
                    </p>
                    {test.instructions && <p className="text-xs text-muted-foreground mt-1">ℹ {test.instructions}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BLOOD SUGAR CHART ─────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Blood Sugar Trend</CardTitle>
            <CardDescription>
              {vitals.some(v => v.sugar) ? 'Your recent blood sugar history.' : 'Log your vitals to see your trend.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vitals.some(v => v.sugar) ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={vitals.slice(-30).map(v => ({ ...v, date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }))}>
                  <defs>
                    <linearGradient id="colorSugar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={['dataMin - 10', 'dataMax + 10']} fontSize={11} unit=" mg/dL" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', boxShadow: '0 4px 16px rgba(37,99,235,0.1)' }} />
                  <Legend />
                  <Area type="monotone" dataKey="sugar" name="Blood Sugar" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSugar)" strokeWidth={2} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10 text-muted-foreground text-sm">No blood sugar data logged yet.</div>
            )}
          </CardContent>
        </Card>

        {/* ── BLOOD PRESSURE CHART ──────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Blood Pressure Trend</CardTitle>
            <CardDescription>
              {bpData.length > 0 ? 'Your recent blood pressure history.' : 'Log your blood pressure to see your trend.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bpData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={bpData.slice(-30).map(v => ({ ...v, date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }))}>
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
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', boxShadow: '0 4px 16px rgba(37,99,235,0.1)' }} />
                  <Legend />
                  <Area type="monotone" dataKey="systolic"  name="Systolic"  stroke="#ef4444" fillOpacity={1} fill="url(#colorSys)" strokeWidth={2} activeDot={{ r: 5 }} />
                  <Area type="monotone" dataKey="diastolic" name="Diastolic" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDia)" strokeWidth={2} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10 text-muted-foreground text-sm">No blood pressure data logged yet.</div>
            )}
          </CardContent>
        </Card>

      </div>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading text-foreground leading-tight">
              {t('dashboard.welcome_back', 'Welcome back,')}{' '}
              <span className="text-gradient">{user?.displayName?.split(' ')[0] || 'User'}</span>!
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('dashboard.overview_desc', "Here's a quick overview of your health profile.")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button onClick={() => setIsProfileModalOpen(true)} variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button onClick={handleShareProfile} variant="gradient" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share Emergency Profile
            </Button>
          </div>
        </div>

        {/* Global search */}
        <div className="relative group" data-tour="search-bar">
          <label htmlFor="dashboard-search" className="sr-only">Search records, medications, reminders</label>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="dashboard-search"
            placeholder="Search records, medications, reminders…"
            className="pl-11 h-11 border-slate-200 dark:border-border bg-white dark:bg-card focus:border-primary/50 focus:ring-2 focus:ring-primary/15 rounded-xl shadow-sm transition-all"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {searchQuery ? (
          <Card>
            <CardHeader>
              <CardTitle>Search Results for "{searchQuery}"</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredResults.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(resultsByType).map(([type, items]) => {
                    const info = categoryInfo[type as keyof typeof categoryInfo];
                    return (
                      <div key={type}>
                        <h3 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-2 uppercase tracking-wide">
                          <info.icon className={`h-3.5 w-3.5 ${info.color}`} />
                          {info.title}
                        </h3>
                        <div className="space-y-1.5">
                          {(items as any[]).map(item => (
                            <Link to={item.path} key={item.id} className="block p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-primary/8 transition-colors">
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {type === 'record'     && `${item.type} · ${item.date}`}
                                {type === 'medication' && `${item.dosage}, ${item.frequency}`}
                                {type === 'reminder'   && new Date(item.time).toLocaleString()}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground text-sm">No results found for "{searchQuery}".</div>
              )}
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="min-h-screen soft-aurora flex pt-20 justify-center">
            <Skeleton variant="dashboard" />
          </div>
        ) : (
          <DashboardContent />
        )}
      </div>

      {/* Log Vitals Modal */}
      <Modal title="Log Today's Vitals" isOpen={isVitalsModalOpen} onClose={() => setIsVitalsModalOpen(false)}>
        <form className="space-y-4" onSubmit={handleUpdateVitals}>
          <div>
            <label htmlFor="sugar" className="block text-sm font-medium text-foreground mb-1.5">Blood Sugar (mg/dL)</label>
            <Input id="sugar" name="sugar" type="number" placeholder="e.g., 100" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="systolic" className="block text-sm font-medium text-foreground mb-1.5">Systolic (mmHg)</label>
              <Input id="systolic" name="systolic" type="number" placeholder="e.g., 120" />
            </div>
            <div>
              <label htmlFor="diastolic" className="block text-sm font-medium text-foreground mb-1.5">Diastolic (mmHg)</label>
              <Input id="diastolic" name="diastolic" type="number" placeholder="e.g., 80" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">You only need to fill in the vitals you want to track today.</p>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setIsVitalsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Vitals</Button>
          </div>
        </form>
      </Modal>

      {/* Profile Modal */}
      <Modal title="Update Your Profile" isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)}>
        <form className="space-y-4" onSubmit={handleSaveProfile}>
          <p className="text-sm text-muted-foreground">Help us personalise your experience with some basic information.</p>
          {[
            { id: 'age', label: 'Age', placeholder: 'e.g., 35', type: 'number', defaultValue: profile?.age || '' },
            { id: 'waterGoal', label: 'Daily Water Goal (glasses)', placeholder: 'e.g., 8', type: 'number', defaultValue: String(profile?.waterGoal || 8) },
            { id: 'bloodType', label: 'Blood Type', placeholder: 'e.g., O+', type: 'text', defaultValue: profile?.bloodType || '' },
            { id: 'targetBloodSugar', label: 'Target Blood Sugar Range (mg/dL)', placeholder: 'e.g., 80-130', type: 'text', defaultValue: profile?.targetBloodSugar || '' },
            { id: 'conditions', label: 'Chronic Conditions', placeholder: 'e.g., Type 2 Diabetes', type: 'text', defaultValue: profile?.conditions || '' },
            { id: 'goals', label: 'Health Goals', placeholder: 'e.g., Lower blood pressure', type: 'text', defaultValue: profile?.goals || '' },
            { id: 'contactName', label: 'Emergency Contact Name', placeholder: 'e.g., Jane Doe', type: 'text', defaultValue: profile?.emergencyContactName || '' },
            { id: 'contactPhone', label: 'Emergency Contact Phone', placeholder: 'e.g., 555-123-4567', type: 'tel', defaultValue: profile?.emergencyContactPhone || '' },
          ].map(f => (
            <div key={f.id}>
              <label htmlFor={f.id} className="block text-sm font-medium text-foreground mb-1.5">{f.label}</label>
              <Input id={f.id} name={f.id} type={f.type} placeholder={f.placeholder} defaultValue={f.defaultValue} />
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={handleSkipProfileUpdate}>Skip for Now</Button>
            <Button type="submit">Save Profile</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Dashboard;
