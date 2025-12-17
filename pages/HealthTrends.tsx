import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { LineChart as LineChartIcon, HeartPulse } from '../components/icons/Icons';
import { Vital, TestResult } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getVitals, getTestResults } from '../services/dataSupabase';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HealthTrends: React.FC = () => {
  const { user } = useAuth();
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const [vitalsData, testsData] = await Promise.all([
        getVitals(user.uid),
        getTestResults(user.uid),
      ]);
      setVitals(vitalsData);
      setTestResults(testsData);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const formattedVitals = vitals.map(v => ({
    ...v,
    date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));
  
  const glucoseData = testResults.flatMap(tr => 
    tr.details.filter(d => d.name === 'Glucose').map(d => ({
        date: new Date(tr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: parseFloat(d.value)
    }))
  ).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading">Health Trends</h1>
        <p className="text-muted-foreground">Graph your vital signs and lab results over time.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Blood Pressure (Last 30 entries)</CardTitle>
            <CardDescription>Track your systolic and diastolic pressure.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formattedVitals.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" domain={['dataMin - 10', 'dataMax + 10']} fontSize={12} unit=" mmHg"/>
                    <Tooltip contentStyle={{backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))"}}/>
                    <Legend />
                    <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 6 }}/>
                    <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 6 }}/>
                </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Blood Sugar (Last 30 entries)</CardTitle>
            <CardDescription>Track your logged blood sugar readings.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formattedVitals.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" domain={['dataMin - 10', 'dataMax + 10']} fontSize={12} unit=" mg/dL"/>
                    <Tooltip contentStyle={{backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))"}}/>
                    <Legend />
                    <Line type="monotone" dataKey="sugar" name="Blood Sugar" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 6 }}/>
                </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
         <Card>
          <CardHeader>
            <CardTitle>Lab Result: Glucose</CardTitle>
            <CardDescription>Track your glucose results from lab tests over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={glucoseData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" domain={[60, 180]} fontSize={12} unit=" mg/dL"/>
                    <Tooltip contentStyle={{backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))"}}/>
                    <Legend />
                    <Line type="monotone" dataKey="value" name="Glucose" stroke="#10b981" strokeWidth={2} activeDot={{ r: 6 }}/>
                </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default HealthTrends;
