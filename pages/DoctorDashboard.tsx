import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/ui/ThemeToggle';
import Logo from '../components/icons/Logo';
import { Users, BarChart3 as LayoutDashboard, CalendarDays, TestTube2 as FlaskConical, Search, ArrowLeft, Plus } from '../components/icons/Icons';
import PatientProfile from '@/components/doctor/PatientProfile.tsx';
import { getDoctorPatients, addPatientToDoctor, getProfile, saveProfile, getDoctorAppointmentsToday, getDoctorTasks, addDoctorTask, updateTaskStatus, updateAppointment } from '../services/dataSupabase';
import { Profile, Appointment, DoctorTask, IntakeForm } from '../types';
import { getIntakeFormByAppointment } from '../services/dataSupabase';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const DoctorDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'labs' | 'appointments'>('overview');
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

  useEffect(() => {
    if (user) {
      loadDoctorProfile();
      loadPatients();
      loadQueueAndTasks();
    }
  }, [user]);

  const loadQueueAndTasks = async () => {
    if (!user) return;
    try {
      const apps = await getDoctorAppointmentsToday(user.uid, user.displayName || 'Unknown');
      setTodayAppointments(apps);
      const docTasks = await getDoctorTasks(user.uid);
      setTasks(docTasks);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDoctorProfile = async () => {
    if (!user) return;
    try {
      const profile = await getProfile(user.uid);
      setDoctorProfile(profile);
      if (!profile.specialty) {
        setIsSpecialtyModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to load doctor profile', err);
    }
  };

  const loadPatients = async () => {
    setLoading(true);
    try {
      if (user) {
         // getDoctorPatients returns Profile[], but we need IDs too, so we'll just assume id is there 
         // since dataSupabase `select('*')` fetches it. We cast to include id.
         const data = await getDoctorPatients(user.uid) as (Profile & { id: string })[];
         setPatients(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientId.trim() || !user) return;
    try {
      await addPatientToDoctor(user.uid, newPatientId.trim());
      setNewPatientId('');
      setIsAddingPatient(false);
      loadPatients();
    } catch (err) {
      alert("Failed to add patient. Please check the ID and try again.");
    }
  };

  const handleSaveSpecialty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !doctorProfile) return;
    const formData = new FormData(e.currentTarget);
    const specialty = formData.get('specialty') as string;
    if (specialty) {
      const updatedProfile = { ...doctorProfile, specialty };
      await saveProfile(user.uid, updatedProfile);
      setDoctorProfile(updatedProfile);
      setIsSpecialtyModalOpen(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTaskText.trim()) return;
    await addDoctorTask(user.uid, newTaskText.trim());
    setNewTaskText('');
    loadQueueAndTasks();
  };

  const handleToggleTask = async (task: DoctorTask) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTaskStatus(task.id, newStatus);
    loadQueueAndTasks();
  };

  const handleUpdateAppStatus = async (app: Appointment, status: 'Scheduled' | 'Waiting' | 'In-Progress' | 'Completed') => {
    if (!user) return;
    const patientUserId = app.patientId || user.uid;
    await updateAppointment(patientUserId, { ...app, status });
    loadQueueAndTasks();
  };

  const handleViewIntake = async (app: Appointment) => {
    try {
      const intake = await getIntakeFormByAppointment(app.id);
      if (intake) {
        setSelectedIntake(intake as IntakeForm);
        setIsIntakeModalOpen(true);
      } else {
        // Fallback to patient profile if no intake form
        const matched = patients.find(p => p.id === app.patientId);
        if (matched) setSelectedPatient(matched);
        else alert("No intake form submitted yet, and patient profile not directly linked.");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching intake form.");
    }
  };

  const filteredPatients = patients.filter(p => {
    const name = (p as any).name || 'Unknown Patient';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-card/50 backdrop-blur-xl h-screen sticky top-0 z-40">
        <div className="p-4 flex items-center gap-2.5 mb-8">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm">
            <Logo className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold font-heading text-slate-800 dark:text-foreground tracking-tight">DocuMedic</span>
          <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-full">Pro</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <NavItem active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setSelectedPatient(null); }} icon={<LayoutDashboard size={18} />} label="Overview" />
          <NavItem active={activeTab === 'patients'} onClick={() => { setActiveTab('patients'); setSelectedPatient(null); }} icon={<Users size={18} />} label="Patients" />
          <NavItem active={activeTab === 'labs'} onClick={() => { setActiveTab('labs'); setSelectedPatient(null); }} icon={<FlaskConical size={18} />} label="Lab Insights" />
          <NavItem active={activeTab === 'appointments'} onClick={() => { setActiveTab('appointments'); setSelectedPatient(null); }} icon={<CalendarDays size={18} />} label="Appointments" />
        </nav>

        <div className="p-4 border-t border-border/50 mt-auto">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'Dr')}&background=6366f1&color=fff&bold=true`}
              alt="Doctor"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-200 dark:ring-violet-900"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">Dr. {user?.displayName || 'Smith'}</p>
              <p className="text-xs text-muted-foreground truncate">{doctorProfile?.specialty || 'General Practice'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <ThemeToggle />
            <button onClick={handleSignOut} className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium">Sign Out</button>
          </div>
        </div>
      </aside>

      {/* Mobile Header (simplified) */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-2">
           <Logo className="h-6 w-6 text-primary" />
           <span className="font-bold">DocuMedic Pro</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto relative z-10 p-4 md:p-8">
        {selectedPatient ? (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <button onClick={() => setSelectedPatient(null)} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
               <ArrowLeft size={16} /> Back to {activeTab === 'patients' ? 'Patients' : 'Overview'}
             </button>
             <PatientProfile patient={selectedPatient} patientId={selectedPatient.id} />
           </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header section based on active tab */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold font-heading text-foreground capitalize">{activeTab}</h1>
                <p className="text-muted-foreground mt-1">
                  {activeTab === 'overview' && "Here's what's happening today."}
                  {activeTab === 'patients' && "Manage and search your patient directory."}
                  {activeTab === 'labs' && "Recent abnormal lab results requiring attention."}
                  {activeTab === 'appointments' && "Your upcoming schedule."}
                </p>
              </div>
              
              {activeTab === 'patients' && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="Search patients..." 
                      className="w-full pl-9 h-10 border-slate-200 dark:border-border bg-white dark:bg-card focus:border-primary/50 focus:ring-2 focus:ring-primary/15 rounded-xl shadow-sm transition-all text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => setIsAddingPatient(!isAddingPatient)}
                    className="flex items-center justify-center h-10 px-4 bg-primary text-primary-foreground font-medium text-sm rounded-xl hover:bg-primary/90 transition-colors shadow-sm gap-2"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              )}
            </div>

            {/* Add Patient form */}
            {isAddingPatient && activeTab === 'patients' && (
              <form onSubmit={handleAddPatient} className="p-4 mb-4 rounded-xl bg-card border border-border/50 shadow-sm flex items-end gap-4">
                 <div className="flex-1">
                   <label className="block text-xs font-bold text-muted-foreground mb-1">Patient UUID</label>
                   <input 
                     type="text" 
                     required
                     value={newPatientId}
                     onChange={e => setNewPatientId(e.target.value)}
                     className="w-full h-10 px-3 border border-border rounded-lg bg-background text-sm"
                     placeholder="Enter patient's exact UUID" 
                   />
                 </div>
                 <button type="submit" className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm">
                   Link Patient
                 </button>
              </form>
            )}

            {/* Content based on active tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Daily Queue Section */}
                <div>
                   <div className="flex items-center justify-between mb-4">
                     <h2 className="text-xl font-bold font-heading">Today's Queue</h2>
                     <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">{todayAppointments.length} Appointments</span>
                   </div>
                   
                   {todayAppointments.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-card">
                        No appointments scheduled for today.
                      </div>
                   ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {todayAppointments.map(app => (
                           <div key={app.id} className="p-4 rounded-xl border border-border/50 bg-card shadow-sm flex flex-col">
                              <div className="flex justify-between items-start mb-2">
                                 <div>
                                    <p className="font-semibold text-lg">{app.specialty} Visit</p>
                                    <p className="text-sm text-muted-foreground">{new Date(app.dateTime).toLocaleTimeString([], {timeStyle: 'short'})}</p>
                                 </div>
                                 <span className={`text-xs font-bold px-2 py-1 rounded-md ${app.status === 'Waiting' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : app.status === 'In-Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : app.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                                    {app.status || 'Scheduled'}
                                 </span>
                              </div>
                              {app.notes && <p className="text-sm text-muted-foreground mb-4 line-clamp-2 italic">"{app.notes}"</p>}
                              
                              <div className="mt-auto pt-4 border-t border-border/50 flex gap-2">
                                 {app.status === 'Waiting' && (
                                    <Button size="sm" onClick={() => handleUpdateAppStatus(app, 'In-Progress')} className="flex-1">Start Visit</Button>
                                 )}
                                 {app.status === 'In-Progress' && (
                                    <Button size="sm" onClick={() => handleUpdateAppStatus(app, 'Completed')} variant="secondary" className="flex-1">Complete</Button>
                                 )}
                                 {app.status === 'Scheduled' && (
                                    <Button size="sm" onClick={() => handleUpdateAppStatus(app, 'Waiting')} variant="outline" className="flex-1">Mark Arrived</Button>
                                 )}
                                 <Button size="sm" variant="ghost" onClick={() => handleViewIntake(app)}>View File</Button>
                              </div>
                           </div>
                        ))}
                      </div>
                   )}
                </div>

                {/* Task Management Section */}
                <div>
                   <h2 className="text-xl font-bold font-heading mb-4">Task Management</h2>
                   <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
                      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-border/50 p-4 bg-secondary/30">
                        <h3 className="font-semibold text-sm mb-3">Add New Task</h3>
                        <form onSubmit={handleAddTask} className="space-y-3">
                           <textarea 
                             value={newTaskText}
                             onChange={e => setNewTaskText(e.target.value)}
                             placeholder="e.g., Follow up on John's bloodwork..."
                             className="w-full h-24 p-3 text-sm rounded-lg border border-border bg-background resize-none focus:ring-2 focus:ring-primary/20 outline-none"
                             required
                           />
                           <Button type="submit" className="w-full">Add Task</Button>
                        </form>
                      </div>
                      <div className="w-full md:w-2/3 p-4 max-h-[300px] overflow-y-auto">
                        <h3 className="font-semibold text-sm mb-3">Your Tasks</h3>
                        {tasks.length === 0 ? (
                           <p className="text-sm text-muted-foreground italic">No tasks pending.</p>
                        ) : (
                           <ul className="space-y-2">
                             {tasks.map(task => (
                               <li key={task.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-secondary/20 transition-colors">
                                 <input 
                                   type="checkbox" 
                                   checked={task.status === 'done'}
                                   onChange={() => handleToggleTask(task)}
                                   className="mt-1 rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                                 />
                                 <span className={`text-sm ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                   {task.description}
                                 </span>
                               </li>
                             ))}
                           </ul>
                        )}
                      </div>
                   </div>
                </div>

              </div>
            )}

            {activeTab === 'patients' && (
              <>
                {loading ? (
                  <div className="py-12 text-center text-muted-foreground">Loading patient directory...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPatients.map(patient => (
                      <PatientCard key={patient.id} patient={patient} onClick={() => setSelectedPatient(patient)} />
                    ))}
                    {filteredPatients.length === 0 && !loading && (
                      <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed rounded-xl">
                        {searchQuery ? `No patients found matching "${searchQuery}"` : "You have no patients. Click 'Add' to link a patient using their UUID."}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === 'labs' && (
              <div className="space-y-4">
                <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">
                  No abnormal lab results to review at this time.
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="space-y-4">
                 <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">
                  Your schedule is clear.
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Modal title="Welcome, Doctor!" isOpen={isSpecialtyModalOpen} onClose={() => setIsSpecialtyModalOpen(false)}>
        <p className="text-sm text-muted-foreground mb-4">Please enter your medical specialty so we can personalize your profile.</p>
        <form onSubmit={handleSaveSpecialty} className="space-y-4">
          <div>
            <label htmlFor="specialty" className="block text-sm font-medium text-foreground mb-1">Specialty</label>
            <Input id="specialty" name="specialty" placeholder="e.g., Cardiologist, Pediatrician, General Practice" required />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit">Save Specialty</Button>
          </div>
        </form>
      </Modal>

      <Modal title="Patient Intake Form" isOpen={isIntakeModalOpen} onClose={() => setIsIntakeModalOpen(false)}>
        {selectedIntake ? (
          <div className="space-y-4 text-sm">
            <div className="p-4 bg-secondary rounded-lg">
              <h4 className="font-semibold text-foreground mb-1">Reason for Visit / Symptoms</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">{selectedIntake.symptomsDescription}</p>
            </div>
            {selectedIntake.fileUrl && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Attached File</h4>
                {selectedIntake.fileUrl.match(/\.(jpeg|jpg|gif|png)$/) != null || selectedIntake.fileUrl.startsWith('http') ? (
                  <img src={selectedIntake.fileUrl} alt="Patient Upload" className="w-full max-h-[300px] object-cover rounded-lg border border-border" />
                ) : (
                  <a href={selectedIntake.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-2">
                    <FlaskConical size={16} /> View Document
                  </a>
                )}
              </div>
            )}
            <div className="flex justify-end pt-4">
               <Button onClick={() => setIsIntakeModalOpen(false)}>Close</Button>
            </div>
          </div>
        ) : (
          <p>Loading intake form...</p>
        )}
      </Modal>
    </div>
  );
};

/* Helper Components */
const NavItem = ({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
      active 
        ? 'bg-primary/10 text-primary' 
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`}
  >
    {icon}
    {label}
  </button>
);

const PatientCard: React.FC<{ patient: Profile & { id: string }, onClick: () => void }> = ({ patient, onClick }) => {
  const patientName = patient.name || 'Unknown Patient';
  return (
    <button 
      onClick={onClick}
      className="flex flex-col text-left p-5 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start w-full mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg ring-2 ring-background shadow-sm">
            {patientName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{patientName}</h3>
            <p className="text-xs text-muted-foreground">{patient.age ? `${patient.age}y` : 'Age N/A'} · {(patient as any).gender || 'Gender N/A'}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 w-full">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Conditions:</span>
          <span className="font-medium text-foreground truncate max-w-[120px]">{patient.conditions || 'None'}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">ID:</span>
          <span className="font-mono text-muted-foreground">{patient.id.substring(0, 8)}...</span>
        </div>
      </div>
    </button>
  );
};

export default DoctorDashboard;
