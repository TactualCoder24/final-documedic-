import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Pill, FileText, BrainCircuit } from '../components/icons/Icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const weightData = [
  { name: 'Jan', weight: 80 },
  { name: 'Feb', weight: 79 },
  { name: 'Mar', weight: 79.5 },
  { name: 'Apr', weight: 78 },
  { name: 'May', weight: 77 },
  { name: 'Jun', weight: 77.5 },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-heading">
        Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
      </h1>
      <p className="text-muted-foreground">Here's a quick overview of your health profile.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weight Tracking (6 months)</CardTitle>
          <CardDescription>Your weight has been trending downwards. Keep it up!</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="kg" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)"
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
