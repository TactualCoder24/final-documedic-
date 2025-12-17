import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Stethoscope, FileText, ClipboardList } from '../components/icons/Icons';
import { AfterVisitSummary as AfterVisitSummaryType, Appointment } from '../types';
import { getAfterVisitSummary, getAppointments } from '../services/dataSupabase';
import { useAuth } from '../hooks/useAuth';

const AfterVisitSummary: React.FC = () => {
  const { user } = useAuth();
  const { id: appointmentId } = useParams<{ id: string }>();
  const [summary, setSummary] = useState<AfterVisitSummaryType | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user && appointmentId) {
        setLoading(true);
        const allAppointments = await getAppointments(user.uid);
        const currentAppointment = allAppointments.find(a => a.id === appointmentId);
        
        if (currentAppointment && currentAppointment.summaryId) {
          const summaryData = await getAfterVisitSummary(user.uid, currentAppointment.summaryId);
          setAppointment(currentAppointment);
          setSummary(summaryData || null);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [user, appointmentId]);

  const handlePrint = () => {
    window.print();
  };
  
  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

  if (!summary || !appointment) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Summary Not Found</h1>
        <p className="text-muted-foreground mt-2">Could not find a visit summary for this appointment.</p>
        <Button asChild className="mt-4">
            <Link to="/appointments">Go to Appointments</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-section, #print-section * {
            visibility: visible;
          }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
           .no-print {
            display: none;
           }
        }
      `}</style>
      <div id="print-section">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
            <h1 className="text-3xl font-bold font-heading">After Visit Summary</h1>
            <p className="text-muted-foreground">A summary of your visit on {new Date(appointment.dateTime).toLocaleDateString(undefined, { dateStyle: 'full' })}.</p>
            </div>
            <Button onClick={handlePrint} className="no-print">Print Summary</Button>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Stethoscope className="h-5 w-5"/>Visit Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">Provider</dt>
                            <dd className="font-semibold">{appointment.doctorName}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">Specialty</dt>
                            <dd className="font-semibold">{appointment.specialty}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                            <dd className="font-semibold">{appointment.location}</dd>
                        </div>
                         <div>
                            <dt className="text-sm font-medium text-muted-foreground">Reason for Visit</dt>
                            <dd className="font-semibold">{summary.visitReason}</dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/>Clinical Notes</CardTitle>
                    <CardDescription>Notes recorded by your provider during the visit.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-foreground whitespace-pre-wrap">{summary.clinicalNotes}</p>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5"/>Follow-up Care</CardTitle>
                    <CardDescription>Instructions for you to follow after your visit.</CardDescription>
                </CardHeader>
                <CardContent>
                     <p className="text-foreground whitespace-pre-wrap">{summary.followUpInstructions}</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  );
};

export default AfterVisitSummary;