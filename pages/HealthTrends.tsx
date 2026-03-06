import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { LineChart as LineChartIcon, HeartPulse } from '../components/icons/Icons';
import { Vital, TestResult } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getVitals, getTestResults, getSymptoms, getMedications } from '../services/dataSupabase';
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, ZAxis, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const HealthTrends: React.FC = () => {
  const { user } = useAuth();
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [meds, setMeds] = useState<any[]>([]);

  const refreshData = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const [vitalsData, testsData, sympData, medsData] = await Promise.all([
        getVitals(user.uid),
        getTestResults(user.uid),
        getSymptoms(user.uid),
        getMedications(user.uid)
      ]);
      setVitals(vitalsData);
      setTestResults(testsData);
      setSymptoms(sympData);
      setMeds(medsData);
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
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // --- MOCK DATA FOR NEW VISUALIZATIONS ---

  // 1. Medication Adherence (Mock over last 7 days)
  const medAdherenceData = [
    { day: 'Mon', adherence: 100 },
    { day: 'Tue', adherence: 80 },
    { day: 'Wed', adherence: 100 },
    { day: 'Thu', adherence: 60 },
    { day: 'Fri', adherence: 100 },
    { day: 'Sat', adherence: 90 },
    { day: 'Sun', adherence: 100 },
  ];

  // 2. Symptom Frequency Heatmap (Mock representation via Scatter/Bubble)
  const symptomFrequencyData = [
    { day: 'Mon', time: 'Morning', intensity: 2, symptom: 'Headache' },
    { day: 'Tue', time: 'Afternoon', intensity: 5, symptom: 'Fatigue' },
    { day: 'Wed', time: 'Evening', intensity: 3, symptom: 'Nausea' },
    { day: 'Thu', time: 'Morning', intensity: 8, symptom: 'Headache' },
    { day: 'Fri', time: 'Night', intensity: 4, symptom: 'Insomnia' },
    { day: 'Sat', time: 'Afternoon', intensity: 6, symptom: 'Fatigue' },
    { day: 'Sun', time: 'Morning', intensity: 1, symptom: 'Headache' },
  ];

  const parseTime = (time: string) => {
    switch (time) {
      case 'Morning': return 1;
      case 'Afternoon': return 2;
      case 'Evening': return 3;
      case 'Night': return 4;
      default: return 0;
    }
  };

  const symptomScatterData = symptomFrequencyData.map(d => ({
    ...d,
    timeNum: parseTime(d.time)
  }));

  // 3. Food Journal Calorie/Macro (Mock trailing week)
  const macroData = [
    { day: 'Mon', protein: 120, carbs: 200, fat: 60, total: 1800 },
    { day: 'Tue', protein: 110, carbs: 180, fat: 55, total: 1650 },
    { day: 'Wed', protein: 130, carbs: 220, fat: 65, total: 1950 },
    { day: 'Thu', protein: 100, carbs: 190, fat: 50, total: 1610 },
    { day: 'Fri', protein: 140, carbs: 210, fat: 70, total: 2000 },
    { day: 'Sat', protein: 125, carbs: 230, fat: 75, total: 2095 },
    { day: 'Sun', protein: 115, carbs: 195, fat: 60, total: 1780 },
  ];

  // 4. Sleep Tracking (Mock hours slept + quality)
  const sleepData = [
    { date: 'Mon', hours: 7.5, deepSleep: 2 },
    { date: 'Tue', hours: 6.2, deepSleep: 1.5 },
    { date: 'Wed', hours: 8.0, deepSleep: 2.5 },
    { date: 'Thu', hours: 5.5, deepSleep: 1.0 },
    { date: 'Fri', hours: 7.2, deepSleep: 1.8 },
    { date: 'Sat', hours: 9.0, deepSleep: 3.0 },
    { date: 'Sun', hours: 7.8, deepSleep: 2.2 },
  ];

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
                <YAxis stroke="hsl(var(--muted-foreground))" domain={['dataMin - 10', 'dataMax + 10']} fontSize={12} unit=" mmHg" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Legend />
                <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 6 }} />
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
                <YAxis stroke="hsl(var(--muted-foreground))" domain={['dataMin - 10', 'dataMax + 10']} fontSize={12} unit=" mg/dL" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Legend />
                <Line type="monotone" dataKey="sugar" name="Blood Sugar" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 6 }} />
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
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[60, 180]} fontSize={12} unit=" mg/dL" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Legend />
                <Line type="monotone" dataKey="value" name="Glucose" stroke="#10b981" strokeWidth={2} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 1. Medication Adherence */}
        <Card>
          <CardHeader>
            <CardTitle>Medication Adherence</CardTitle>
            <CardDescription>Your medication tracking consistency over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={medAdherenceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} fontSize={12} unit="%" />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="adherence" name="Adherence %" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                  {medAdherenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.adherence === 100 ? '#10b981' : entry.adherence >= 80 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 2. Symptom Frequency Heatmap (Scatter) */}
        <Card>
          <CardHeader>
            <CardTitle>Symptom Frequency Map</CardTitle>
            <CardDescription>Frequency and intensity of reported symptoms by time of day.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="category" dataKey="day" name="Day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis type="number" dataKey="timeNum" name="Time" domain={[0, 5]} ticks={[1, 2, 3, 4]} tickFormatter={(val) => ['Morning', 'Afternoon', 'Evening', 'Night'][val - 1] || ''} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <ZAxis type="number" dataKey="intensity" range={[50, 400]} name="Intensity" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border border-border p-3 rounded shadow-md">
                        <p className="font-bold">{data.symptom}</p>
                        <p className="text-sm">Intensity: {data.intensity}/10</p>
                        <p className="text-sm">Time: {data.time}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Scatter data={symptomScatterData} fill="#ef4444" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 3. Nutrition & Macros */}
        <Card>
          <CardHeader>
            <CardTitle>Nutrition Breakdown</CardTitle>
            <CardDescription>Daily macronutrient distribution tracking.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={macroData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="g" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Legend />
                <Bar dataKey="protein" stackId="a" name="Protein (g)" fill="#8b5cf6" />
                <Bar dataKey="carbs" stackId="a" name="Carbs (g)" fill="#3b82f6" />
                <Bar dataKey="fat" stackId="a" name="Fat (g)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 4. Sleep Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>Sleep Duration & Quality</CardTitle>
            <CardDescription>Total sleep hours vs. Deep sleep stages.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={sleepData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDeep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="h" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Legend />
                <Area type="monotone" dataKey="hours" name="Total Sleep" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHours)" />
                <Area type="monotone" dataKey="deepSleep" name="Deep Sleep" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorDeep)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </>
  );
};

export default HealthTrends;
