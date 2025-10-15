import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Pill, Plus, Trash2, Download, Bell } from '../components/icons/Icons';
import { Medication } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { getMedications, addMedication, updateMedication, deleteMedication } from '../services/data';
import { checkMedicationInteractions } from '../services/gemini';

const MedicationTracker: React.FC = () => {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [interactionResult, setInteractionResult] = useState<string | null>(null);
  const [stagedMed, setStagedMed] = useState<Omit<Medication, 'id' | 'takenToday'> | null>(null);
  
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
    // FIX: Explicitly use `window.clearTimeout` to avoid type conflicts with Node.js `clearTimeout`.
    notificationTimeouts.current.forEach(window.clearTimeout);
    notificationTimeouts.current = [];

    if (notificationPermission === 'granted') {
      const now = new Date();
      
      medications.forEach(med => {
        if (med.times && med.times.length > 0) {
          med.times.forEach(time => {
            const [hours, minutes] = time.split(':').map(Number);
            const notificationTime = new Date();
            notificationTime.setHours(hours, minutes, 0, 0);

            if (notificationTime > now) {
              const timeout = notificationTime.getTime() - now.getTime();
              // FIX: Explicitly use `window.setTimeout` to ensure it returns a `number` (timeout ID)
              // as expected in browser environments, resolving a TypeScript type conflict with Node.js's `setTimeout`.
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
      // FIX: Explicitly use `window.clearTimeout` to match the `number` type returned by `window.setTimeout`.
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

  const handleDelete = async (id: string) => {
    if (user) {
      await deleteMedication(user.uid, id);
      await refreshMedications();
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
        setIsModalOpen(false);
        setIsChecking(true);
        const currentMedNames = medications.map(m => m.name);
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
  
  const handleExport = () => {
    if (medications.length === 0) {
      alert("No medication history to export.");
      return;
    }
    const headers = ["ID", "Name", "Dosage", "Frequency", "Taken Today"];
    const csvContent = [
      headers.join(","),
      ...medications.map(m => [m.id, `"${m.name}"`, `"${m.dosage}"`, `"${m.frequency}"`, m.takenToday].join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "medication-history.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const addTime = () => {
    setTimes([...times, '']);
  };

  const removeTime = (index: number) => {
    setTimes(times.filter((_, i) => i !== index));
  };
  
  const openAddModal = () => {
    setTimes(['08:00']);
    setIsModalOpen(true);
  };

  const takenCount = medications.filter(m => m.takenToday).length;
  const totalCount = medications.length;
  const percentage = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading">Medication Tracker</h1>
          <p className="text-muted-foreground">Log your medications and track your adherence.</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" disabled={medications.length === 0}>
                <Download className="mr-2 h-4 w-4" /> Export Data
            </Button>
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" /> Add Medication
            </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5"/>Notification Settings</CardTitle>
            <CardDescription>Get browser alerts when it's time to take your medication. This requires the app to be open in a browser tab.</CardDescription>
          </CardHeader>
          <CardContent>
            {notificationPermission === 'granted' && (
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Notifications are enabled.</p>
            )}
            {notificationPermission === 'default' && (
              <Button onClick={handleEnableNotifications}>Enable Notifications</Button>
            )}
            {notificationPermission === 'denied' && (
              <p className="text-sm font-medium text-destructive">Notifications are blocked. Please enable them in your browser settings to use this feature.</p>
            )}
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Today's Progress</CardTitle>
                 <CardDescription>You've taken {takenCount} of {totalCount} medications today.</CardDescription>
            </CardHeader>
            <CardContent>
                <div 
                    className="w-full bg-secondary rounded-full h-2.5"
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${takenCount} of ${totalCount} medications taken`}
                >
                    <div 
                        className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                  <p className="text-muted-foreground text-center py-10">Loading medications...</p>
              ) : medications.length > 0 ? (
                medications.map(med => (
                  <div key={med.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${med.takenToday ? 'bg-green-500/10' : 'bg-secondary/50'}`}>
                    <div className="flex items-center gap-4">
                      <Pill className={`h-6 w-6 ${med.takenToday ? 'text-green-500' : 'text-primary'}`} />
                      <div>
                        <p className="font-semibold">{med.name} <span className="text-sm font-normal text-muted-foreground">{med.dosage}</span></p>
                        <p className="text-sm text-muted-foreground">{med.frequency}</p>
                        {med.times && med.times.length > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <Bell className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {med.times.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={med.takenToday ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => toggleTaken(med.id)}
                      >
                        {med.takenToday ? 'Mark as Not Taken' : 'Mark as Taken'}
                      </Button>
                      <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-muted-foreground hover:text-destructive" 
                          onClick={() => handleDelete(med.id)}
                          aria-label={`Delete medication for ${med.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No medications added yet. Click 'Add Medication' to start.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal title="Add New Medication" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
         <form className="space-y-4" onSubmit={handleAddMedication}>
            <div>
              <label htmlFor="med-name" className="block text-sm font-medium text-foreground mb-1">Medication Name</label>
              <Input id="med-name" name="med-name" placeholder="e.g., Ibuprofen" required />
            </div>
            <div>
              <label htmlFor="med-dosage" className="block text-sm font-medium text-foreground mb-1">Dosage</label>
              <Input id="med-dosage" name="med-dosage" placeholder="e.g., 200mg" required />
            </div>
            <div>
              <label htmlFor="med-frequency" className="block text-sm font-medium text-foreground mb-1">Frequency</label>
              <Input id="med-frequency" name="med-frequency" placeholder="e.g., Twice a day" required />
            </div>
            
            <div className="p-3 bg-secondary/50 rounded-md">
              <label className="block text-sm font-medium text-foreground mb-2">Notification Times (Optional)</label>
              {notificationPermission !== 'granted' ? (
                <p className="text-xs text-muted-foreground">Enable notifications from the main page to receive alerts.</p>
              ) : (
                <>
                  {times.map((time, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => handleTimeChange(index, e.target.value)}
                        required
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeTime(index)} aria-label="Remove time" className="h-9 w-9">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addTime}>
                    <Plus className="mr-2 h-4 w-4" /> Add Time
                  </Button>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
               <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
               <Button type="submit">Check & Add</Button>
            </div>
         </form>
      </Modal>

      <Modal title="AI Interaction Check" isOpen={isChecking || !!interactionResult} onClose={() => { setInteractionResult(null); setStagedMed(null); }}>
          {isChecking ? (
            <div className="text-center p-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Checking for potential interactions...</p>
            </div>
          ) : interactionResult ? (
             <div className="space-y-4">
                <h3 className="font-bold text-lg text-destructive">Potential Interaction Warning</h3>
                <div className="p-3 bg-destructive/10 rounded-md">
                    <p className="text-sm">{interactionResult}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                    <strong>Disclaimer:</strong> This is an AI-generated analysis and not a substitute for professional medical advice. Please consult your doctor or pharmacist about potential drug interactions.
                </p>
                 <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={() => { setInteractionResult(null); setStagedMed(null); }}>Cancel</Button>
                    <Button variant="destructive" onClick={confirmAddMedication}>Add Anyway</Button>
                </div>
             </div>
          ) : null}
      </Modal>
    </>
  );
};

export default MedicationTracker;