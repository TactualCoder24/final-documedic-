import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Pill, Plus, Trash2, Download, Bell, Activity } from '../components/icons/Icons';
import { Medication } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { getMedications, addMedication, updateMedication, deleteMedication } from '../services/dataSupabase';
import { checkMedicationInteractions } from '../services/aiService';

const MedicationTracker: React.FC = () => {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [interactionResult, setInteractionResult] = useState<string | null>(null);
  const [stagedMed, setStagedMed] = useState<Omit<Medication, 'id' | 'takenToday' | 'isActive'> | null>(null);

  const [times, setTimes] = useState<string[]>(['08:00']);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const notificationTimeouts = useRef<number[]>([]);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    } else {
      setNotificationPermission('denied');
    }
  }, []);

  useEffect(() => {
    notificationTimeouts.current.forEach(window.clearTimeout);
    notificationTimeouts.current = [];

    if (notificationPermission === 'granted') {
      const now = new Date();

      medications.filter(m => m.isActive).forEach(med => {
        if (med.times && med.times.length > 0) {
          med.times.forEach(time => {
            const [hours, minutes] = time.split(':').map(Number);
            const notificationTime = new Date();
            notificationTime.setHours(hours, minutes, 0, 0);

            if (notificationTime > now) {
              const timeout = notificationTime.getTime() - now.getTime();
              const timeoutId = window.setTimeout(() => {
                new Notification('Medication Reminder', {
                  body: `It's time to take your ${med.name} (${med.dosage}).`,
                  icon: '/vite.svg',
                  badge: '/vite.svg'
                });
              }, timeout);
              notificationTimeouts.current.push(timeoutId);
            }
          });
        }
      });
    }

    return () => {
      notificationTimeouts.current.forEach(window.clearTimeout);
    };
  }, [medications, notificationPermission]);

  const handleEnableNotifications = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  };

  const refreshMedications = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const data = await getMedications(user.uid);
      setMedications(data);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshMedications();
  }, [refreshMedications]);

  const toggleTaken = async (id: string) => {
    if (user) {
      const medToUpdate = medications.find(m => m.id === id);
      if (medToUpdate) {
        await updateMedication(user.uid, { ...medToUpdate, takenToday: !medToUpdate.takenToday });
        await refreshMedications();
      }
    }
  };

  const handleReportNotTaking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (user) {
      const formData = new FormData(e.currentTarget);
      const medId = formData.get('med-id') as string;
      const medToUpdate = medications.find(m => m.id === medId);
      if (medToUpdate) {
        await updateMedication(user.uid, { ...medToUpdate, isActive: false });
        await refreshMedications();
      }
      setIsReportModalOpen(false);
    }
  };

  const handleAddMedication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const newMed = {
      name: formData.get('med-name') as string,
      dosage: formData.get('med-dosage') as string,
      frequency: formData.get('med-frequency') as string,
      times: times.filter(t => t),
    };

    if (newMed.name && newMed.dosage && newMed.frequency) {
      setStagedMed(newMed);
      setIsAddModalOpen(false);
      setIsChecking(true);
      const currentMedNames = medications.filter(m => m.isActive).map(m => m.name);
      const result = await checkMedicationInteractions([...currentMedNames, newMed.name]);

      if (result.includes("No significant interactions found.")) {
        await addMedication(user.uid, newMed);
        await refreshMedications();
        setStagedMed(null);
      } else {
        setInteractionResult(result);
      }
      setIsChecking(false);
    }
  };

  const confirmAddMedication = async () => {
    if (user && stagedMed) {
      await addMedication(user.uid, stagedMed);
      await refreshMedications();
    }
    setInteractionResult(null);
    setStagedMed(null);
  }

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const addTime = () => setTimes([...times, '']);
  const removeTime = (index: number) => setTimes(times.filter((_, i) => i !== index));

  const openAddModal = () => {
    setTimes(['08:00']);
    setIsAddModalOpen(true);
  };

  const activeMedications = medications.filter(m => m.isActive);
  const inactiveMedications = medications.filter(m => !m.isActive);
  const takenCount = activeMedications.filter(m => m.takenToday).length;
  const totalCount = activeMedications.length;
  const percentage = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-bold font-heading">Medications</h1>
          <p className="text-muted-foreground mt-1">Log your medications and track your adherence.</p>
        </div>
        <Button onClick={openAddModal} variant="gradient">
          <Plus className="mr-2 h-4 w-4" /> Add Medication
        </Button>
      </div>

      <div className="space-y-6">
        <Card variant="gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />Notification Settings</CardTitle>
          </CardHeader>
          <CardContent>
            {notificationPermission === 'granted' && <p className="text-sm font-medium text-success flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>Notifications are enabled.</p>}
            {notificationPermission === 'default' && <Button onClick={handleEnableNotifications} variant="gradient"><Bell className="mr-2 h-4 w-4" />Enable Notifications</Button>}
            {notificationPermission === 'denied' && <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">Notifications are blocked in your browser settings.</p>}
          </CardContent>
        </Card>

        <Card variant="premium" className="bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Today's Progress
            </CardTitle>
            <CardDescription>You've taken <span className="font-bold text-foreground">{takenCount}</span> of <span className="font-bold text-foreground">{totalCount}</span> medications today.</CardDescription>
          </CardHeader>
          <CardContent>
            <div role="progressbar" aria-valuenow={percentage} className="w-full bg-secondary rounded-full h-3 overflow-hidden shadow-inner">
              <div className="gradient-primary h-3 rounded-full transition-all duration-500 shadow-lg" style={{ width: `${percentage}%` }}></div>
            </div>
            <p className="text-center mt-3 text-sm font-semibold text-primary">{Math.round(percentage)}% Complete</p>
          </CardContent>
        </Card>

        <Card variant="premium">
          <CardHeader className="flex-row justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Your Active Medications
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setIsReportModalOpen(true)} className="hover:border-warning hover:text-warning">Report Not Taking</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (<p className="text-muted-foreground text-center py-10">Loading medications...</p>
              ) : activeMedications.length > 0 ? (
                activeMedications.map(med => (
                  <div key={med.id} className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 border-2 ${med.takenToday ? 'bg-success/10 border-success/30 shadow-sm' : 'bg-secondary/50 border-border hover:border-primary/50'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${med.takenToday ? 'bg-success/20' : 'bg-primary/10'}`}>
                        <Pill className={`h-6 w-6 ${med.takenToday ? 'text-success' : 'text-primary'}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{med.name} <span className="text-sm font-normal text-muted-foreground ml-2">{med.dosage}</span></p>
                        <p className="text-sm text-muted-foreground">{med.frequency}</p>
                        {med.times && med.times.length > 0 && (<div className="flex items-center gap-2 mt-1"><Bell className="h-3 w-3 text-muted-foreground" /><p className="text-xs text-muted-foreground">{med.times.join(', ')}</p></div>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant={med.takenToday ? 'outline' : 'gradient'} size="sm" onClick={() => toggleTaken(med.id)} className="transition-all">{med.takenToday ? 'Mark as Not Taken' : 'Mark as Taken'}</Button>
                    </div>
                  </div>
                ))
              ) : (<div className="text-center py-10"><p className="text-muted-foreground">No active medications added yet.</p></div>)}
            </div>
          </CardContent>
          {inactiveMedications.length > 0 && (
            <>
              <CardHeader>
                <CardTitle>Inactive Medications</CardTitle>
                <CardDescription>Medications you have reported you are no longer taking.</CardDescription>
              </CardHeader>
              <CardContent>
                {inactiveMedications.map(med => (
                  <div key={med.id} className="flex items-center p-3 rounded-lg bg-secondary/30 opacity-60">
                    <p className="font-semibold">{med.name}</p>
                  </div>
                ))}
              </CardContent>
            </>
          )}
        </Card>
      </div>

      <Modal title="Add New Medication" isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <form className="space-y-4" onSubmit={handleAddMedication}>
          <div><label htmlFor="med-name" className="block text-sm font-medium text-foreground mb-1">Medication Name</label><Input id="med-name" name="med-name" placeholder="e.g., Ibuprofen" required /></div>
          <div><label htmlFor="med-dosage" className="block text-sm font-medium text-foreground mb-1">Dosage</label><Input id="med-dosage" name="med-dosage" placeholder="e.g., 200mg" required /></div>
          <div><label htmlFor="med-frequency" className="block text-sm font-medium text-foreground mb-1">Frequency</label><Input id="med-frequency" name="med-frequency" placeholder="e.g., Twice a day" required /></div>
          <div className="p-3 bg-secondary/50 rounded-md">
            <label className="block text-sm font-medium text-foreground mb-2">Notification Times</label>
            {notificationPermission !== 'granted' ? (<p className="text-xs text-muted-foreground">Enable notifications to receive alerts.</p>) : (
              <>
                {times.map((time, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <Input type="time" value={time} onChange={(e) => handleTimeChange(index, e.target.value)} required />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeTime(index)} aria-label="Remove time" className="h-9 w-9"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addTime}><Plus className="mr-2 h-4 w-4" /> Add Time</Button>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button><Button type="submit">Check & Add</Button></div>
        </form>
      </Modal>

      <Modal title="Report Medication" isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)}>
        <form className="space-y-4" onSubmit={handleReportNotTaking}>
          <div>
            <label htmlFor="med-id" className="block text-sm font-medium text-foreground mb-1">Which medication are you no longer taking?</label>
            <select id="med-id" name="med-id" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {activeMedications.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <p className="text-xs text-muted-foreground">This will move the medication to an inactive list. It will not be permanently deleted.</p>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => setIsReportModalOpen(false)}>Cancel</Button><Button type="submit">Confirm</Button></div>
        </form>
      </Modal>

      <Modal title="AI Interaction Check" isOpen={isChecking || !!interactionResult} onClose={() => { setInteractionResult(null); setStagedMed(null); }}>
        {isChecking ? (
          <div className="text-center p-8"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-muted-foreground">Checking for potential interactions...</p></div>
        ) : interactionResult ? (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-destructive">Potential Interaction Warning</h3>
            <div className="p-3 bg-destructive/10 rounded-md"><p className="text-sm">{interactionResult}</p></div>
            <p className="text-xs text-muted-foreground"><strong>Disclaimer:</strong> This is an AI-generated analysis and not a substitute for professional medical advice. Please consult your doctor or pharmacist.</p>
            <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={() => { setInteractionResult(null); setStagedMed(null); }}>Cancel</Button><Button variant="destructive" onClick={confirmAddMedication}>Add Anyway</Button></div>
          </div>
        ) : null}
      </Modal>
    </>
  );
};

export default MedicationTracker;