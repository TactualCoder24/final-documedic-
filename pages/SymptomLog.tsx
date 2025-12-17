import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Activity, Plus, Trash2 } from '../components/icons/Icons';
import { Symptom } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { getSymptoms, addSymptom, deleteSymptom } from '../services/dataSupabase';

const SeverityIndicator: React.FC<{ level: number }> = ({ level }) => {
  const getColor = () => {
    if (level <= 3) return 'bg-green-500';
    if (level <= 7) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-muted rounded-full">
        <div className={`h-2 rounded-full ${getColor()}`} style={{ width: `${level * 10}%` }}></div>
      </div>
      <span className="text-sm font-semibold w-8 text-right">{level}/10</span>
    </div>
  );
};

const SymptomLog: React.FC = () => {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [severity, setSeverity] = useState(5);

  const refreshSymptoms = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const data = await getSymptoms(user.uid);
      setSymptoms(data);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshSymptoms();
  }, [refreshSymptoms]);

  const handleDelete = async (id: string) => {
    if (user) {
      await deleteSymptom(user.uid, id);
      await refreshSymptoms();
    }
  };

  const handleAddSymptom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    const newSymptom = {
        name: formData.get('symptom-name') as string,
        severity: parseInt(formData.get('symptom-severity') as string, 10),
        notes: formData.get('symptom-notes') as string,
        date: new Date().toISOString(),
    };
    if (newSymptom.name) {
        await addSymptom(user.uid, newSymptom);
        await refreshSymptoms();
        setIsModalOpen(false);
    }
  };
  
  const openAddModal = () => {
    setSeverity(5);
    setIsModalOpen(true);
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading">Symptom Log</h1>
          <p className="text-muted-foreground">Track how you're feeling day-to-day.</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" /> Log Symptom
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Logged Symptoms</CardTitle>
          {!isLoading && <CardDescription>You have logged {symptoms.length} symptoms.</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
                <p className="text-muted-foreground text-center py-10">Loading symptoms...</p>
            ) : symptoms.length > 0 ? (
                symptoms.map(symptom => (
                <div key={symptom.id} className="flex items-start justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-start gap-4">
                    <div className="mt-1">
                        <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <p className="font-semibold">{symptom.name}</p>
                            <SeverityIndicator level={symptom.severity} />
                        </div>
                        <p className="text-sm text-muted-foreground">{new Date(symptom.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        {symptom.notes && <p className="text-sm text-foreground mt-1 italic">"{symptom.notes}"</p>}
                    </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-muted-foreground hover:text-destructive flex-shrink-0" 
                        onClick={() => handleDelete(symptom.id)}
                        aria-label={`Delete symptom log for ${symptom.name}`}
                    >
                    <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                ))
            ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No symptoms logged yet. Track how you feel to get started.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal title="Log New Symptom" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
         <form className="space-y-4" onSubmit={handleAddSymptom}>
            <div>
              <label htmlFor="symptom-name" className="block text-sm font-medium text-foreground mb-1">Symptom Name</label>
              <Input id="symptom-name" name="symptom-name" placeholder="e.g., Headache, Fatigue" required />
            </div>
            <div>
              <label htmlFor="symptom-severity" className="block text-sm font-medium text-foreground mb-1">Severity: <span className="font-bold">{severity}/10</span></label>
              <input 
                id="symptom-severity" 
                name="symptom-severity" 
                type="range" 
                min="1" 
                max="10" 
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
               <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Severe</span>
                </div>
            </div>
            <div>
              <label htmlFor="symptom-notes" className="block text-sm font-medium text-foreground mb-1">Notes (Optional)</label>
              <Input id="symptom-notes" name="symptom-notes" placeholder="e.g., Dull ache behind eyes" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
               <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
               <Button type="submit">Log Symptom</Button>
            </div>
         </form>
      </Modal>
    </>
  );
};

export default SymptomLog;