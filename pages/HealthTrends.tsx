import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { LineChart as LineChartIcon, HeartPulse } from '../components/icons/Icons';
import { Vital, TestResult, Medication, Symptom, FoodLog, SleepLog } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getVitals, getTestResults, getSymptoms, getMedications, getFoodLogs, getSleepLogs } from '../services/dataSupabase';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';

const HealthTrends: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);

  const refreshData = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const [vitalsData, testsData, sympData, medsData, foodData, sleepData] = await Promise.all([
        getVitals(user.uid),
        getTestResults(user.uid),
        getSymptoms(user.uid),
        getMedications(user.uid),
        getFoodLogs(user.uid),
        getSleepLogs(user.uid),
      ]);
      setVitals(vitalsData);
      setTestResults(testsData);
      setSymptoms(sympData);
      setMeds(medsData);
      setFoodLogs(foodData);
      setSleepLogs(sleepData);
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

  // --- REAL DATA COMPUTATIONS ---

  // 1. Medication Adherence — real per-medication taken/not-taken status
  const activeMeds = meds.filter(m => m.isActive);
  const medAdherenceData = activeMeds.map(m => ({
    name: m.name.length > 12 ? m.name.substring(0, 12) + '…' : m.name,
    fullName: m.name,
    adherence: m.takenToday ? 100 : 0,
  }));

  // 2. Symptom Frequency — real aggregation from Supabase symptoms
  const symptomFreqMap: Record<string, { count: number; totalSeverity: number }> = {};
  symptoms.forEach(s => {
    if (!symptomFreqMap[s.name]) symptomFreqMap[s.name] = { count: 0, totalSeverity: 0 };
    symptomFreqMap[s.name].count += 1;
    symptomFreqMap[s.name].totalSeverity += s.severity;
  });
  const symptomFreqData = Object.entries(symptomFreqMap)
    .map(([name, { count, totalSeverity }]) => ({
      name,
      count,
      avgSeverity: Math.round((totalSeverity / count) * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 3. Meal Tracking — real food_journal data grouped by day
  const mealsByDay: Record<string, { date: string; Breakfast: number; Lunch: number; Dinner: number; Snack: number; total: number }> = {};
  foodLogs.forEach(f => {
    const day = new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!mealsByDay[day]) mealsByDay[day] = { date: day, Breakfast: 0, Lunch: 0, Dinner: 0, Snack: 0, total: 0 };
    mealsByDay[day][f.mealType] += 1;
    mealsByDay[day].total += 1;
  });
  const mealTrackingData = Object.values(mealsByDay).slice(-14);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading">{t('health_trends.title', 'Health Trends')}</h1>
        <p className="text-muted-foreground">{t('health_trends.subtitle', 'Graph your vital signs and lab results over time.')}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('health_trends.bp_title', 'Blood Pressure (Last 30 entries)')}</CardTitle>
            <CardDescription>{t('health_trends.bp_desc', 'Track your systolic and diastolic pressure.')}</CardDescription>
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
            <CardTitle>{t('health_trends.sugar_title', 'Blood Sugar (Last 30 entries)')}</CardTitle>
            <CardDescription>{t('health_trends.sugar_desc', 'Track your logged blood sugar readings.')}</CardDescription>
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
            <CardTitle>{t('health_trends.lab_glucose_title', 'Lab Result: Glucose')}</CardTitle>
            <CardDescription>{t('health_trends.lab_glucose_desc', 'Track your glucose results from lab tests over time.')}</CardDescription>
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

        {/* 1. Medication Adherence — REAL DATA */}
        <Card>
          <CardHeader>
            <CardTitle>{t('health_trends.med_adherence_title', 'Medication Adherence')}</CardTitle>
            <CardDescription>{t('health_trends.med_adherence_desc_real', 'Shows which active medications you\'ve marked as taken today.')}</CardDescription>
          </CardHeader>
          <CardContent>
            {activeMeds.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={medAdherenceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} fontSize={12} unit="%" />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                    formatter={(value: number, name: string, props: any) => [`${value}%`, props.payload.fullName]}
                  />
                  <Bar dataKey="adherence" name="Taken Today" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                    {medAdherenceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.adherence === 100 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-10">{t('health_trends.no_active_meds', 'No active medications. Add medications to track adherence.')}</p>
            )}
          </CardContent>
        </Card>

        {/* 2. Symptom Frequency — REAL DATA */}
        <Card>
          <CardHeader>
            <CardTitle>{t('health_trends.symptom_map_title', 'Symptom Frequency')}</CardTitle>
            <CardDescription>{t('health_trends.symptom_map_desc_real', 'Frequency of your logged symptoms with average severity.')}</CardDescription>
          </CardHeader>
          <CardContent>
            {symptomFreqData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={symptomFreqData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                    formatter={(value: number, name: string) => {
                      if (name === 'Occurrences') return [`${value} times`, name];
                      return [`${value}/10`, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Occurrences" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="avgSeverity" name="Avg Severity" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-10">{t('health_trends.no_symptoms', 'No symptoms logged yet. Your symptom data will appear here.')}</p>
            )}
          </CardContent>
        </Card>

        {/* 3. Meal Tracking — REAL DATA */}
        <Card>
          <CardHeader>
            <CardTitle>{t('health_trends.nutrition_title', 'Meal Tracking')}</CardTitle>
            <CardDescription>{t('health_trends.nutrition_desc_real', 'Your logged meals by type per day from the Food Journal.')}</CardDescription>
          </CardHeader>
          <CardContent>
            {mealTrackingData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mealTrackingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} label={{ value: 'Meals', angle: -90, position: 'insideLeft' }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                  <Bar dataKey="Breakfast" stackId="a" name="Breakfast" fill="#8b5cf6" />
                  <Bar dataKey="Lunch" stackId="a" name="Lunch" fill="#3b82f6" />
                  <Bar dataKey="Dinner" stackId="a" name="Dinner" fill="#10b981" />
                  <Bar dataKey="Snack" stackId="a" name="Snack" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-10">{t('health_trends.no_food_logs', 'No food logs yet. Log meals in the Food Journal to see trends.')}</p>
            )}
          </CardContent>
        </Card>

        {/* 4. Sleep Tracking — REAL DATA */}
        <Card>
          <CardHeader>
            <CardTitle>{t('health_trends.sleep_title', 'Sleep Duration & Quality')}</CardTitle>
            <CardDescription>{t('health_trends.sleep_desc', 'Your logged sleep hours over time.')}</CardDescription>
          </CardHeader>
          <CardContent>
            {sleepLogs.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={sleepLogs.slice().reverse().slice(-14).map(s => ({
                  date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  hours: s.hours,
                  quality: s.quality,
                }))} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="h" domain={[0, 12]} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                  <Area type="monotone" dataKey="hours" name="Sleep Hours" stroke="#6366f1" fillOpacity={1} fill="url(#colorSleep)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10">
                <HeartPulse className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">{t('health_trends.no_sleep', 'No sleep logs yet.')}</p>
                <a href="#/sleep" className="text-primary text-sm hover:underline mt-1 inline-block">{t('health_trends.go_sleep', 'Go to Sleep Tracker →')}</a>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </>
  );
};

export default HealthTrends;

