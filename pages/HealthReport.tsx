
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FileText, Printer, Share2 } from '../components/icons/Icons';
import { useAuth } from '../hooks/useAuth';
import { getFullUserData, getWaterIntake } from '../services/dataSupabase';
import Skeleton from '../components/ui/Skeleton';
import { useTranslation } from 'react-i18next';
import { Medication, Symptom, Vital, MedicalRecord, Profile } from '../types';

interface FullUserData {
    profile: Profile;
    vitals: Vital[];
    medications: Medication[];
    symptoms: Symptom[];
    records: MedicalRecord[];
    foodLogs: any[];
}

const HealthReport: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [data, setData] = useState<FullUserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [waterIntake, setWaterIntake] = useState(0);

    const loadData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const userData = await getFullUserData(user.uid);
        const today = new Date().toISOString().split('T')[0];
        const water = await getWaterIntake(user.uid, today);
        setData(userData as FullUserData);
        setWaterIntake(water);
        setLoading(false);
    }, [user]);

    useEffect(() => { loadData(); }, [loadData]);

    const handlePrint = () => window.print();

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!data) return null;

    const activeMeds = data.medications.filter(m => m.isActive);
    const recentVitals = data.vitals.slice(-7);
    const recentSymptoms = data.symptoms.slice(0, 10);

    return (
        <>
            {/* Screen-Only Header with Controls */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 no-print">
                <div>
                    <h1 className="text-3xl font-bold font-heading">{t('report.title', 'Health Report')}</h1>
                    <p className="text-muted-foreground">{t('report.subtitle', 'Generate a printable health report for your doctor visit.')}</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" /> {t('report.print', 'Print / Save PDF')}
                    </Button>
                </div>
            </div>

            {/* Printable Report Content */}
            <div className="space-y-6" id="health-report-content">
                {/* Print Header (visible in print only) */}
                <div className="hidden print:block print-header">
                    <h1 className="text-2xl font-bold">DocuMedic — Personal Health Report</h1>
                    <p className="text-sm text-gray-600">Generated on {today}</p>
                    <p className="text-sm text-gray-600">Patient: {user?.displayName || user?.email || 'N/A'}</p>
                </div>

                {/* Patient Profile */}
                <Card className="print:shadow-none print:border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary no-print" />
                            {t('report.profile', 'Patient Profile')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="font-semibold">{t('report.age', 'Age:')}</span> {data.profile.age || 'N/A'}</div>
                            <div><span className="font-semibold">{t('report.blood_type', 'Blood Type:')}</span> {data.profile.bloodType || 'N/A'}</div>
                            <div><span className="font-semibold">{t('report.conditions', 'Conditions:')}</span> {data.profile.conditions || 'None specified'}</div>
                            <div><span className="font-semibold">{t('report.goals', 'Health Goals:')}</span> {data.profile.goals || 'None specified'}</div>
                            <div><span className="font-semibold">{t('report.target_sugar', 'Target Blood Sugar:')}</span> {data.profile.targetBloodSugar || 'N/A'} mg/dL</div>
                            <div><span className="font-semibold">{t('report.water', 'Today\'s Water:')}</span> {waterIntake}/{data.profile.waterGoal || 8} glasses</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Emergency Contacts */}
                {(data.profile.emergencyContactName || data.profile.emergencyContactPhone) && (
                    <Card className="print:shadow-none print:border">
                        <CardHeader>
                            <CardTitle>{t('report.emergency', 'Emergency Contact')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm space-y-1">
                                <p><span className="font-semibold">{t('report.name', 'Name:')}</span> {data.profile.emergencyContactName || 'N/A'}</p>
                                <p><span className="font-semibold">{t('report.phone', 'Phone:')}</span> {data.profile.emergencyContactPhone || 'N/A'}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Current Medications */}
                <Card className="print:shadow-none print:border print-section">
                    <CardHeader>
                        <CardTitle>{t('report.medications', 'Current Medications')} ({activeMeds.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {activeMeds.length > 0 ? (
                            <table className="w-full text-sm print-table">
                                <thead>
                                    <tr className="border-b bg-secondary/50">
                                        <th className="text-left p-2 font-semibold">{t('report.med_name', 'Medication')}</th>
                                        <th className="text-left p-2 font-semibold">{t('report.dosage', 'Dosage')}</th>
                                        <th className="text-left p-2 font-semibold">{t('report.frequency', 'Frequency')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeMeds.map(med => (
                                        <tr key={med.id} className="border-b border-border/50">
                                            <td className="p-2 font-medium">{med.name}</td>
                                            <td className="p-2">{med.dosage}</td>
                                            <td className="p-2">{med.frequency}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-muted-foreground text-sm">{t('report.no_meds', 'No active medications.')}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Vitals */}
                <Card className="print:shadow-none print:border print-section">
                    <CardHeader>
                        <CardTitle>{t('report.vitals', 'Recent Vitals')} ({recentVitals.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentVitals.length > 0 ? (
                            <table className="w-full text-sm print-table">
                                <thead>
                                    <tr className="border-b bg-secondary/50">
                                        <th className="text-left p-2 font-semibold">{t('report.date', 'Date')}</th>
                                        <th className="text-left p-2 font-semibold">{t('report.blood_sugar', 'Blood Sugar')}</th>
                                        <th className="text-left p-2 font-semibold">{t('report.blood_pressure', 'Blood Pressure')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentVitals.map((v, i) => (
                                        <tr key={i} className="border-b border-border/50">
                                            <td className="p-2">{v.date}</td>
                                            <td className="p-2">{v.sugar ? `${v.sugar} mg/dL` : '—'}</td>
                                            <td className="p-2">{v.systolic && v.diastolic ? `${v.systolic}/${v.diastolic} mmHg` : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-muted-foreground text-sm">{t('report.no_vitals', 'No vitals recorded.')}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Symptoms */}
                <Card className="print:shadow-none print:border print-section">
                    <CardHeader>
                        <CardTitle>{t('report.symptoms', 'Recent Symptoms')} ({recentSymptoms.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentSymptoms.length > 0 ? (
                            <table className="w-full text-sm print-table">
                                <thead>
                                    <tr className="border-b bg-secondary/50">
                                        <th className="text-left p-2 font-semibold">{t('report.symptom_name', 'Symptom')}</th>
                                        <th className="text-left p-2 font-semibold">{t('report.severity', 'Severity')}</th>
                                        <th className="text-left p-2 font-semibold">{t('report.date', 'Date')}</th>
                                        <th className="text-left p-2 font-semibold">{t('report.notes', 'Notes')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentSymptoms.map(s => (
                                        <tr key={s.id} className="border-b border-border/50">
                                            <td className="p-2 font-medium">{s.name}</td>
                                            <td className="p-2">{s.severity}/10</td>
                                            <td className="p-2">{new Date(s.date).toLocaleDateString()}</td>
                                            <td className="p-2">{s.notes || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-muted-foreground text-sm">{t('report.no_symptoms', 'No symptoms recorded.')}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Medical History */}
                <Card className="print:shadow-none print:border print-section">
                    <CardHeader>
                        <CardTitle>{t('report.history', 'Medical History')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <p className="font-semibold">{t('report.personal_history', 'Personal History')}</p>
                            <p className="text-muted-foreground">{data.profile.personalHistory || 'None documented'}</p>
                        </div>
                        <div>
                            <p className="font-semibold">{t('report.family_history', 'Family History')}</p>
                            <p className="text-muted-foreground">{data.profile.familyHistory || 'None documented'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Disclaimer */}
                <p className="text-xs text-muted-foreground text-center py-4 print:text-black">
                    {t('report.disclaimer', 'This report was auto-generated by DocuMedic and is not a substitute for professional medical advice. Always consult your healthcare provider.')}
                </p>
            </div>
        </>
    );
};

export default HealthReport;
