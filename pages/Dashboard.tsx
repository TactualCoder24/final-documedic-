import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Pill, FileText, BrainCircuit, ClipboardList } from '../components/icons/Icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { Vital } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const mockVitals: Vital[] = [
  { date: 'Jun 1', systolic: 120, diastolic: 80, sugar: 95 },
  { date: 'Jun 2', systolic: 122, diastolic: 81, sugar: 105 },
  { date: 'Jun 3', systolic: 118, diastolic: 78, sugar: 98 },
  { date: 'Jun 4', systolic: 125, diastolic: 82, sugar: 110 },
  { date: 'Jun 5', systolic: 121, diastolic: 79, sugar: 102 },
  { date: 'Jun 6', systolic: 123, diastolic: 80, sugar: 108 },
];


const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [vitals, setVitals] = useState<Vital[]>(mockVitals);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);

  const latestVitals = vitals[vitals.length - 1];

  const handleUpdateVitals = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newVital: Vital = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      systolic: Number(formData.get('systolic')),
      diastolic: Number(formData.get('diastolic')),
      sugar: Number(formData.get('sugar')),
    };

    if (newVital.systolic > 0 && newVital.diastolic > 0 && newVital.sugar > 0) {
        // Prevent adding duplicate entries for the same day for this mock
        if (vitals.some(v => v.date === newVital.date)) {
           setVitals(vitals.map(v => v.date === newVital.date ? newVital : v));
        } else {
           setVitals([...vitals, newVital]);
        }
        setIsVitalsModalOpen(false);
    }
  };

  return (
    <>
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-heading">
        Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
      </h1>
      <p className="text-muted-foreground">Here's a quick overview of your health profile.</p>

      <div className="grid gap-6 auto-rows-fr md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <ClipboardList className="h-8 w-8 text-primary flex-shrink-0"/>
                    <div>
                        <CardTitle>Log Today's Vitals</CardTitle>
                        <CardDescription className="mt-1">Keep your health record up to date.</CardDescription>
                    </div>
                </div>
                <Button onClick={() => setIsVitalsModalOpen(true)} className="w-full sm:w-auto">Update Vitals</Button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center pt-2">
                <div>
                    <p className="text-sm text-muted-foreground">Blood Pressure</p>
                    <p className="text-2xl font-bold">{latestVitals.systolic}/{latestVitals.diastolic} <span className="text-sm font-normal text-muted-foreground">mmHg</span></p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Blood Sugar</p>
                    <p className="text-2xl font-bold">{latestVitals.sugar} <span className="text-sm font-normal text-muted-foreground">mg/dL</span></p>
                </div>
                <div className="col-span-2 md:col-span-1">
                     <p className="text-sm text-muted-foreground">Last Logged</p>
                    <p className="text-2xl font-bold">{latestVitals.date}</p>
                </div>
            </CardContent>
        </Card>

        <Card className="hover:border-primary/80 transition-colors">
          <Link to="/medications">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Medication</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Lisinopril</div>
              <p className="text-xs text-muted-foreground">Due in 2 hours</p>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:border-primary/80 transition-colors">
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
        <Card className="hover:border-primary/80 transition-colors">
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
            <CardTitle>Recent Vitals</CardTitle>
            <CardDescription>Your vitals have been stable. Keep up the consistent monitoring!</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={vitals.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis yAxisId="bp" stroke="hsl(var(--primary))" fontSize={12} unit=" mmHg" />
                    <YAxis yAxisId="sugar" orientation="right" stroke="hsl(var(--destructive))" fontSize={12} unit=" mg/dL" />
                    <Tooltip
                        contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)"
                        }}
                    />
                    <Legend />
                    <Line yAxisId="bp" type="monotone" dataKey="systolic" name="Systolic BP" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line yAxisId="bp" type="monotone" dataKey="diastolic" name="Diastolic BP" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="3 3" />
                    <Line yAxisId="sugar" type="monotone" dataKey="sugar" name="Blood Sugar" stroke="hsl(var(--destructive))" strokeWidth={2} activeDot={{ r: 8 }}/>
                </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
    <Modal title="Log Today's Vitals" isOpen={isVitalsModalOpen} onClose={() => setIsVitalsModalOpen(false)}>
         <form className="space-y-4" onSubmit={handleUpdateVitals}>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="systolic" className="block text-sm font-medium text-foreground mb-1">Systolic (mmHg)</label>
                    <Input id="systolic" name="systolic" type="number" placeholder="e.g., 120" required />
                </div>
                 <div>
                    <label htmlFor="diastolic" className="block text-sm font-medium text-foreground mb-1">Diastolic (mmHg)</label>
                    <Input id="diastolic" name="diastolic" type="number" placeholder="e.g., 80" required />
                </div>
            </div>
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
