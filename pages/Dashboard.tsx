import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Pill, FileText, BrainCircuit, ClipboardList, Search, Bell } from '../components/icons/Icons';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { Vital, MedicalRecord, Medication, Reminder } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const mockVitals: Vital[] = [
  { date: 'Jun 1', sugar: 95 }, { date: 'Jun 2', sugar: 105 }, { date: 'Jun 3', sugar: 98 },
  { date: 'Jun 4', sugar: 110 }, { date: 'Jun 5', sugar: 102 }, { date: 'Jun 6', sugar: 108 },
  { date: 'Jun 7', sugar: 104 },
];

const mockRecords: MedicalRecord[] = [
  { id: 'rec1', name: 'Annual Blood Panel', type: 'Lab Report', date: '2023-10-15', fileUrl: '#' },
  { id: 'rec2', name: 'MRI Scan - Left Knee', type: 'Imaging', date: '2023-09-22', fileUrl: '#' },
];

const mockMedications: Medication[] = [
  { id: 'med2', name: 'Metformin', dosage: '500mg', frequency: 'Twice a day', takenToday: true },
  { id: 'med3', name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime', takenToday: false },
];

const mockReminders: Reminder[] = [
  { id: 'rem1', title: 'Cardiologist Appointment', time: 'Tomorrow at 10:00 AM', description: 'Follow-up with Dr. Smith.' },
  { id: 'rem2', title: 'Refill Lisinopril', time: 'In 3 days', description: 'Pick up prescription from pharmacy.' },
];

const searchableData = [
  ...mockRecords.map(item => ({ ...item, type: 'record', name: item.name, path: '/records' })),
  ...mockMedications.map(item => ({ ...item, type: 'medication', name: item.name, path: '/medications' })),
  ...mockReminders.map(item => ({ ...item, type: 'reminder', name: item.title, path: '/reminders' })),
];

const categoryInfo = {
  record: { title: 'Medical Records', icon: FileText, color: 'text-blue-500' },
  medication: { title: 'Medications', icon: Pill, color: 'text-green-500' },
  reminder: { title: 'Reminders', icon: Bell, color: 'text-yellow-500' },
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [vitals, setVitals] = useState<Vital[]>(mockVitals);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleUpdateVitals = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newVital: Vital = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sugar: Number(formData.get('sugar')),
    };

    if (newVital.sugar > 0) {
      if (vitals.some(v => v.date === newVital.date)) {
        setVitals(vitals.map(v => v.date === newVital.date ? newVital : v));
      } else {
        setVitals([...vitals, newVital]);
      }
      setIsVitalsModalOpen(false);
    }
  };
  
  const filteredResults = searchQuery
    ? searchableData.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const resultsByType = filteredResults.reduce((acc, item) => {
    const key = item.type as keyof typeof categoryInfo;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<keyof typeof categoryInfo, any[]>);

  const DashboardContent = () => (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
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
          <Link to="/medications">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Medication</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Metformin</div>
              <p className="text-xs text-muted-foreground">Due in 2 hours</p>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:border-primary/80 transition-colors hover:shadow-lg">
          <Link to="/records">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Record</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Blood Test Results</div>
              <p className="text-xs text-muted-foreground">Uploaded yesterday</p>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:border-primary/80 transition-colors hover:shadow-lg">
         <Link to="/summary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Health Summary</CardTitle>
              <BrainCircuit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Ready to View</div>
              <p className="text-xs text-muted-foreground">Get your personalized summary</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Blood Sugar Trend</CardTitle>
            <CardDescription>Your 7-day trend shows stable levels. Keep up the consistent monitoring!</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={vitals.slice(-30)}>
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
          </CardContent>
        </Card>
      </div>
  );

  return (
    <>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">
          Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-muted-foreground text-lg mt-1">Here's a quick overview of your health profile.</p>
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
                                        {items.map(item => (
                                            <Link to={item.path} key={item.id} className="block p-3 rounded-md hover:bg-secondary">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {type === 'record' && `${item.type} - ${item.date}`}
                                                    {type === 'medication' && `${item.dosage}, ${item.frequency}`}
                                                    {type === 'reminder' && `${item.time}`}
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
    </>
  );
};

export default Dashboard;