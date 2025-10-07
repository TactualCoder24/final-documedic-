import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Pill, FileText, BrainCircuit, ClipboardList, Search, Bell, Share2, Lightbulb, Activity, GlassWater, Utensils, Plus } from '../components/icons/Icons';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { Vital, MedicalRecord, Medication, Reminder, Profile, Symptom, FoodLog } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { getVitals, getRecords, getMedications, getReminders, getProfile, saveProfile, addVital, getSymptoms, getFoodLogs, getWaterIntake, updateWaterIntake } from '../services/data';

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
  const [vitals, setVitals] = React.useState<Vital[]>([]);
  const [records, setRecords] = React.useState<MedicalRecord[]>([]);
  const [medications, setMedications] = React.useState<Medication[]>([]);
  const [reminders, setReminders] = React.useState<Reminder[]>([]);
  const [symptoms, setSymptoms] = React.useState<Symptom[]>([]);
  const [foodLogs, setFoodLogs] = React.useState<FoodLog[]>([]);
  const [waterIntake, setWaterIntake] = React.useState(0);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  
  const [isVitalsModalOpen, setIsVitalsModalOpen] = React.useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const todayStr = getTodayDateString();

  const refreshData = React.useCallback(() => {
    if (user) {
      setVitals(getVitals(user.uid));
      setRecords(getRecords(user.uid));
      setMedications(getMedications(user.uid));
      setReminders(getReminders(user.uid));
      setSymptoms(getSymptoms(user.uid));
      setFoodLogs(getFoodLogs(user.uid));
      setWaterIntake(getWaterIntake(user.uid, todayStr));
      const userProfile = getProfile(user.uid);
      setProfile(userProfile);
      
      if (!userProfile.age && !userProfile.conditions && !userProfile.goals) {
        setIsProfileModalOpen(true);
      }
    }
  }, [user, todayStr]);

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleUpdateVitals = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const sugar = Number(formData.get('sugar'));

    if (sugar > 0) {
      addVital(user.uid, { sugar });
      setVitals(getVitals(user.uid));
      setIsVitalsModalOpen(false);
      e.currentTarget.reset();
    }
  };

  const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
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
    saveProfile(user.uid, newProfile);
    setProfile(newProfile);
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
  
  const handleWaterChange = (amount: number) => {
    if (!user) return;
    updateWaterIntake(user.uid, todayStr, amount);
    setWaterIntake(getWaterIntake(user.uid, todayStr));
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
  const recentRecord = records[0];
  const recentSymptom = symptoms[0];
  const recentMeal = foodLogs[0];
  const waterGoal = profile?.waterGoal || 8;

  const DashboardContent = () => (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-1 md:col-span-2 lg:col-span-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg">
                        <ClipboardList className="h-6 w-6"/>
                    </div>
                    <div>
                        <CardTitle>Log Today's Vitals</CardTitle>
                        <CardDescription className="mt-1">Keep your health record up to date for the best insights.</CardDescription>
                    </div>
                </div>
                <Button onClick={() => setIsVitalsModalOpen(true)} className="w-full sm:w-auto shadow-lg shadow-primary/20">Update Vitals</Button>
            </CardHeader>
        </Card>

        <Card className="hover:border-primary/80 transition-colors hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Intake</CardTitle>
            <GlassWater className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
             <div className="text-4xl font-bold my-2">{waterIntake}<span className="text-xl text-muted-foreground">/{waterGoal}</span></div>
             <p className="text-xs text-muted-foreground mb-3">glasses</p>
             <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleWaterChange(-1)} disabled={waterIntake <= 0}>-1</Button>
                <Button size="sm" onClick={() => handleWaterChange(1)}>+1</Button>
             </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/80 transition-colors hover:shadow-lg">
          <Link to="/medications">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Medication</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {nextMedication ? (
                <>
                  <div className="text-2xl font-bold">{nextMedication.name}</div>
                  <p className="text-xs text-muted-foreground">{nextMedication.dosage}</p>
                </>
              ) : (
                 <>
                  <div className="text-2xl font-bold">All Taken!</div>
                  <p className="text-xs text-muted-foreground">Great job staying on track.</p>
                </>
              )}
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:border-primary/80 transition-colors hover:shadow-lg">
         <Link to="/food-journal">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Meal</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {recentMeal ? (
                <>
                  <div className="text-2xl font-bold truncate">{recentMeal.mealType}</div>
                  <p className="text-xs text-muted-foreground truncate">{recentMeal.description}</p>
                </>
              ) : (
                 <>
                  <div className="text-2xl font-bold">No Meals</div>
                  <p className="text-xs text-muted-foreground">Log a meal to get started.</p>
                </>
              )}
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary/80 transition-colors hover:shadow-lg">
         <Link to="/symptoms">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Symptom</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {recentSymptom ? (
                <>
                  <div className="text-2xl font-bold truncate">{recentSymptom.name}</div>
                  <p className="text-xs text-muted-foreground">Severity: {recentSymptom.severity}/10</p>
                </>
              ) : (
                 <>
                  <div className="text-2xl font-bold">No Symptoms</div>
                  <p className="text-xs text-muted-foreground">Log a symptom to start.</p>
                </>
              )}
            </CardContent>
          </Link>
        </Card>

        <Card className="col-span-1 md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Blood Sugar Trend</CardTitle>
            <CardDescription>
                {vitals.length > 0 ? "Here is your recent blood sugar history." : "Log your vitals to see your trend."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vitals.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={vitals.slice(-30).map(v => ({...v, date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }))}>
                        <defs>
                            <linearGradient id="colorSugar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
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
                        <Area type="monotone" dataKey="sugar" name="Blood Sugar" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSugar)" strokeWidth={2} activeDot={{ r: 8 }}/>
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="text-center py-10 text-muted-foreground">No vitals logged yet.</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="hover:border-primary/80 transition-colors hover:shadow-lg lg:col-span-2">
          <Link to="/records">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Record</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               {recentRecord ? (
                <>
                  <div className="text-2xl font-bold truncate">{recentRecord.name}</div>
                  <p className="text-xs text-muted-foreground">Uploaded on {recentRecord.date}</p>
                </>
              ) : (
                 <>
                  <div className="text-2xl font-bold">No Records</div>
                  <p className="text-xs text-muted-foreground">Upload your first document.</p>
                </>
              )}
            </CardContent>
          </Link>
        </Card>

        <Card className="lg:col-span-2">
          <Link to="/summary">
            <CardHeader>
              <CardTitle>AI Health Summary</CardTitle>
               <BrainCircuit className="h-8 w-8 text-primary absolute top-6 right-6 opacity-20" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Get a personalized, easy-to-read summary of your health status based on your latest data.</p>
               <Button variant="link" className="px-0">Generate Summary &rarr;</Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary/80 transition-colors hover:shadow-lg lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">My Health Goals</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsProfileModalOpen(true)}>Edit Goals</Button>
          </CardHeader>
          <CardContent>
            {profile?.goals ? (
              <p className="text-foreground whitespace-pre-wrap">{profile.goals}</p>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">You haven't set any health goals yet.</p>
                <Button variant="link" onClick={() => setIsProfileModalOpen(true)}>Set your goals</Button>
              </div>
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
            <h1 className="text-3xl font-bold font-heading">
            Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-muted-foreground text-lg mt-1">Here's a quick overview of your health profile.</p>
        </div>
        <Button onClick={handleShareProfile} variant="outline" className="w-full sm:w-auto">
            <Share2 className="mr-2 h-4 w-4" />
            Share Emergency Profile
        </Button>
      </div>
      
      <div className="relative">
          <label htmlFor="dashboard-search" className="sr-only">
            Search records, medications, reminders
          </label>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
              id="dashboard-search"
              placeholder="Search records, medications, reminders..."
              className="pl-10 text-base"
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
                                        {/* FIX: Cast `items` to `any[]` to resolve TypeScript error `Property 'map' does not exist on type 'unknown'`. This is necessary because `Object.entries` does not preserve strong value types. */}
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
      ) : (
          <DashboardContent />
      )}
    </div>
    <Modal title="Log Today's Vitals" isOpen={isVitalsModalOpen} onClose={() => setIsVitalsModalOpen(false)}>
         <form className="space-y-4" onSubmit={handleUpdateVitals}>
             <div>
              <label htmlFor="sugar" className="block text-sm font-medium text-foreground mb-1">Blood Sugar (mg/dL)</label>
              <Input id="sugar" name="sugar" type="number" placeholder="e.g., 100" required />
            </div>
            
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
               <Button type="button" variant="ghost" onClick={() => setIsProfileModalOpen(false)}>Cancel</Button>
               <Button type="submit">Save Profile</Button>
            </div>
         </form>
      </Modal>
    </>
  );
};

export default Dashboard;
