import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/ui/ThemeToggle';
import Logo from '../components/icons/Logo';
import {
  Users, BarChart3 as LayoutDashboard, CalendarDays,
  TestTube2 as FlaskConical, Search, ArrowLeft, Plus,
  Send, Brain, FileDown, MessageSquare, Sparkles, X,
  Loader2, ScanLine, Copy, CheckCheck, ShieldAlert, AlertTriangle,
  Info, CheckCircle2, Upload, BrainCircuit
} from '../components/icons/Icons';
import PatientProfile from '@/components/doctor/PatientProfile.tsx';
import {
  getDoctorPatients, addPatientToDoctor, getProfile, saveProfile,
  getDoctorAppointmentsToday, getDoctorTasks, addDoctorTask,
  updateTaskStatus, updateAppointment, getIntakeFormByAppointment,
  getMedications, getVitals, getSymptoms, getRecords
} from '../services/dataSupabase';
import {
  ocrMedicalDocument, chatWithPatientData,
  generatePreAppointmentBriefing, generateEMRExport, getCDSSAnalysis
} from '../services/aiService';
import { Profile, Appointment, DoctorTask, IntakeForm } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ChatMessage { role: 'doctor' | 'ai'; text: string; }
interface OcrResult {
  documentType?: string; patientName?: string; doctorName?: string;
  date?: string; medications?: any[]; labResults?: any[];
  rawText?: string; summary?: string; error?: string;
}
interface CDSSAlert {
  type: 'drug_interaction' | 'lab_suggestion' | 'diagnosis_flag' | 'guideline_alert' | 'follow_up';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  recommendation: string;
  evidence?: string;
}
interface CDSSResult { alerts: CDSSAlert[]; summary: string; }

type TabType = 'overview' | 'patients' | 'labs' | 'appointments' | 'cdss';

// ─── Lightweight Markdown renderer ───────────────────────────────────────────
const MD: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => (
  <div className={`space-y-1 text-sm leading-relaxed ${className}`}>
    {text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h3 key={i} className="font-bold text-base mt-3 mb-1">{line.slice(3)}</h3>;
      if (line.startsWith('### ')) return <h4 key={i} className="font-semibold mt-2">{line.slice(4)}</h4>;
      if (line.startsWith('- ') || line.startsWith('* ')) return <p key={i} className="flex gap-2"><span className="text-primary mt-0.5 flex-shrink-0">•</span><span>{line.slice(2)}</span></p>;
      if (line.startsWith('---')) return <hr key={i} className="border-border my-2" />;
      if (line.startsWith('*') && line.endsWith('*')) return <p key={i} className="text-xs text-muted-foreground italic">{line.slice(1, -1)}</p>;
      if (!line.trim()) return <div key={i} className="h-1" />;
      return <p key={i} className="text-foreground/80">{line}</p>;
    })}
  </div>
);

// ─── CDSS Severity Config ─────────────────────────────────────────────────────
const severityConfig = {
  critical: { icon: ShieldAlert, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800/40', badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
  warning:  { icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800/40', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
  info:     { icon: Info, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800/40', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
};
const typeLabels: Record<string, string> = {
  drug_interaction: '💊 Drug Interaction',
  lab_suggestion: '🧪 Lab Suggestion',
  diagnosis_flag: '🩺 Diagnosis Flag',
  guideline_alert: '📋 Guideline Alert',
  follow_up: '📅 Follow-up',
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const DoctorDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedPatient, setSelectedPatient] = useState<(Profile & { id: string }) | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<(Profile & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newPatientId, setNewPatientId] = useState('');
  const [doctorProfile, setDoctorProfile] = useState<Profile | null>(null);
  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [tasks, setTasks] = useState<DoctorTask[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedIntake, setSelectedIntake] = useState<IntakeForm | null>(null);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);

  // Feature 3 – OCR
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrDragging, setOcrDragging] = useState(false);
  const ocrInputRef = useRef<HTMLInputElement>(null);

  // Feature 4 – Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatPatientContext, setChatPatientContext] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Feature 5 – Briefing
  const [briefingContent, setBriefingContent] = useState('');
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [briefingAppointment, setBriefingAppointment] = useState<Appointment | null>(null);
  const [copied, setCopied] = useState(false);

  // Feature 6 – EMR
  const [emrLoading, setEmrLoading] = useState(false);
  const [emrFormat, setEmrFormat] = useState<'FHIR' | 'CSV'>('FHIR');

  // CDSS
  const [cdssResult, setCdssResult] = useState<CDSSResult | null>(null);
  const [cdssLoading, setCdssLoading] = useState(false);
  const [cdssPatient, setCdssPatient] = useState<(Profile & { id: string }) | null>(null);

  // ─── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user) { loadDoctorProfile(); loadPatients(); loadQueueAndTasks(); }
  }, [user]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const loadQueueAndTasks = async () => {
    if (!user) return;
    const apps = await getDoctorAppointmentsToday(user.uid, user.displayName || 'Unknown').catch(() => []);
    setTodayAppointments(apps);
    const docTasks = await getDoctorTasks(user.uid).catch(() => []);
    setTasks(docTasks);
  };

  const loadDoctorProfile = async () => {
    if (!user) return;
    const profile = await getProfile(user.uid).catch(() => ({} as Profile));
    setDoctorProfile(profile);
    if (!profile.specialty) setIsSpecialtyModalOpen(true);
  };

  const loadPatients = async () => {
    setLoading(true);
    if (user) {
      const data = await getDoctorPatients(user.uid).catch(() => []) as (Profile & { id: string })[];
      setPatients(data);
    }
    setLoading(false);
  };

  /** Fetch all patient Supabase data and build AI context string */
  const buildContext = async (patientId: string, patientProfile: Profile): Promise<string> => {
    const [meds, vitals, symptoms, records] = await Promise.all([
      getMedications(patientId).catch(() => []),
      getVitals(patientId).catch(() => []),
      getSymptoms(patientId).catch(() => []),
      getRecords(patientId).catch(() => []),
    ]);
    return JSON.stringify({
      profile: patientProfile,
      medications: meds,
      vitals: vitals.slice(-20),
      symptoms: symptoms.slice(-20),
      records: records.slice(-10).map(r => ({ name: r.name, type: r.type, date: r.date, summary: r.analysis?.summary })),
    }, null, 2);
  };

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientId.trim() || !user) return;
    await addPatientToDoctor(user.uid, newPatientId.trim()).catch(() => alert('Failed to add patient.'));
    setNewPatientId(''); setIsAddingPatient(false); loadPatients();
  };

  const handleSaveSpecialty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !doctorProfile) return;
    const specialty = new FormData(e.currentTarget).get('specialty') as string;
    if (specialty) {
      const up = { ...doctorProfile, specialty };
      await saveProfile(user.uid, up);
      setDoctorProfile(up); setIsSpecialtyModalOpen(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTaskText.trim()) return;
    await addDoctorTask(user.uid, newTaskText.trim());
    setNewTaskText(''); loadQueueAndTasks();
  };

  const handleToggleTask = async (task: DoctorTask) => {
    await updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done');
    loadQueueAndTasks();
  };

  const handleUpdateAppStatus = async (app: Appointment, status: 'Scheduled' | 'Waiting' | 'In-Progress' | 'Completed') => {
    if (!user) return;
    await updateAppointment(app.patientId || user.uid, { ...app, status });
    loadQueueAndTasks();
  };

  const handleViewIntake = async (app: Appointment) => {
    const intake = await getIntakeFormByAppointment(app.id).catch(() => null);
    if (intake) { setSelectedIntake(intake as IntakeForm); setIsIntakeModalOpen(true); }
    else {
      const matched = patients.find(p => p.id === app.patientId);
      if (matched) setSelectedPatient(matched);
      else alert('No intake form submitted yet.');
    }
  };

  // Feature 3 – OCR
  const handleOcrDrop = (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('Please upload an image (JPG, PNG, WEBP) or PDF.'); return;
    }
    setOcrFile(file); setOcrResult(null);
  };

  const handleRunOcr = async () => {
    if (!ocrFile) return;
    setOcrLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      const mime = ocrFile.type === 'application/pdf' ? 'image/png' : ocrFile.type;
      const raw = await ocrMedicalDocument(base64, mime);
      try { setOcrResult(JSON.parse(raw)); } catch { setOcrResult({ summary: raw, rawText: raw }); }
      setOcrLoading(false);
    };
    reader.readAsDataURL(ocrFile);
  };

  // Feature 4 – Chat
  const openChat = async (patient: Profile & { id: string }) => {
    setSelectedPatient(patient); setChatMessages([]); setChatInput('');
    setIsChatOpen(true);
    const ctx = await buildContext(patient.id, patient);
    setChatPatientContext(ctx);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMessage = { role: 'doctor', text: chatInput.trim() };
    const history = [...chatMessages, userMsg];
    setChatMessages(history); setChatInput(''); setChatLoading(true);
    const answer = await chatWithPatientData(userMsg.text, chatPatientContext, chatMessages);
    setChatMessages([...history, { role: 'ai', text: answer }]);
    setChatLoading(false);
  };

  // Feature 5 – Briefing
  const handleOpenBriefing = async (app: Appointment) => {
    setBriefingAppointment(app); setBriefingContent('');
    setIsBriefingOpen(true); setBriefingLoading(true);
    const patient = patients.find(p => p.id === app.patientId);
    const ctx = patient ? await buildContext(app.patientId!, patient) : JSON.stringify({ appointment: app });
    setBriefingContent(await generatePreAppointmentBriefing(ctx, app.notes || undefined));
    setBriefingLoading(false);
  };

  const handleCopyBriefing = () => {
    navigator.clipboard.writeText(briefingContent);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  // Feature 6 – EMR
  const handleEMRExport = async () => {
    if (!selectedPatient) return;
    setEmrLoading(true);
    const ctx = await buildContext(selectedPatient.id, selectedPatient);
    const result = await generateEMRExport(ctx, emrFormat);
    const blob = new Blob([result], { type: emrFormat === 'FHIR' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(selectedPatient as any).name || 'patient'}_${Date.now()}.${emrFormat === 'FHIR' ? 'json' : 'csv'}`;
    a.click(); URL.revokeObjectURL(url);
    setEmrLoading(false);
  };

  // CDSS
  const handleRunCDSS = async (patient: Profile & { id: string }) => {
    setCdssPatient(patient); setCdssResult(null); setCdssLoading(true);
    if (activeTab !== 'cdss') setActiveTab('cdss');
    const ctx = await buildContext(patient.id, patient);
    const raw = await getCDSSAnalysis(ctx);
    try { setCdssResult(JSON.parse(raw)); } catch { setCdssResult({ alerts: [], summary: raw }); }
    setCdssLoading(false);
  };

  const navTo = (tab: TabType) => {
    setActiveTab(tab); setSelectedPatient(null); setIsChatOpen(false);
  };

  const filteredPatients = patients.filter(p =>
    ((p as any).name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Sidebar / Bottom-nav items ──────────────────────────────────────────────
  const navItems: { tab: TabType; icon: React.ReactNode; label: string; badge?: string }[] = [
    { tab: 'overview',      icon: <LayoutDashboard size={18} />, label: 'Overview' },
    { tab: 'patients',      icon: <Users size={18} />,           label: 'Patients' },
    { tab: 'labs',          icon: <ScanLine size={18} />,        label: 'OCR Scanner', badge: 'AI' },
    { tab: 'appointments',  icon: <CalendarDays size={18} />,    label: 'Schedule' },
    { tab: 'cdss',          icon: <BrainCircuit size={18} />,    label: 'CDSS', badge: 'AI' },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-card/50 backdrop-blur-xl h-screen sticky top-0 z-40 flex-shrink-0">
        <div className="p-4 flex items-center gap-2.5 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm">
            <Logo className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold font-heading tracking-tight">DocuMedic</span>
          <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-full">Pro</span>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ tab, icon, label, badge }) => {
            const props = { active: activeTab === tab, onClick: () => navTo(tab), icon, label, badge };
            return <NavItem key={tab} {...props} />;
          })}
        </nav>
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'Dr')}&background=6366f1&color=fff&bold=true`}
              alt="Doctor" className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-200 dark:ring-violet-900 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">Dr. {user?.displayName || 'Smith'}</p>
              <p className="text-xs text-muted-foreground truncate">{doctorProfile?.specialty || 'General Practice'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <ThemeToggle />
            <button onClick={handleSignOut} className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium">Sign Out</button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Top Header ── */}
      <div className="md:hidden flex-shrink-0">
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-white/90 dark:bg-background/90 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <Logo className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm">DocuMedic Pro</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={handleSignOut} className="text-xs text-muted-foreground hover:text-destructive font-medium">Sign Out</button>
          </div>
        </header>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 md:h-screen">
        <div className="p-4 md:p-8 max-w-5xl mx-auto">

          {/* ── Patient Chat View ── */}
          {selectedPatient && isChatOpen ? (
            <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] animate-in fade-in duration-300">
              <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                <button onClick={() => setIsChatOpen(false)} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  <ArrowLeft size={16} /> Back
                </button>
                <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200/60 dark:border-indigo-800/40">
                  <Brain size={13} className="text-indigo-600" />
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 truncate max-w-[140px]">
                    {(selectedPatient as any).name || 'Patient'} Records
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-8">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                      <MessageSquare size={24} className="text-indigo-500" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Ask anything about this patient</p>
                      <p className="text-sm text-muted-foreground">e.g. "What medications is the patient on?" or "Show latest vitals"</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['Active medications?', 'Latest vitals?', 'Any abnormal symptoms?', 'Recent lab records'].map(q => (
                        <button key={q} onClick={() => setChatInput(q)}
                          className="text-xs px-3 py-2 bg-secondary hover:bg-secondary/70 rounded-lg border border-border/50 transition-colors">{q}</button>
                      ))}
                    </div>
                    {!chatPatientContext && <p className="text-xs text-muted-foreground animate-pulse">Loading patient records...</p>}
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${msg.role === 'doctor' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border border-border/50 shadow-sm rounded-tl-sm'}`}>
                      {msg.role === 'ai' ? <MD text={msg.text} /> : msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="px-4 py-3 rounded-2xl bg-card border border-border/50 shadow-sm flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 size={13} className="animate-spin text-primary" /> Searching records...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="flex gap-2 pt-3 border-t border-border/50 flex-shrink-0">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                  placeholder="Ask about this patient's records..."
                  className="flex-1 h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <button onClick={handleSendChat} disabled={chatLoading || !chatInput.trim()}
                  className="h-11 w-11 flex items-center justify-center bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors flex-shrink-0">
                  <Send size={16} />
                </button>
              </div>
            </div>

          ) : selectedPatient ? (
            /* ── Patient Profile View ── */
            <div className="animate-in fade-in duration-300">
              <button onClick={() => setSelectedPatient(null)} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary mb-5 transition-colors">
                <ArrowLeft size={16} /> Back
              </button>

              {/* AI Action Bar */}
              <div className="flex flex-wrap gap-2 mb-5 p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/30">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300 w-full sm:w-auto">
                  <Sparkles size={14} /> AI Tools
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:ml-auto">
                  <button onClick={() => openChat(selectedPatient)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm">
                    <MessageSquare size={13} /> Chat Records
                  </button>
                  <button onClick={() => handleRunCDSS(selectedPatient)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm">
                    <BrainCircuit size={13} /> Run CDSS
                  </button>
                  <div className="flex items-center gap-1 p-1 bg-white dark:bg-card rounded-xl border border-border/60 shadow-sm">
                    <select value={emrFormat} onChange={e => setEmrFormat(e.target.value as 'FHIR' | 'CSV')}
                      className="text-xs font-medium bg-transparent px-1.5 outline-none cursor-pointer">
                      <option value="FHIR">FHIR JSON</option>
                      <option value="CSV">CSV</option>
                    </select>
                    <button onClick={handleEMRExport} disabled={emrLoading}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-all">
                      {emrLoading ? <Loader2 size={12} className="animate-spin" /> : <FileDown size={12} />} Export
                    </button>
                  </div>
                </div>
              </div>

              <PatientProfile patient={selectedPatient} patientId={selectedPatient.id} />
            </div>

          ) : (
            /* ── Tab Views ── */
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold font-heading capitalize">
                    {activeTab === 'labs' ? 'AI OCR Scanner' : activeTab === 'cdss' ? 'CDSS' : activeTab}
                  </h1>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {activeTab === 'overview' && "Here's what's happening today."}
                    {activeTab === 'patients' && "Manage and search your patient directory."}
                    {activeTab === 'labs' && "Upload handwritten prescriptions or lab reports."}
                    {activeTab === 'appointments' && "Your today's schedule."}
                    {activeTab === 'cdss' && "AI-driven clinical decision support for your patients."}
                  </p>
                </div>
                {activeTab === 'patients' && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-56">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="text" placeholder="Search patients..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 h-10 border border-border bg-card rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <button onClick={() => setIsAddingPatient(!isAddingPatient)}
                      className="h-10 px-4 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-1.5 flex-shrink-0">
                      <Plus size={15} /> Add
                    </button>
                  </div>
                )}
              </div>

              {/* Add Patient Form */}
              {isAddingPatient && activeTab === 'patients' && (
                <form onSubmit={handleAddPatient} className="p-4 rounded-xl bg-card border border-border/50 shadow-sm flex flex-col sm:flex-row items-end gap-3">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-muted-foreground mb-1">Patient UUID</label>
                    <input type="text" required value={newPatientId} onChange={e => setNewPatientId(e.target.value)}
                      className="w-full h-10 px-3 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Enter patient's exact UUID" />
                  </div>
                  <button type="submit" className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm w-full sm:w-auto">Link Patient</button>
                </form>
              )}

              {/* ── OVERVIEW TAB ── */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-bold font-heading">Today's Queue</h2>
                      <span className="text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">{todayAppointments.length} total</span>
                    </div>
                    {todayAppointments.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-card text-sm">No appointments scheduled for today.</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {todayAppointments.map(app => (
                          <AppointmentCard key={app.id} app={app}
                            onUpdateStatus={handleUpdateAppStatus}
                            onViewFile={handleViewIntake}
                            onAIBriefing={handleOpenBriefing} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-bold font-heading mb-3">Task Management</h2>
                    <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
                      <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-border/50 p-4 bg-secondary/20">
                        <h3 className="font-semibold text-sm mb-2">Add Task</h3>
                        <form onSubmit={handleAddTask} className="space-y-2">
                          <textarea value={newTaskText} onChange={e => setNewTaskText(e.target.value)}
                            placeholder="e.g. Follow up on John's bloodwork..."
                            className="w-full h-20 p-2.5 text-sm rounded-lg border border-border bg-background resize-none focus:ring-2 focus:ring-primary/20 outline-none" required />
                          <Button type="submit" className="w-full" size="sm">Add Task</Button>
                        </form>
                      </div>
                      <div className="md:w-2/3 p-4 max-h-[260px] overflow-y-auto">
                        <h3 className="font-semibold text-sm mb-2">Your Tasks</h3>
                        {tasks.length === 0 ? <p className="text-sm text-muted-foreground italic">No tasks pending.</p> : (
                          <ul className="space-y-2">
                            {tasks.map(task => (
                              <li key={task.id} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border/50 hover:bg-secondary/20 transition-colors">
                                <input type="checkbox" checked={task.status === 'done'} onChange={() => handleToggleTask(task)}
                                  className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 flex-shrink-0" />
                                <span className={`text-sm ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>{task.description}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PATIENTS TAB ── */}
              {activeTab === 'patients' && (
                loading ? (
                  <div className="py-12 text-center text-muted-foreground">Loading patient directory...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredPatients.map(patient => (
                      <PatientCard key={patient.id} patient={patient}
                        onClick={() => setSelectedPatient(patient)}
                        onChat={() => openChat(patient)}
                        onCDSS={() => handleRunCDSS(patient)} />
                    ))}
                    {filteredPatients.length === 0 && (
                      <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed rounded-xl text-sm">
                        {searchQuery ? `No patients found matching "${searchQuery}"` : "No patients linked yet. Click 'Add' to link a patient."}
                      </div>
                    )}
                  </div>
                )
              )}

              {/* ── OCR TAB ── */}
              {activeTab === 'labs' && (
                <div className="space-y-5">
                  <div onDragOver={e => { e.preventDefault(); setOcrDragging(true); }}
                    onDragLeave={() => setOcrDragging(false)}
                    onDrop={e => { e.preventDefault(); setOcrDragging(false); if (e.dataTransfer.files[0]) handleOcrDrop(e.dataTransfer.files[0]); }}
                    onClick={() => ocrInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-3 p-8 md:p-12 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${ocrDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50 hover:bg-secondary/20'}`}>
                    <input ref={ocrInputRef} type="file" accept="image/*,application/pdf" className="hidden"
                      onChange={e => { if (e.target.files?.[0]) handleOcrDrop(e.target.files[0]); }} />
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30 flex items-center justify-center">
                      <ScanLine size={24} className="text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold mb-1">Drop a medical document here</p>
                      <p className="text-sm text-muted-foreground">Handwritten prescriptions, lab reports, clinical notes (JPG, PNG, WEBP)</p>
                    </div>
                    {ocrFile && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-xl">
                        <FlaskConical size={13} className="text-primary" />
                        <span className="text-sm font-medium text-primary truncate max-w-[200px]">{ocrFile.name}</span>
                      </div>
                    )}
                  </div>

                  {ocrFile && !ocrResult && (
                    <div className="flex justify-center">
                      <button onClick={handleRunOcr} disabled={ocrLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold rounded-xl shadow-md transition-all">
                        {ocrLoading ? <><Loader2 size={15} className="animate-spin" /> Reading...</> : <><Brain size={15} /> Run AI OCR</>}
                      </button>
                    </div>
                  )}

                  {ocrResult && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      {ocrResult.error ? (
                        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">{ocrResult.error}</div>
                      ) : (
                        <>
                          <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-2xl">
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">{ocrResult.documentType || 'Document'}</span>
                            <p className="text-sm text-foreground mt-2">{ocrResult.summary}</p>
                            {(ocrResult.patientName || ocrResult.date) && (
                              <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                                {ocrResult.patientName && <span><strong>Patient:</strong> {ocrResult.patientName}</span>}
                                {ocrResult.doctorName && <span><strong>Doctor:</strong> {ocrResult.doctorName}</span>}
                                {ocrResult.date && <span><strong>Date:</strong> {ocrResult.date}</span>}
                              </div>
                            )}
                          </div>

                          {ocrResult.medications && ocrResult.medications.length > 0 && (
                            <div className="p-4 bg-card border border-border/50 rounded-2xl shadow-sm">
                              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><FlaskConical size={14} className="text-blue-500" /> Medications</h3>
                              <div className="space-y-2">
                                {ocrResult.medications.map((med: any, i: number) => (
                                  <div key={i} className="flex flex-wrap gap-2 p-2.5 bg-secondary/40 rounded-lg text-sm">
                                    <span className="font-semibold">{med.name}</span>
                                    {med.dosage && <span className="text-muted-foreground">· {med.dosage}</span>}
                                    {med.frequency && <span className="text-muted-foreground">· {med.frequency}</span>}
                                    {med.duration && <span className="text-muted-foreground">· {med.duration}</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {ocrResult.labResults && ocrResult.labResults.length > 0 && (
                            <div className="p-4 bg-card border border-border/50 rounded-2xl shadow-sm overflow-x-auto">
                              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><FlaskConical size={14} className="text-purple-500" /> Lab Results</h3>
                              <table className="w-full text-sm min-w-[400px]">
                                <thead><tr className="border-b border-border/50 text-xs text-muted-foreground uppercase">
                                  <th className="text-left py-2 pr-3 font-medium">Test</th>
                                  <th className="text-left py-2 pr-3 font-medium">Value</th>
                                  <th className="text-left py-2 pr-3 font-medium">Range</th>
                                  <th className="text-left py-2 font-medium">Status</th>
                                </tr></thead>
                                <tbody>{ocrResult.labResults.map((lab: any, i: number) => (
                                  <tr key={i} className="border-b border-border/30 last:border-0">
                                    <td className="py-2 pr-3 font-medium">{lab.testName}</td>
                                    <td className="py-2 pr-3">{lab.value} {lab.unit}</td>
                                    <td className="py-2 pr-3 text-muted-foreground">{lab.referenceRange || '—'}</td>
                                    <td className="py-2">
                                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${lab.status === 'High' || lab.status === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : lab.status === 'Low' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>{lab.status}</span>
                                    </td>
                                  </tr>
                                ))}</tbody>
                              </table>
                            </div>
                          )}

                          {ocrResult.rawText && (
                            <details className="p-4 bg-secondary/20 rounded-xl border border-border/40 text-sm">
                              <summary className="font-medium cursor-pointer text-muted-foreground hover:text-foreground">View Raw Text</summary>
                              <pre className="mt-3 whitespace-pre-wrap font-mono text-xs overflow-x-auto">{ocrResult.rawText}</pre>
                            </details>
                          )}

                          <button onClick={() => { setOcrFile(null); setOcrResult(null); }}
                            className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
                            <X size={13} /> Clear and scan another
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── APPOINTMENTS TAB ── */}
              {activeTab === 'appointments' && (
                todayAppointments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">Your schedule is clear today.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {todayAppointments.map(app => (
                      <AppointmentCard key={app.id} app={app}
                        onUpdateStatus={handleUpdateAppStatus}
                        onViewFile={handleViewIntake}
                        onAIBriefing={handleOpenBriefing} />
                    ))}
                  </div>
                )
              )}

              {/* ── CDSS TAB ── */}
              {activeTab === 'cdss' && (
                <div className="space-y-5">
                  {!cdssPatient && !cdssLoading && !cdssResult && (
                    <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
                        <BrainCircuit size={36} className="text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="max-w-md">
                        <h2 className="text-xl font-bold mb-2">Clinical Decision Support</h2>
                        <p className="text-muted-foreground text-sm">Select a patient from the Patients tab and click "Run CDSS" to analyze their longitudinal health record for drug interactions, missing investigations, guideline alerts, and more.</p>
                      </div>
                      <button onClick={() => navTo('patients')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm">
                        <Users size={15} /> Go to Patients
                      </button>
                    </div>
                  )}

                  {cdssLoading && (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-violet-200 dark:border-violet-800" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-violet-600 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BrainCircuit size={20} className="text-violet-600" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">Analyzing Patient Records</p>
                        <p className="text-sm text-muted-foreground">Checking drug interactions, guidelines, and flagging concerns...</p>
                      </div>
                    </div>
                  )}

                  {cdssResult && cdssPatient && !cdssLoading && (
                    <div className="space-y-5 animate-in fade-in duration-300">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200/50 dark:border-violet-800/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center font-bold text-violet-700 dark:text-violet-300 flex-shrink-0">
                            {((cdssPatient as any).name || 'P').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold">{(cdssPatient as any).name || 'Patient'}</p>
                            <p className="text-xs text-muted-foreground">{cdssResult.alerts.length} alerts generated</p>
                          </div>
                        </div>
                        <button onClick={() => handleRunCDSS(cdssPatient)} disabled={cdssLoading}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-violet-600 dark:text-violet-400 bg-white dark:bg-card border border-violet-200 dark:border-violet-800/40 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                          <BrainCircuit size={13} /> Re-run Analysis
                        </button>
                      </div>

                      {/* Summary */}
                      <div className="p-4 bg-card border border-border/50 rounded-xl shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Clinical Impression</p>
                        <p className="text-sm text-foreground">{cdssResult.summary}</p>
                      </div>

                      {/* Alerts */}
                      {cdssResult.alerts.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-10 text-center border border-dashed rounded-2xl">
                          <CheckCircle2 size={36} className="text-emerald-500" />
                          <div>
                            <p className="font-semibold text-emerald-700 dark:text-emerald-400">No significant alerts</p>
                            <p className="text-sm text-muted-foreground">The patient's health record looks good based on available data.</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Critical first */}
                          {(['critical', 'warning', 'info'] as const).map(sev => {
                            const sevAlerts = cdssResult.alerts.filter(a => a.severity === sev);
                            if (sevAlerts.length === 0) return null;
                            const cfg = severityConfig[sev];
                            const SevIcon = cfg.icon;
                            return (
                              <div key={sev}>
                                <div className="flex items-center gap-2 mb-2">
                                  <SevIcon size={15} className={cfg.color} />
                                  <span className={`text-xs font-bold uppercase tracking-widest ${cfg.color}`}>
                                    {sev === 'critical' ? 'Critical Alerts' : sev === 'warning' ? 'Warnings' : 'Informational'}
                                  </span>
                                </div>
                                <div className="space-y-3">
                                  {sevAlerts.map((alert, i) => (
                                    <div key={i} className={`p-4 rounded-2xl border ${cfg.bg} ${cfg.border}`}>
                                      <div className="flex flex-wrap items-start gap-2 mb-2">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{typeLabels[alert.type] || alert.type}</span>
                                        <h4 className="font-bold text-sm text-foreground flex-1">{alert.title}</h4>
                                      </div>
                                      <p className="text-sm text-foreground/80 mb-2">{alert.description}</p>
                                      <div className="p-2.5 bg-white/60 dark:bg-black/20 rounded-lg border border-white/40 dark:border-white/10">
                                        <p className="text-xs font-bold text-foreground/60 mb-0.5">Recommendation</p>
                                        <p className="text-sm font-medium text-foreground">{alert.recommendation}</p>
                                      </div>
                                      {alert.evidence && (
                                        <p className="text-xs text-muted-foreground mt-2 italic">{alert.evidence}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-background/95 backdrop-blur-md border-t border-border/50">
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.map(n => (
            <button key={n.tab} onClick={() => navTo(n.tab)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all relative ${activeTab === n.tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <div className={`p-1.5 rounded-xl transition-all ${activeTab === n.tab ? 'bg-primary/10' : ''}`}>
                {n.icon}
              </div>
              <span className="text-[10px] font-medium leading-none">{n.label}</span>
              {n.badge && <span className="absolute -top-0.5 -right-0.5 text-[8px] font-bold text-violet-500 bg-violet-100 dark:bg-violet-900/40 px-1 py-0.5 rounded-full leading-none">{n.badge}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* ── AI Briefing Modal ── */}
      <Modal title="" isOpen={isBriefingOpen} onClose={() => setIsBriefingOpen(false)}>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
                <Brain size={15} className="text-violet-600" />
              </div>
              <div>
                <p className="font-bold text-sm">AI Pre-Appointment Briefing</p>
                <p className="text-xs text-muted-foreground">{briefingAppointment?.specialty} · {briefingAppointment?.dateTime ? new Date(briefingAppointment.dateTime).toLocaleTimeString([], { timeStyle: 'short' }) : ''}</p>
              </div>
            </div>
            {!briefingLoading && briefingContent && (
              <button onClick={handleCopyBriefing} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-secondary flex-shrink-0">
                {copied ? <><CheckCheck size={12} className="text-emerald-500" /> Copied</> : <><Copy size={12} /> Copy</>}
              </button>
            )}
          </div>
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            {briefingLoading ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <Loader2 size={22} className="animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Generating briefing from patient records...</p>
              </div>
            ) : (
              <div className="p-4 bg-secondary/30 rounded-xl border border-border/40">
                <MD text={briefingContent} />
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Specialty Modal */}
      <Modal title="Welcome, Doctor!" isOpen={isSpecialtyModalOpen} onClose={() => setIsSpecialtyModalOpen(false)}>
        <p className="text-sm text-muted-foreground mb-4">Please enter your specialty to personalize your profile.</p>
        <form onSubmit={handleSaveSpecialty} className="space-y-4">
          <div>
            <label htmlFor="specialty" className="block text-sm font-medium mb-1">Specialty</label>
            <Input id="specialty" name="specialty" placeholder="e.g., Cardiologist, Pediatrician" required />
          </div>
          <div className="flex justify-end"><Button type="submit">Save Specialty</Button></div>
        </form>
      </Modal>

      {/* Intake Form Modal */}
      <Modal title="Patient Intake Form" isOpen={isIntakeModalOpen} onClose={() => setIsIntakeModalOpen(false)}>
        {selectedIntake ? (
          <div className="space-y-4 text-sm">
            <div className="p-4 bg-secondary rounded-lg">
              <h4 className="font-semibold mb-1">Reason for Visit / Symptoms</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">{selectedIntake.symptomsDescription}</p>
            </div>
            {selectedIntake.fileUrl && (
              <div>
                <h4 className="font-semibold mb-2">Attached File</h4>
                {selectedIntake.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                  <img src={selectedIntake.fileUrl} alt="Patient Upload" className="w-full max-h-[280px] object-cover rounded-lg border border-border" />
                ) : (
                  <a href={selectedIntake.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-2">
                    <FlaskConical size={15} /> View Document
                  </a>
                )}
              </div>
            )}
            <div className="flex justify-end pt-2"><Button onClick={() => setIsIntakeModalOpen(false)}>Close</Button></div>
          </div>
        ) : <p className="text-sm text-muted-foreground">Loading...</p>}
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function NavItem({ active, icon, label, onClick, badge }: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: string;
  key?: React.Key;
}) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium relative ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {badge && <span className="text-[9px] font-bold uppercase tracking-widest text-violet-500 bg-violet-500/10 px-1.5 py-0.5 rounded-full">{badge}</span>}
    </button>
  );
}


const PatientCard: React.FC<{ patient: Profile & { id: string }; onClick: () => void; onChat: () => void; onCDSS: () => void; }> = ({ patient, onClick, onChat, onCDSS }) => {
  const name = (patient as any).name || 'Unknown Patient';
  return (
    <div className="flex flex-col p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-md transition-all">
      <button onClick={onClick} className="flex items-center gap-3 text-left mb-3">
        <div className="w-11 h-11 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg ring-2 ring-background shadow-sm flex-shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold truncate hover:text-primary transition-colors">{name}</h3>
          <p className="text-xs text-muted-foreground">{patient.age ? `${patient.age}y` : 'Age N/A'} · {(patient as any).gender || 'N/A'}</p>
        </div>
      </button>
      <div className="text-xs text-muted-foreground flex items-center justify-between mb-3">
        <span>Conditions: <span className="text-foreground font-medium">{patient.conditions || 'None'}</span></span>
        <span className="font-mono">{patient.id.substring(0, 6)}…</span>
      </div>
      <div className="flex gap-2 mt-auto">
        <button onClick={onChat} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg border border-indigo-200/50 dark:border-indigo-800/30 transition-colors">
          <MessageSquare size={11} /> Chat
        </button>
        <button onClick={onCDSS} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/40 rounded-lg border border-violet-200/50 dark:border-violet-800/30 transition-colors">
          <BrainCircuit size={11} /> CDSS
        </button>
      </div>
    </div>
  );
};

const AppointmentCard: React.FC<{
  app: Appointment;
  onUpdateStatus: (app: Appointment, s: any) => void;
  onViewFile: (app: Appointment) => void;
  onAIBriefing: (app: Appointment) => void;
}> = ({ app, onUpdateStatus, onViewFile, onAIBriefing }) => (
  <div className="p-4 rounded-xl border border-border/50 bg-card shadow-sm flex flex-col gap-3">
    <div className="flex justify-between items-start">
      <div>
        <p className="font-semibold">{app.specialty} Visit</p>
        <p className="text-sm text-muted-foreground">{new Date(app.dateTime).toLocaleTimeString([], { timeStyle: 'short' })}</p>
      </div>
      <span className={`text-xs font-bold px-2 py-1 rounded-md flex-shrink-0 ${app.status === 'Waiting' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : app.status === 'In-Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : app.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
        {app.status || 'Scheduled'}
      </span>
    </div>
    {app.notes && <p className="text-sm text-muted-foreground line-clamp-2 italic">"{app.notes}"</p>}
    <button onClick={() => onAIBriefing(app)}
      className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/40 rounded-lg border border-violet-200/50 dark:border-violet-800/30 transition-colors">
      <Brain size={12} /> AI Pre-Appointment Briefing
    </button>
    <div className="flex gap-2 pt-1 border-t border-border/50">
      {app.status === 'Waiting' && <Button size="sm" onClick={() => onUpdateStatus(app, 'In-Progress')} className="flex-1">Start Visit</Button>}
      {app.status === 'In-Progress' && <Button size="sm" onClick={() => onUpdateStatus(app, 'Completed')} variant="secondary" className="flex-1">Complete</Button>}
      {app.status === 'Scheduled' && <Button size="sm" onClick={() => onUpdateStatus(app, 'Waiting')} variant="outline" className="flex-1">Mark Arrived</Button>}
      <Button size="sm" variant="ghost" onClick={() => onViewFile(app)}>View File</Button>
    </div>
  </div>
);

export default DoctorDashboard;
