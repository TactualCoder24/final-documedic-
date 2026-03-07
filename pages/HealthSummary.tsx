import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ClipboardCheck, Plus, Syringe, TestTube2, HeartPulse } from '../components/icons/Icons';
import { Allergy, HealthIssue, Immunization, Profile, TestResult, Vital } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import {
  getAllergies, addAllergy,
  getHealthIssues, addHealthIssue,
  getImmunizations, addImmunization,
  getProfile, saveProfile,
  getTestResults, getVitals
} from '../services/dataSupabase';
import { useTranslation } from 'react-i18next';

const HealthSummary: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [healthIssues, setHealthIssues] = useState<HealthIssue[]>([]);
  const [immunizations, setImmunizations] = useState<Immunization[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalType, setModalType] = useState<'allergy' | 'issue' | 'immunization' | 'history' | null>(null);

  const refreshData = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const [allergiesData, issuesData, immunizationsData, profileData, testsData, vitalsData] = await Promise.all([
        getAllergies(user.uid),
        getHealthIssues(user.uid),
        getImmunizations(user.uid),
        getProfile(user.uid),
        getTestResults(user.uid),
        getVitals(user.uid),
      ]);
      setAllergies(allergiesData);
      setHealthIssues(issuesData);
      setImmunizations(immunizationsData);
      setProfile(profileData);
      setTestResults(testsData);
      setVitals(vitalsData);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleAddAllergy = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    await addAllergy(user.uid, {
      name: formData.get('name') as string,
      reaction: formData.get('reaction') as string,
      severity: formData.get('severity') as 'Mild' | 'Moderate' | 'Severe',
    });
    await refreshData();
    setModalType(null);
  };

  const handleAddHealthIssue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    await addHealthIssue(user.uid, {
      name: formData.get('name') as string,
      onset_date: formData.get('onset_date') as string,
    });
    await refreshData();
    setModalType(null);
  };

  const handleAddImmunization = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    await addImmunization(user.uid, {
      name: formData.get('name') as string,
      date: formData.get('date') as string,
      provider: formData.get('provider') as string,
    });
    await refreshData();
    setModalType(null);
  };

  const handleSaveHistory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !profile) return;
    const formData = new FormData(e.currentTarget);
    const updatedProfile = {
      ...profile,
      personalHistory: formData.get('personal_history') as string,
      familyHistory: formData.get('family_history') as string,
    };
    await saveProfile(user.uid, updatedProfile);
    await refreshData();
    setModalType(null);
  };

  const getSeverityColor = (severity: Allergy['severity']) => {
    switch (severity) {
      case 'Severe': return 'text-red-500 bg-red-500/10';
      case 'Moderate': return 'text-yellow-500 bg-yellow-500/10';
      case 'Mild': return 'text-green-500 bg-green-500/10';
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading">{t('summary.title', 'Health Summary')}</h1>
        <p className="text-muted-foreground">{t('summary.subtitle', 'A comprehensive overview of your health information.')}</p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader className="flex-row justify-between items-center">
            <div><CardTitle>{t('summary.allergies', 'Allergies')}</CardTitle><CardDescription>{t('summary.allergies_desc', 'Known allergies and reactions.')}</CardDescription></div>
            <Button variant="outline" size="sm" onClick={() => setModalType('allergy')}><Plus className="mr-2 h-4 w-4" /> {t('summary.add_allergy', 'Add Allergy')}</Button>
          </CardHeader>
          <CardContent>
            {allergies.length > 0 ? (
              <ul className="space-y-3">
                {allergies.map(a => <li key={a.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div><p className="font-semibold">{a.name}</p><p className="text-sm text-muted-foreground">{a.reaction}</p></div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getSeverityColor(a.severity)}`}>{t(`summary.severity.${a.severity.toLowerCase()}`, a.severity)}</span>
                </li>)}
              </ul>
            ) : <p className="text-center text-muted-foreground py-4">{t('summary.no_allergies', 'No allergies reported.')}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row justify-between items-center">
            <div><CardTitle>{t('summary.health_issues', 'Current Health Issues')}</CardTitle><CardDescription>{t('summary.health_issues_desc', 'Ongoing medical conditions.')}</CardDescription></div>
            <Button variant="outline" size="sm" onClick={() => setModalType('issue')}><Plus className="mr-2 h-4 w-4" /> {t('summary.add_issue', 'Add Issue')}</Button>
          </CardHeader>
          <CardContent>
            {healthIssues.length > 0 ? (
              <ul className="space-y-3">
                {healthIssues.map(i => <li key={i.id} className="p-3 bg-secondary/50 rounded-lg">
                  <p className="font-semibold">{i.name}</p><p className="text-sm text-muted-foreground">{t('summary.onset', 'Onset')}: {i.onset_date}</p>
                </li>)}
              </ul>
            ) : <p className="text-center text-muted-foreground py-4">{t('summary.no_issues', 'No health issues reported.')}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row justify-between items-center">
            <div><CardTitle>{t('summary.immunizations', 'Immunizations')}</CardTitle><CardDescription>{t('summary.immunizations_desc', 'Your vaccination history.')}</CardDescription></div>
            <Button variant="outline" size="sm" onClick={() => setModalType('immunization')}><Plus className="mr-2 h-4 w-4" /> {t('summary.add_record', 'Add Record')}</Button>
          </CardHeader>
          <CardContent>
            {immunizations.length > 0 ? (
              <ul className="space-y-3">
                {immunizations.map(i => <li key={i.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3"><Syringe className="h-5 w-5 text-primary" /><p className="font-semibold">{i.name}</p></div>
                  <p className="text-sm text-muted-foreground">{i.date}</p>
                </li>)}
              </ul>
            ) : <p className="text-center text-muted-foreground py-4">{t('summary.no_immunizations', 'No immunization records found.')}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row justify-between items-center">
            <div><CardTitle>{t('summary.medical_history', 'Medical History')}</CardTitle><CardDescription>{t('summary.medical_history_desc', 'Your personal and family medical history.')}</CardDescription></div>
            <Button variant="outline" size="sm" onClick={() => setModalType('history')}>{t('summary.edit_history', 'Edit History')}</Button>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div><h3 className="font-semibold mb-2">{t('summary.personal_history', 'Personal History')}</h3><p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile?.personalHistory || t('summary.not_recorded', 'Not recorded.')}</p></div>
            <div><h3 className="font-semibold mb-2">{t('summary.family_history', 'Family History')}</h3><p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile?.familyHistory || t('summary.not_recorded', 'Not recorded.')}</p></div>
          </CardContent>
        </Card>

        {/* Recent Test Results */}
        <Card>
          <CardHeader>
            <div><CardTitle className="flex items-center gap-2"><TestTube2 className="h-5 w-5 text-primary" />{t('summary.test_results', 'Recent Test Results')}</CardTitle><CardDescription>{t('summary.test_results_desc', 'Your latest lab and diagnostic results.')}</CardDescription></div>
          </CardHeader>
          <CardContent>
            {testResults.length > 0 ? (
              <ul className="space-y-3">
                {testResults.slice(0, 5).map(tr => (
                  <li key={tr.id} className="p-3 bg-secondary/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{tr.name}</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${tr.status === 'Final' ? 'bg-green-500/20 text-green-600' : 'bg-yellow-500/20 text-yellow-600'}`}>{tr.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{tr.date} · {tr.provider}</p>
                    {tr.details.filter(d => d.isAbnormal).length > 0 && (
                      <div className="mt-2 space-y-1">
                        {tr.details.filter(d => d.isAbnormal).map((d, i) => (
                          <p key={i} className="text-xs text-destructive">⚠️ {d.name}: {d.value} (ref: {d.referenceRange})</p>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : <p className="text-center text-muted-foreground py-4">{t('summary.no_tests', 'No test results found.')}</p>}
          </CardContent>
        </Card>

        {/* Latest Vitals */}
        <Card>
          <CardHeader>
            <div><CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5 text-red-500" />{t('summary.latest_vitals', 'Latest Vitals')}</CardTitle><CardDescription>{t('summary.latest_vitals_desc', 'Your most recent vital sign readings.')}</CardDescription></div>
          </CardHeader>
          <CardContent>
            {vitals.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {(() => {
                  const latest = vitals[vitals.length - 1]; return (
                    <>
                      <div className="text-center p-3 bg-secondary/50 rounded-lg">
                        <p className="text-2xl font-bold text-red-500">{latest.systolic && latest.diastolic ? `${latest.systolic}/${latest.diastolic}` : '—'}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t('summary.bp', 'Blood Pressure')}</p>
                      </div>
                      <div className="text-center p-3 bg-secondary/50 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{latest.sugar || '—'}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t('summary.blood_sugar', 'Blood Sugar (mg/dL)')}</p>
                      </div>
                      <div className="text-center p-3 bg-secondary/50 rounded-lg">
                        <p className="text-2xl font-bold text-muted-foreground">{latest.date}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t('summary.recorded_on', 'Recorded On')}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : <p className="text-center text-muted-foreground py-4">{t('summary.no_vitals', 'No vitals recorded yet.')}</p>}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={!!modalType} onClose={() => setModalType(null)} title={
        modalType === 'allergy' ? t('summary.add_allergy_title', 'Add Allergy') :
          modalType === 'issue' ? t('summary.add_issue_title', 'Add Health Issue') :
            modalType === 'immunization' ? t('summary.add_imm_title', 'Add Immunization') : t('summary.edit_hist_title', 'Edit Medical History')
      }>
        {modalType === 'allergy' && <form onSubmit={handleAddAllergy} className="space-y-4">
          <div><label htmlFor="name" className="block text-sm font-medium">{t('summary.allergen_label', 'Allergen')}</label><Input id="name" name="name" required placeholder={t('summary.allergen_placeholder', 'e.g., Peanuts')} /></div>
          <div><label htmlFor="reaction" className="block text-sm font-medium">{t('summary.reaction_label', 'Reaction')}</label><Input id="reaction" name="reaction" required placeholder={t('summary.reaction_placeholder', 'e.g., Hives')} /></div>
          <div><label htmlFor="severity" className="block text-sm font-medium">{t('summary.severity_label', 'Severity')}</label><select id="severity" name="severity" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="Mild">{t('summary.severity.mild', 'Mild')}</option><option value="Moderate">{t('summary.severity.moderate', 'Moderate')}</option><option value="Severe">{t('summary.severity.severe', 'Severe')}</option></select></div>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => setModalType(null)}>{t('common.cancel', 'Cancel')}</Button><Button type="submit">{t('common.save', 'Save')}</Button></div>
        </form>}
        {modalType === 'issue' && <form onSubmit={handleAddHealthIssue} className="space-y-4">
          <div><label htmlFor="name" className="block text-sm font-medium">{t('summary.issue_label', 'Health Issue')}</label><Input id="name" name="name" required placeholder={t('summary.issue_placeholder', 'e.g., Hypertension')} /></div>
          <div><label htmlFor="onset_date" className="block text-sm font-medium">{t('summary.onset_label', 'Approximate Onset Date')}</label><Input id="onset_date" name="onset_date" type="date" required /></div>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => setModalType(null)}>{t('common.cancel', 'Cancel')}</Button><Button type="submit">{t('common.save', 'Save')}</Button></div>
        </form>}
        {modalType === 'immunization' && <form onSubmit={handleAddImmunization} className="space-y-4">
          <div><label htmlFor="name" className="block text-sm font-medium">{t('summary.vaccine_label', 'Vaccine Name')}</label><Input id="name" name="name" required placeholder={t('summary.vaccine_placeholder', 'e.g., Influenza')} /></div>
          <div><label htmlFor="date" className="block text-sm font-medium">{t('summary.date_admin_label', 'Date Administered')}</label><Input id="date" name="date" type="date" required /></div>
          <div><label htmlFor="provider" className="block text-sm font-medium">{t('summary.provider_label', 'Provider/Clinic')}</label><Input id="provider" name="provider" placeholder={t('summary.provider_placeholder', 'e.g., City Clinic')} /></div>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => setModalType(null)}>{t('common.cancel', 'Cancel')}</Button><Button type="submit">{t('common.save', 'Save')}</Button></div>
        </form>}
        {modalType === 'history' && <form onSubmit={handleSaveHistory} className="space-y-4">
          <div><label htmlFor="personal_history" className="block text-sm font-medium">{t('summary.personal_history', 'Personal History')}</label><textarea id="personal_history" name="personal_history" rows={4} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue={profile?.personalHistory || ''}></textarea></div>
          <div><label htmlFor="family_history" className="block text-sm font-medium">{t('summary.family_history', 'Family History')}</label><textarea id="family_history" name="family_history" rows={4} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue={profile?.familyHistory || ''}></textarea></div>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => setModalType(null)}>{t('common.cancel', 'Cancel')}</Button><Button type="submit">{t('common.save', 'Save History')}</Button></div>
        </form>}
      </Modal>
    </>
  );
};

export default HealthSummary;