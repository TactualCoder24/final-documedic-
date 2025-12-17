
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Pill, FileText, BrainCircuit, ClipboardList, Search, Bell, Share2, Lightbulb, Activity, GlassWater, Utensils, Plus, HeartPulse, Stethoscope, MapPin, CalendarDays, Settings } from '../components/icons/Icons';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { Vital, MedicalRecord, Medication, Reminder, Profile, Symptom, TestOrProcedure } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { getVitals, getRecords, getMedications, getReminders, getProfile, saveProfile, addVital, getSymptoms, getWaterIntake, updateWaterIntake, getTestsAndProcedures } from '../services/dataSupabase';

const categoryInfo = {
  record: { title: 'Medical Records', icon: FileText, color: 'text-blue-500' },
  medication: { title: 'Medications', icon: Pill, color: 'text-green-500' },
  reminder: { title: 'Reminders', icon: Bell, color: 'text-yellow-500' },
};

const getTodayDateString = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vitals, setVitals] = React.useState<Vital[]>([]);
  const [records, setRecords] = React.useState<MedicalRecord[]>([]);
  const [medications, setMedications] = React.useState<Medication[]>([]);
  const [reminders, setReminders] = React.useState<Reminder[]>([]);
  const [symptoms, setSymptoms] = React.useState<Symptom[]>([]);
  const [tests, setTests] = React.useState<TestOrProcedure[]>([]);
  const [waterIntake, setWaterIntake] = React.useState(0);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const [isVitalsModalOpen, setIsVitalsModalOpen] = React.useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const todayStr = getTodayDateString();

  const refreshData = React.useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const [vitalsData, recordsData, medsData, remindersData, symptomsData, waterIntakeData, profileData, testsData] = await Promise.all([
        getVitals(user.uid),
        getRecords(user.uid),
        getMedications(user.uid),
        getReminders(user.uid),
        getSymptoms(user.uid),
        getWaterIntake(user.uid, todayStr),
        getProfile(user.uid),
        getTestsAndProcedures(user.uid)
      ]);

      setVitals(vitalsData);
      setRecords(recordsData);
      setMedications(medsData);
      setReminders(remindersData);
      setSymptoms(symptomsData);
      setTests(testsData);
      setWaterIntake(waterIntakeData);
      setProfile(profileData);

      const profileUpdateSkipped = sessionStorage.getItem('profileUpdateSkipped');
      if (!profileUpdateSkipped && profileData && !profileData.age && !profileData.conditions && !profileData.goals) {
        setIsProfileModalOpen(true);
      }
      setIsLoading(false);
    }
  }, [user, todayStr]);

  React.useEffect(() => {
    refreshData();
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
      alert("Please enter both systolic and diastolic values for blood pressure.");
      return;
    }

    if (Object.keys(newVitals).length > 0) {
      await addVital(user.uid, newVitals);
      setVitals(await getVitals(user.uid));
      setIsVitalsModalOpen(false);
      e.currentTarget.reset();
    } else {
      alert("Please enter at least one valid vital measurement.");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
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
  };

  const handleSkipProfileUpdate = () => {
    sessionStorage.setItem('profileUpdateSkipped', 'true');
    setIsProfileModalOpen(false);
  };

  const handleShareProfile = () => {
    if (!user) return;
    const url = `${window.location.origin}${window.location.pathname}#/emergency/${user.uid}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Emergency profile link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const handleWaterChange = async (amount: number) => {
    if (!user) return;
    await updateWaterIntake(user.uid, todayStr, amount);
    setWaterIntake(await getWaterIntake(user.uid, todayStr));
  };

  const searchableData = [
    ...records.map(item => ({ ...item, type: 'record', name: item.name, path: '/records' })),
    ...medications.map(item => ({ ...item, type: 'medication', name: item.name, path: '/medications' })),
    ...reminders.map(item => ({ ...item, type: 'reminder', name: item.title, path: '/reminders' })),
  ];

  const filteredResults = searchQuery
    ? searchableData.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  const resultsByType = filteredResults.reduce((acc, item) => {
    const key = item.type as keyof typeof categoryInfo;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<keyof typeof categoryInfo, any[]>);

  const nextMedication = medications.find(m => !m.takenToday);
  const waterGoal = profile?.waterGoal || 8;
  const latestBPressure = [...vitals].reverse().find(v => v.systolic && v.diastolic);
  const bpData = vitals.filter(v => v.systolic && v.diastolic);

  const DashboardContent = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card variant="gradient" className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button variant="outline" className="flex-col h-28 hover:border-primary hover:bg-primary/5 transition-all group" onClick={() => navigate('/appointments')}>
            <CalendarDays className="h-8 w-8 mb-2 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Schedule</span>
          </Button>
          <Button variant="outline" className="flex-col h-28 hover:border-accent hover:bg-accent/5 transition-all group" onClick={() => navigate('/find-care')}>
            <MapPin className="h-8 w-8 mb-2 text-accent group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Find Care</span>
          </Button>
          <Button variant="outline" className="flex-col h-28 hover:border-success hover:bg-success/5 transition-all group" onClick={() => setIsVitalsModalOpen(true)}>
            <ClipboardList className="h-8 w-8 mb-2 text-success group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Log Vitals</span>
          </Button>
        </CardContent>
      </Card>

      <Card variant="premium" hover className="bg-gradient-to-br from-card to-accent/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Water Intake</CardTitle>
          <div className="p-2 rounded-lg bg-accent/10">
            <GlassWater className="h-5 w-5 text-accent" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <div className="text-5xl font-bold my-3 text-gradient">{waterIntake}<span className="text-2xl text-muted-foreground">/{waterGoal}</span></div>
          <p className="text-xs text-muted-foreground mb-4 font-medium">glasses today</p>
          <div className="flex gap-3">
            <Button size="sm" variant="outline" onClick={() => handleWaterChange(-1)} disabled={waterIntake <= 0} className="hover:border-destructive hover:text-destructive">-1</Button>
            <Button size="sm" variant="gradient" onClick={() => handleWaterChange(1)}>+1</Button>
          </div>
        </CardContent>
      </Card>

      <Card variant="premium" hover className="bg-gradient-to-br from-card to-destructive/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
          <div className="p-2 rounded-lg bg-destructive/10">
            <HeartPulse className="h-5 w-5 text-destructive" />
          </div>
        </CardHeader>
        <CardContent>
          {latestBPressure ? (
            <>
              <div className="text-3xl font-bold text-gradient">{latestBPressure.systolic}/{latestBPressure.diastolic}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">mmHg</p>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-muted-foreground">N/A</div>
              <p className="text-xs text-muted-foreground mt-1">Log your BP to see it here.</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card variant="premium" hover className="bg-gradient-to-br from-card to-success/10">
        <Link to="/medications" className="block">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Medication</CardTitle>
            <div className="p-2 rounded-lg bg-success/10">
              <Pill className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            {nextMedication ? (
              <>
                <div className="text-2xl font-bold text-gradient">{nextMedication.name}</div>
                <p className="text-sm text-muted-foreground mt-1 font-medium">{nextMedication.dosage}</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-success">All Taken!</div>
                <p className="text-xs text-muted-foreground mt-1">Great job staying on track.</p>
              </>
            )}
          </CardContent>
        </Link>
      </Card>

      {tests.length > 0 && (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Tests & Procedures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tests.map(test => (
              <div key={test.id} className="flex items-start gap-4 p-3 bg-secondary/50 rounded-lg">
                <Stethoscope className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{test.name}</p>
                  <p className="text-sm text-muted-foreground">{new Date(test.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {test.location}</p>
                  <p className="text-xs text-muted-foreground mt-1">Instructions: {test.instructions}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Blood Sugar Trend</CardTitle>
          <CardDescription>
            {vitals.some(v => v.sugar) ? "Here is your recent blood sugar history." : "Log your vitals to see your trend."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vitals.some(v => v.sugar) ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={vitals.slice(-30).map(v => ({ ...v, date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }))}>
                <defs>
                  <linearGradient id="colorSugar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={['dataMin - 10', 'dataMax + 10']} fontSize={12} unit=" mg/dL" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="sugar" name="Blood Sugar" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSugar)" strokeWidth={2} activeDot={{ r: 8 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-muted-foreground">No blood sugar data logged yet.</div>
          )}
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Blood Pressure Trend</CardTitle>
          <CardDescription>
            {bpData.length > 0 ? "Your recent blood pressure history." : "Log your blood pressure to see your trend."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bpData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={bpData.slice(-30).map(v => ({ ...v, date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }))}>
                <defs>
                  <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={['dataMin - 10', 'dataMax + 10']} fontSize={12} unit=" mmHg" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="systolic" name="Systolic" stroke="#ef4444" fillOpacity={1} fill="url(#colorSys)" strokeWidth={2} activeDot={{ r: 6 }} />
                <Area type="monotone" dataKey="diastolic" name="Diastolic" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDia)" strokeWidth={2} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-muted-foreground">No blood pressure data logged yet.</div>
          )}
        </CardContent>
      </Card>

    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold font-heading">
              Welcome back, <span className="text-gradient">{user?.displayName?.split(' ')[0] || 'User'}</span>!
            </h1>
            <p className="text-muted-foreground text-lg mt-2">Here's a quick overview of your health profile.</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-start sm:justify-end">
            <Button onClick={() => setIsProfileModalOpen(true)} variant="outline" className="w-full sm:w-auto hover:border-primary group">
              <Settings className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              Edit Profile
            </Button>
            <Button onClick={handleShareProfile} variant="gradient" className="w-full sm:w-auto">
              <Share2 className="mr-2 h-4 w-4" />
              Share Emergency Profile
            </Button>
          </div>
        </div>


        <div className="relative group">
          <label htmlFor="dashboard-search" className="sr-only">
            Search records, medications, reminders
          </label>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            id="dashboard-search"
            placeholder="Search records, medications, reminders..."
            className="pl-12 text-base h-12 border-2 focus:border-primary shadow-sm"
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
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                          <info.icon className={`h-4 w-4 ${info.color}`} />
                          {info.title}
                        </h3>
                        <div className="space-y-2">
                          {(items as any[]).map(item => (
                            <Link to={item.path} key={item.id} className="block p-3 rounded-md hover:bg-secondary">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {type === 'record' && `${item.type} - ${item.date}`}
                                {type === 'medication' && `${item.dosage}, ${item.frequency}`}
                                {type === 'reminder' && new Date(item.time).toLocaleString()}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No results found.</p>
              )}
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <DashboardContent />
        )}
      </div>
      <Modal title="Log Today's Vitals" isOpen={isVitalsModalOpen} onClose={() => setIsVitalsModalOpen(false)}>
        <form className="space-y-4" onSubmit={handleUpdateVitals}>
          <div>
            <label htmlFor="sugar" className="block text-sm font-medium text-foreground mb-1">Blood Sugar (mg/dL)</label>
            <Input id="sugar" name="sugar" type="number" placeholder="e.g., 100" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="systolic" className="block text-sm font-medium text-foreground mb-1">Systolic (mmHg)</label>
              <Input id="systolic" name="systolic" type="number" placeholder="e.g., 120" />
            </div>
            <div>
              <label htmlFor="diastolic" className="block text-sm font-medium text-foreground mb-1">Diastolic (mmHg)</label>
              <Input id="diastolic" name="diastolic" type="number" placeholder="e.g., 80" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground pt-1">You only need to fill in the vitals you want to track today.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsVitalsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Vitals</Button>
          </div>
        </form>
      </Modal>

      <Modal title="Update Your Profile" isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)}>
        <form className="space-y-4" onSubmit={handleSaveProfile}>
          <p className="text-sm text-muted-foreground">To help us personalize your experience, please provide some basic information. This will be used for features like your Emergency Profile and AI Tips.</p>
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-foreground mb-1">Age</label>
            <Input id="age" name="age" type="number" placeholder="e.g., 35" defaultValue={profile?.age || ''} required />
          </div>
          <div>
            <label htmlFor="waterGoal" className="block text-sm font-medium text-foreground mb-1">Daily Water Goal (glasses)</label>
            <Input id="waterGoal" name="waterGoal" type="number" placeholder="e.g., 8" defaultValue={profile?.waterGoal || 8} />
          </div>
          <div>
            <label htmlFor="bloodType" className="block text-sm font-medium text-foreground mb-1">Blood Type</label>
            <Input id="bloodType" name="bloodType" type="text" placeholder="e.g., O+" defaultValue={profile?.bloodType || ''} />
          </div>
          <div>
            <label htmlFor="targetBloodSugar" className="block text-sm font-medium text-foreground mb-1">Target Blood Sugar Range (mg/dL)</label>
            <Input id="targetBloodSugar" name="targetBloodSugar" type="text" placeholder="e.g., 80-130" defaultValue={profile?.targetBloodSugar || ''} />
          </div>
          <div>
            <label htmlFor="conditions" className="block text-sm font-medium text-foreground mb-1">Chronic Conditions (if any)</label>
            <Input id="conditions" name="conditions" type="text" placeholder="e.g., Type 2 Diabetes, Asthma" defaultValue={profile?.conditions || ''} />
          </div>
          <div>
            <label htmlFor="goals" className="block text-sm font-medium text-foreground mb-1">Health Goals</label>
            <Input id="goals" name="goals" type="text" placeholder="e.g., Lower blood pressure, manage blood sugar levels" defaultValue={profile?.goals || ''} />
          </div>
          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-foreground mb-1">Emergency Contact Name</label>
            <Input id="contactName" name="contactName" type="text" placeholder="e.g., Jane Doe" defaultValue={profile?.emergencyContactName || ''} />
          </div>
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-foreground mb-1">Emergency Contact Phone</label>
            <Input id="contactPhone" name="contactPhone" type="tel" placeholder="e.g., 555-123-4567" defaultValue={profile?.emergencyContactPhone || ''} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={handleSkipProfileUpdate}>Skip for Now</Button>
            <Button type="submit">Save Profile</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Dashboard;
