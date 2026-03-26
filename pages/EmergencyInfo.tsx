import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ShieldAlert, AlertTriangle, Phone, FileText, HeartPulse, Activity, Info, Calendar, Share2, Pill } from '../components/icons/Icons';
import Skeleton from '../components/ui/Skeleton';
import { getFullUserData } from '../services/dataSupabase';
import { Medication } from '../types';
import { useTranslation } from 'react-i18next';

interface EmergencyData {
  name: string;
  dob: string;
  bloodType: string;
  emergencyContacts: { name: string; relationship: string; phone: string }[];
  allergies: string[];
  conditions: string[];
  medications: { name: string; dosage: string }[];
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4 py-3 border-b border-border/60">
    <dt className="font-semibold text-muted-foreground">{label}</dt>
    <dd className="col-span-2 text-foreground font-medium">{value}</dd>
  </div>
);

const EmergencyInfo: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [data, setData] = useState<any>(null); // Use any for simplicity as it combines multiple types
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (id) {
        const userData = await getFullUserData(id);
        if (userData) {
          if (!userData.profile) userData.profile = {};
          setData(userData);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: t('emergency_info.share.title', 'Emergency Info'),
        text: t('emergency_info.share.text', 'View the emergency medical profile.'),
        url: window.location.href,
      })
        .catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('emergency_info.share.success', 'Profile link copied to clipboard!'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen soft-aurora flex pt-20 justify-center">
        <Skeleton variant="dashboard" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center bg-background p-4">
        <h1 className="text-4xl font-bold text-destructive">{t('emergency_info.invalid.title', 'Invalid or Incomplete Profile')}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t('emergency_info.invalid.desc', 'The emergency profile link is invalid or the user has not completed their profile.')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen soft-aurora p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <HeartPulse className="h-12 w-12 text-destructive mx-auto mb-2" />
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-destructive">{t('emergency_info.title', 'Emergency Medical Information')}</h1>
          <p className="text-muted-foreground mt-1">{t('emergency_info.subtitle', 'This information is provided for emergency use only.')}</p>
        </header>

        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            {t('emergency_info.share_profile', 'Share Profile')}
          </Button>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">{t('emergency_info.patient_details', 'Patient Details')}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <InfoRow label={t('emergency_info.age', 'Age')} value={data.profile.age || t('common.na', 'N/A')} />
              <InfoRow label={t('emergency_info.blood_type', 'Blood Type')} value={data.profile.bloodType || t('common.na', 'N/A')} />
              {(() => {
                const latestVitals = data.vitals && data.vitals.length > 0 ? data.vitals[data.vitals.length - 1] : null;
                return (
                  <>
                    <InfoRow label={t('emergency_info.latest_sugar', 'Latest Blood Sugar')} value={latestVitals?.sugar ? `${latestVitals.sugar} mg/dL` : t('common.na', 'N/A')} />
                    <InfoRow label={t('emergency_info.latest_bp', 'Latest Blood Pressure')} value={latestVitals?.systolic && latestVitals?.diastolic ? `${latestVitals.systolic}/${latestVitals.diastolic} mmHg` : t('common.na', 'N/A')} />
                  </>
                );
              })()}
              <InfoRow label={t('emergency_info.emergency_contact', 'Emergency Contact')} value={
                data.profile.emergencyContactName ?
                  `${data.profile.emergencyContactName} - ${data.profile.emergencyContactPhone}` : t('common.na', 'N/A')
              } />
            </dl>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> {t('emergency_info.key_info', 'Key Information')}</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-2">{t('emergency_info.chronic_conditions', 'Chronic Conditions')}</h3>
              <ul className="list-disc list-inside text-muted-foreground">
                {data.profile.conditions ? data.profile.conditions.split(',').map((c: string) => <li key={c}>{c.trim()}</li>) : <li>{t('emergency_info.none_specified', 'None specified')}</li>}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Pill className="h-5 w-5 text-primary" /> {t('emergency_info.current_medications', 'Current Medications')}</CardTitle>
            </CardHeader>
            <CardContent>
              {data.medications.length > 0 ? (
                <ul className="space-y-3">
                  {data.medications.map((m: Medication) => (
                    <li key={m.id}>
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-sm text-muted-foreground">{m.dosage} - {m.frequency}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">{t('emergency_info.no_medications', 'No medications listed.')}</p>
              )}
            </CardContent>
          </Card>
        </div>
        <footer className="text-center mt-12 text-sm text-muted-foreground">
          <p>{t('emergency_info.confirmed_accurate', 'Information confirmed accurate as of {{date}}.', { date: new Date().toLocaleDateString() })}</p>
          <p className="font-semibold mt-1">{t('emergency_info.powered_by', 'Powered by DocuMedic')}</p>
        </footer>
      </div>
    </div>
  );
};

export default EmergencyInfo;