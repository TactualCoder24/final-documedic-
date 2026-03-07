
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { ShieldCheck, Clock } from '../components/icons/Icons';
import { getSharedRecord, ShareableRecord } from '../services/sharingService';
import Skeleton from '../components/ui/Skeleton';

const SharedRecord: React.FC = () => {
    const { shareId } = useParams<{ shareId: string }>();
    const [record, setRecord] = useState<ShareableRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (!shareId) return;
            setLoading(true);
            const result = await getSharedRecord(shareId);
            if (result) {
                setRecord(result);
            } else {
                setExpired(true);
            }
            setLoading(false);
        };
        load();
    }, [shareId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-secondary/30 dark:bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl">
                    <CardContent className="py-10 space-y-4">
                        <Skeleton className="h-6 w-64" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w,3/4" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (expired || !record) {
        return (
            <div className="min-h-screen bg-secondary/30 dark:bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="py-16">
                        <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-xl font-bold font-heading mb-2">Link Expired or Not Found</h2>
                        <p className="text-muted-foreground">
                            This shared health record link has expired or does not exist. Please ask the owner to generate a new link.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const expiresDate = new Date(record.expiresAt).toLocaleString();

    return (
        <div className="min-h-screen bg-secondary/30 dark:bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <div className="flex items-center gap-2 text-green-500 mb-2">
                        <ShieldCheck className="h-5 w-5" />
                        <span className="text-sm font-medium">Securely Shared via DocuMedic</span>
                    </div>
                    <CardTitle>{record.title}</CardTitle>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" /> Expires: {expiresDate}
                    </p>
                </CardHeader>
                <CardContent>
                    {record.recordType === 'health_report' && record.recordData ? (
                        <div className="space-y-6">
                            {record.recordData.profile && (
                                <div>
                                    <h3 className="font-semibold mb-2">Patient Profile</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <p><span className="font-medium">Age:</span> {record.recordData.profile.age || 'N/A'}</p>
                                        <p><span className="font-medium">Blood Type:</span> {record.recordData.profile.bloodType || 'N/A'}</p>
                                        <p><span className="font-medium">Conditions:</span> {record.recordData.profile.conditions || 'None'}</p>
                                    </div>
                                </div>
                            )}
                            {record.recordData.medications && record.recordData.medications.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2">Medications</h3>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        {record.recordData.medications.map((m: any, i: number) => (
                                            <li key={i}>{m.name} — {m.dosage} ({m.frequency})</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {record.recordData.vitals && record.recordData.vitals.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2">Recent Vitals</h3>
                                    <div className="text-sm space-y-1">
                                        {record.recordData.vitals.slice(-5).map((v: any, i: number) => (
                                            <p key={i}>{v.date}: {v.sugar ? `Sugar: ${v.sugar} mg/dL` : ''} {v.systolic ? `BP: ${v.systolic}/${v.diastolic} mmHg` : ''}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap text-sm bg-secondary/50 p-4 rounded-lg">
                                {JSON.stringify(record.recordData, null, 2)}
                            </pre>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SharedRecord;
