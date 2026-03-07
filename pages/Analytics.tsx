
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { BarChart3, Activity, Utensils, Pill } from '../components/icons/Icons';
import { useAuth } from '../hooks/useAuth';
import { getFullUserData } from '../services/dataSupabase';
import Skeleton from '../components/ui/Skeleton';
import { useTranslation } from 'react-i18next';
import { Medication, Symptom, FoodLog } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['hsl(265, 85%, 60%)', 'hsl(180, 70%, 50%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

const Analytics: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [symptoms, setSymptoms] = useState<Symptom[]>([]);
    const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);

    const loadData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const data = await getFullUserData(user.uid);
        setMedications(data.medications || []);
        setSymptoms(data.symptoms || []);
        setFoodLogs(data.foodLogs || []);
        setLoading(false);
    }, [user]);

    useEffect(() => { loadData(); }, [loadData]);

    // --- Medication Adherence ---
    const adherenceData = (() => {
        const active = medications.filter(m => m.isActive);
        const taken = active.filter(m => m.takenToday).length;
        const total = active.length;
        return [
            { name: t('analytics.taken', 'Taken Today'), value: taken },
            { name: t('analytics.missed', 'Not Yet Taken'), value: Math.max(0, total - taken) },
        ];
    })();

    // --- Symptom Frequency ---
    const symptomFreq = (() => {
        const freq: Record<string, number> = {};
        symptoms.forEach(s => { freq[s.name] = (freq[s.name] || 0) + 1; });
        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, count]) => ({ name, count }));
    })();

    // --- Food Journal by Meal Type ---
    const mealTypeData = (() => {
        const counts: Record<string, number> = { Breakfast: 0, Lunch: 0, Dinner: 0, Snack: 0 };
        foodLogs.forEach(f => { if (counts[f.mealType] !== undefined) counts[f.mealType]++; });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    })();

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <div className="grid md:grid-cols-2 gap-6">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mb-6">
                <h1 className="text-3xl font-bold font-heading">{t('analytics.title', 'Health Analytics')}</h1>
                <p className="text-muted-foreground">{t('analytics.subtitle', 'Visual insights across your health data.')}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Medication Adherence Pie */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Pill className="h-5 w-5 text-green-500" />
                            {t('analytics.med_adherence', 'Medication Adherence')}
                        </CardTitle>
                        <CardDescription>{t('analytics.med_desc', 'Today\'s medication completion status.')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {medications.filter(m => m.isActive).length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={adherenceData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                        {adherenceData.map((_, i) => (
                                            <Cell key={i} fill={i === 0 ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-muted-foreground py-10">{t('analytics.no_meds', 'No active medications to track.')}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Symptom Frequency Bar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-red-500" />
                            {t('analytics.symptom_freq', 'Symptom Frequency')}
                        </CardTitle>
                        <CardDescription>{t('analytics.symptom_desc', 'Most frequently logged symptoms.')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {symptomFreq.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={symptomFreq}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                    <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                                    <Bar dataKey="count" fill="hsl(265, 85%, 60%)" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-muted-foreground py-10">{t('analytics.no_symptoms', 'No symptoms logged yet.')}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Food Journal Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Utensils className="h-5 w-5 text-yellow-500" />
                            {t('analytics.food_breakdown', 'Meal Type Breakdown')}
                        </CardTitle>
                        <CardDescription>{t('analytics.food_desc', 'Distribution of logged meals by type.')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {foodLogs.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={mealTypeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                        {mealTypeData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-muted-foreground py-10">{t('analytics.no_food', 'No food logs yet.')}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Summary Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            {t('analytics.overview', 'Data Overview')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: t('analytics.total_meds', 'Active Medications'), value: medications.filter(m => m.isActive).length, color: 'text-green-500' },
                                { label: t('analytics.total_symptoms', 'Total Symptoms Logged'), value: symptoms.length, color: 'text-red-500' },
                                { label: t('analytics.total_meals', 'Total Meals Logged'), value: foodLogs.length, color: 'text-yellow-500' },
                                { label: t('analytics.unique_symptoms', 'Unique Symptoms'), value: new Set(symptoms.map(s => s.name)).size, color: 'text-primary' },
                            ].map((stat, i) => (
                                <div key={i} className="text-center p-4 rounded-lg bg-secondary/50">
                                    <p className={`text-3xl font-bold font-heading ${stat.color}`}>{stat.value}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default Analytics;
