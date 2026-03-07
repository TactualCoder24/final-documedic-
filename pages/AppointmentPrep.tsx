
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { CheckSquare, Pill, FileText, ArrowLeft } from '../components/icons/Icons';
import { useAuth } from '../hooks/useAuth';
import { getAppointments, getMedications } from '../services/dataSupabase';
import Skeleton from '../components/ui/Skeleton';
import { useTranslation } from 'react-i18next';
import { Appointment, Medication } from '../types';

interface ChecklistItem {
    id: string;
    label: string;
    checked: boolean;
    auto?: boolean; // Auto-generated items
}

const AppointmentPrep: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [loading, setLoading] = useState(true);
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [customQuestion, setCustomQuestion] = useState('');

    const loadData = useCallback(async () => {
        if (!user || !id) return;
        setLoading(true);
        const [apps, meds] = await Promise.all([
            getAppointments(user.uid),
            getMedications(user.uid),
        ]);
        const found = apps.find(a => a.id === id);
        setAppointment(found || null);
        setMedications(meds.filter(m => m.isActive));

        // Build checklist
        const items: ChecklistItem[] = [
            { id: 'insurance', label: t('prep.insurance', 'Bring insurance card / ID'), checked: false },
            { id: 'lab_reports', label: t('prep.lab_reports', 'Bring recent lab reports'), checked: false },
            { id: 'fasting', label: t('prep.fasting', 'Fast for 8 hours (if lab work required)'), checked: false },
            { id: 'med_list', label: t('prep.med_list', 'Current medication list (see below)'), checked: false, auto: true },
            { id: 'symptoms_list', label: t('prep.symptoms_list', 'Note down recent symptoms to discuss'), checked: false },
            { id: 'questions', label: t('prep.questions', 'Prepare questions for the doctor'), checked: false },
        ];

        // Add appointment-type specific items
        if (found?.type === 'Video') {
            items.push({ id: 'tech_check', label: t('prep.tech_check', 'Test camera & microphone for video visit'), checked: false });
        }

        setChecklist(items);
        setLoading(false);
    }, [user, id, t]);

    useEffect(() => { loadData(); }, [loadData]);

    const toggleItem = (itemId: string) => {
        setChecklist(prev => prev.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
        ));
    };

    const addCustomQuestion = () => {
        if (!customQuestion.trim()) return;
        setChecklist(prev => [...prev, {
            id: `q-${Date.now()}`,
            label: customQuestion.trim(),
            checked: false,
        }]);
        setCustomQuestion('');
    };

    const completedCount = checklist.filter(i => i.checked).length;
    const progress = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="text-center py-20">
                <p className="text-muted-foreground">{t('prep.not_found', 'Appointment not found.')}</p>
                <Link to="/appointments"><Button variant="outline" className="mt-4">{t('prep.back', 'Back to Appointments')}</Button></Link>
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center gap-3 mb-6">
                <Link to="/appointments">
                    <Button variant="ghost" size="icon" aria-label={t('prep.back', 'Back to Appointments')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold font-heading">{t('prep.title', 'Appointment Prep')}</h1>
                    <p className="text-muted-foreground">
                        {appointment.doctorName} — {appointment.specialty} — {new Date(appointment.dateTime).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <Card className="mb-6">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{t('prep.progress', 'Preparation Progress')}</span>
                        <span className="text-sm font-bold text-primary">{progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3">
                        <div
                            className="bg-primary-gradient h-3 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{completedCount}/{checklist.length} {t('prep.items_complete', 'items completed')}</p>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Checklist */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckSquare className="h-5 w-5 text-primary" />
                            {t('prep.checklist', 'Pre-Appointment Checklist')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {checklist.map(item => (
                            <label
                                key={item.id}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${item.checked
                                    ? 'bg-green-500/10 border border-green-500/30'
                                    : 'bg-secondary/50 border border-transparent hover:border-primary/20'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={item.checked}
                                    onChange={() => toggleItem(item.id)}
                                    className="h-5 w-5 rounded accent-primary"
                                    aria-label={item.label}
                                />
                                <span className={`text-sm ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                                    {item.label}
                                </span>
                            </label>
                        ))}

                        {/* Add custom question */}
                        <div className="flex gap-2 mt-4">
                            <input
                                type="text"
                                value={customQuestion}
                                onChange={e => setCustomQuestion(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addCustomQuestion()}
                                placeholder={t('prep.add_question', 'Add a question for your doctor...')}
                                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                                aria-label={t('prep.add_question', 'Add a question for your doctor...')}
                            />
                            <Button onClick={addCustomQuestion} size="sm">{t('prep.add', 'Add')}</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Auto-Generated Medication List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Pill className="h-5 w-5 text-green-500" />
                            {t('prep.current_meds', 'Current Medications')}
                        </CardTitle>
                        <CardDescription>{t('prep.meds_desc', 'Auto-generated list to share with your doctor.')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {medications.length > 0 ? (
                            <div className="space-y-2">
                                {medications.map(med => (
                                    <div key={med.id} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-sm">{med.name}</p>
                                            <p className="text-xs text-muted-foreground">{med.dosage} · {med.frequency}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-6">{t('prep.no_meds', 'No active medications.')}</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default AppointmentPrep;
