import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ClipboardCheck, Plus, Syringe } from '../components/icons/Icons';
import { Allergy, HealthIssue, Immunization, Profile } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { 
    getAllergies, addAllergy, 
    getHealthIssues, addHealthIssue, 
    getImmunizations, addImmunization,
    getProfile, saveProfile
} from '../services/dataSupabase';

const HealthSummary: React.FC = () => {
  const { user } = useAuth();
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [healthIssues, setHealthIssues] = useState<HealthIssue[]>([]);
  const [immunizations, setImmunizations] = useState<Immunization[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [modalType, setModalType] = useState<'allergy' | 'issue' | 'immunization' | 'history' | null>(null);

  const refreshData = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const [allergiesData, issuesData, immunizationsData, profileData] = await Promise.all([
        getAllergies(user.uid),
        getHealthIssues(user.uid),
        getImmunizations(user.uid),
        getProfile(user.uid),
      ]);
      setAllergies(allergiesData);
      setHealthIssues(issuesData);
      setImmunizations(immunizationsData);
      setProfile(profileData);
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
        <h1 className="text-3xl font-bold font-heading">Health Summary</h1>
        <p className="text-muted-foreground">A comprehensive overview of your health information.</p>
      </div>

      <div className="space-y-8">
        <Card>
            <CardHeader className="flex-row justify-between items-center">
                <div><CardTitle>Allergies</CardTitle><CardDescription>Known allergies and reactions.</CardDescription></div>
                <Button variant="outline" size="sm" onClick={() => setModalType('allergy')}><Plus className="mr-2 h-4 w-4" /> Add Allergy</Button>
            </CardHeader>
            <CardContent>
                {allergies.length > 0 ? (
                    <ul className="space-y-3">
                        {allergies.map(a => <li key={a.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                            <div><p className="font-semibold">{a.name}</p><p className="text-sm text-muted-foreground">{a.reaction}</p></div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getSeverityColor(a.severity)}`}>{a.severity}</span>
                        </li>)}
                    </ul>
                ) : <p className="text-center text-muted-foreground py-4">No allergies reported.</p>}
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex-row justify-between items-center">
                <div><CardTitle>Current Health Issues</CardTitle><CardDescription>Ongoing medical conditions.</CardDescription></div>
                <Button variant="outline" size="sm" onClick={() => setModalType('issue')}><Plus className="mr-2 h-4 w-4" /> Add Issue</Button>
            </CardHeader>
            <CardContent>
                 {healthIssues.length > 0 ? (
                    <ul className="space-y-3">
                        {healthIssues.map(i => <li key={i.id} className="p-3 bg-secondary/50 rounded-lg">
                            <p className="font-semibold">{i.name}</p><p className="text-sm text-muted-foreground">Onset: {i.onset_date}</p>
                        </li>)}
                    </ul>
                ) : <p className="text-center text-muted-foreground py-4">No health issues reported.</p>}
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex-row justify-between items-center">
                <div><CardTitle>Immunizations</CardTitle><CardDescription>Your vaccination history.</CardDescription></div>
                <Button variant="outline" size="sm" onClick={() => setModalType('immunization')}><Plus className="mr-2 h-4 w-4" /> Add Record</Button>
            </CardHeader>
            <CardContent>
                {immunizations.length > 0 ? (
                    <ul className="space-y-3">
                        {immunizations.map(i => <li key={i.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                            <div className="flex items-center gap-3"><Syringe className="h-5 w-5 text-primary"/><p className="font-semibold">{i.name}</p></div>
                            <p className="text-sm text-muted-foreground">{i.date}</p>
                        </li>)}
                    </ul>
                ) : <p className="text-center text-muted-foreground py-4">No immunization records found.</p>}
            </CardContent>
        </Card>

         <Card>
            <CardHeader className="flex-row justify-between items-center">
                <div><CardTitle>Medical History</CardTitle><CardDescription>Your personal and family medical history.</CardDescription></div>
                <Button variant="outline" size="sm" onClick={() => setModalType('history')}>Edit History</Button>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <div><h3 className="font-semibold mb-2">Personal History</h3><p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile?.personalHistory || 'Not recorded.'}</p></div>
                <div><h3 className="font-semibold mb-2">Family History</h3><p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile?.familyHistory || 'Not recorded.'}</p></div>
            </CardContent>
        </Card>
      </div>

      <Modal isOpen={!!modalType} onClose={() => setModalType(null)} title={
        modalType === 'allergy' ? 'Add Allergy' :
        modalType === 'issue' ? 'Add Health Issue' :
        modalType === 'immunization' ? 'Add Immunization' : 'Edit Medical History'
      }>
        {modalType === 'allergy' && <form onSubmit={handleAddAllergy} className="space-y-4">
            <div><label htmlFor="name" className="block text-sm font-medium">Allergen</label><Input id="name" name="name" required placeholder="e.g., Peanuts"/></div>
            <div><label htmlFor="reaction" className="block text-sm font-medium">Reaction</label><Input id="reaction" name="reaction" required placeholder="e.g., Hives"/></div>
            <div><label htmlFor="severity" className="block text-sm font-medium">Severity</label><select id="severity" name="severity" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option>Mild</option><option>Moderate</option><option>Severe</option></select></div>
            <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => setModalType(null)}>Cancel</Button><Button type="submit">Save</Button></div>
        </form>}
        {modalType === 'issue' && <form onSubmit={handleAddHealthIssue} className="space-y-4">
            <div><label htmlFor="name" className="block text-sm font-medium">Health Issue</label><Input id="name" name="name" required placeholder="e.g., Hypertension"/></div>
            <div><label htmlFor="onset_date" className="block text-sm font-medium">Approximate Onset Date</label><Input id="onset_date" name="onset_date" type="date" required/></div>
            <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => setModalType(null)}>Cancel</Button><Button type="submit">Save</Button></div>
        </form>}
        {modalType === 'immunization' && <form onSubmit={handleAddImmunization} className="space-y-4">
            <div><label htmlFor="name" className="block text-sm font-medium">Vaccine Name</label><Input id="name" name="name" required placeholder="e.g., Influenza"/></div>
            <div><label htmlFor="date" className="block text-sm font-medium">Date Administered</label><Input id="date" name="date" type="date" required/></div>
            <div><label htmlFor="provider" className="block text-sm font-medium">Provider/Clinic</label><Input id="provider" name="provider" placeholder="e.g., City Clinic"/></div>
            <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => setModalType(null)}>Cancel</Button><Button type="submit">Save</Button></div>
        </form>}
        {modalType === 'history' && <form onSubmit={handleSaveHistory} className="space-y-4">
            <div><label htmlFor="personal_history" className="block text-sm font-medium">Personal History</label><textarea id="personal_history" name="personal_history" rows={4} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue={profile?.personalHistory || ''}></textarea></div>
            <div><label htmlFor="family_history" className="block text-sm font-medium">Family History</label><textarea id="family_history" name="family_history" rows={4} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue={profile?.familyHistory || ''}></textarea></div>
            <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => setModalType(null)}>Cancel</Button><Button type="submit">Save History</Button></div>
        </form>}
      </Modal>
    </>
  );
};

export default HealthSummary;