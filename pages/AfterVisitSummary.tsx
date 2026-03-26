import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FileText, Calendar, Plus, ExternalLink, Activity, Info, HelpCircle, BrainCircuit, Stethoscope, ClipboardList } from '../components/icons/Icons';
import Skeleton from '../components/ui/Skeleton';
import { AfterVisitSummary as AfterVisitSummaryType, Appointment } from '../types';
import { getAfterVisitSummary, getAppointments, addAfterVisitSummary, updateAppointment } from '../services/dataSupabase';
import { extractVisitSummary } from '../services/aiService';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/ui/Modal';
import { useToast } from '../hooks/useToast';
import { useTranslation } from 'react-i18next';

const AfterVisitSummaryPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const { id: appointmentId } = useParams<{ id: string }>();
  const [summary, setSummary] = useState<AfterVisitSummaryType | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    if (user && appointmentId) {
      setLoading(true);
      const allAppointments = await getAppointments(user.uid);
      const currentAppointment = allAppointments.find(a => a.id === appointmentId);

      if (currentAppointment) {
        setAppointment(currentAppointment);
        if (currentAppointment.summaryId) {
          const summaryData = await getAfterVisitSummary(user.uid, currentAppointment.summaryId);
          setSummary(summaryData || null);
        }
      }
      setLoading(false);
    }
  }, [user, appointmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateSummary = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !appointment) return;
    const formData = new FormData(e.currentTarget);
    const visitNotes = formData.get('visit-notes') as string;
    if (!visitNotes.trim()) return;

    setIsProcessing(true);
    try {
      // Use Gemini AI to extract structured summary from visit notes
      const extracted = await extractVisitSummary(visitNotes);

      // Save to Supabase
      const summaryId = await addAfterVisitSummary(user.uid, {
        appointmentId: appointment.id,
        visitReason: extracted.visitReason,
        clinicalNotes: extracted.clinicalNotes,
        followUpInstructions: extracted.followUpInstructions,
      });

      // Link summary to appointment
      await updateAppointment(user.uid, { ...appointment, summaryId });

      toast.success(t('avs.created_success', 'AI-powered visit summary created!'));
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(t('avs.create_error', 'Failed to create visit summary.'));
    }
    setIsProcessing(false);
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen soft-aurora flex pt-20 justify-center">
        <Skeleton variant="dashboard" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('avs.not_found', 'Appointment Not Found')}</h1>
        <p className="text-muted-foreground mt-2">{t('avs.not_found_desc', 'Could not find this appointment.')}</p>
        <Button asChild className="mt-4"><Link to="/appointments">{t('avs.go_appointments', 'Go to Appointments')}</Link></Button>
      </div>
    );
  }

  if (!summary) {
    return (
      <>
        <div className="text-center max-w-lg mx-auto py-12">
          <BrainCircuit className="h-16 w-16 text-primary mx-auto mb-4 opacity-70" />
          <h1 className="text-2xl font-bold mb-2">{t('avs.no_summary', 'No Visit Summary Yet')}</h1>
          <p className="text-muted-foreground mb-6">{t('avs.no_summary_desc', 'Paste your visit notes and our AI will organize them into a structured summary.')}</p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t('avs.create_with_ai', 'Create Summary with AI')}
          </Button>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('avs.create_title', 'Create Visit Summary with AI')}>
          <form onSubmit={handleCreateSummary} className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('avs.paste_instructions', 'Paste your visit notes, discharge summary, or doctor\'s notes below. Gemini AI will extract and organize them into a structured summary.')}</p>
            <div>
              <label htmlFor="visit-notes" className="block text-sm font-medium">{t('avs.notes_label', 'Visit Notes / Clinical Summary')}</label>
              <textarea
                id="visit-notes"
                name="visit-notes"
                rows={8}
                required
                placeholder={t('avs.notes_placeholder', 'Paste your visit notes here...\n\nExample: Patient presented with complaints of persistent headache for 3 days. BP 130/85. Prescribed ibuprofen 400mg. Follow up in 2 weeks if no improvement. Recommend blood work panel.')}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? (
                  <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>{t('avs.processing', 'AI Processing...')}</>
                ) : (
                  <><BrainCircuit className="mr-2 h-4 w-4" />{t('avs.extract_btn', 'Extract with AI')}</>
                )}
              </Button>
            </div>
          </form>
        </Modal>
      </>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-section, #print-section * { visibility: visible; }
          #print-section { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none; }
        }
      `}</style>
      <div id="print-section">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold font-heading">{t('avs.title', 'After Visit Summary')}</h1>
            <p className="text-muted-foreground">{t('avs.visit_date', 'A summary of your visit on {{date}}.', { date: new Date(appointment.dateTime).toLocaleDateString(undefined, { dateStyle: 'full' }) })}</p>
          </div>
          <Button onClick={handlePrint} className="no-print">{t('avs.print', 'Print Summary')}</Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Stethoscope className="h-5 w-5" />{t('avs.visit_details', 'Visit Details')}</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <div><dt className="text-sm font-medium text-muted-foreground">{t('avs.provider', 'Provider')}</dt><dd className="font-semibold">{appointment.doctorName}</dd></div>
                <div><dt className="text-sm font-medium text-muted-foreground">{t('avs.specialty', 'Specialty')}</dt><dd className="font-semibold">{appointment.specialty}</dd></div>
                <div><dt className="text-sm font-medium text-muted-foreground">{t('avs.location', 'Location')}</dt><dd className="font-semibold">{appointment.location}</dd></div>
                <div><dt className="text-sm font-medium text-muted-foreground">{t('avs.reason', 'Reason for Visit')}</dt><dd className="font-semibold">{summary.visitReason}</dd></div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />{t('avs.clinical_notes', 'Clinical Notes')}</CardTitle>
              <CardDescription>{t('avs.clinical_notes_desc', 'Notes recorded by your provider during the visit.')}</CardDescription>
            </CardHeader>
            <CardContent><p className="text-foreground whitespace-pre-wrap">{summary.clinicalNotes}</p></CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" />{t('avs.followup', 'Follow-up Care')}</CardTitle>
              <CardDescription>{t('avs.followup_desc', 'Instructions for you to follow after your visit.')}</CardDescription>
            </CardHeader>
            <CardContent><p className="text-foreground whitespace-pre-wrap">{summary.followUpInstructions}</p></CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AfterVisitSummaryPage;