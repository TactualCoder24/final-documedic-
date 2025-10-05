import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Pill, Plus, Trash2, Download } from '../components/icons/Icons';
import { Medication } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const mockMedications: Medication[] = [
  { id: 'med1', name: 'Lisinopril', dosage: '10mg', frequency: 'Once a day', takenToday: false },
  { id: 'med2', name: 'Metformin', dosage: '500mg', frequency: 'Twice a day', takenToday: true },
  { id: 'med3', name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime', takenToday: false },
];

const MedicationTracker: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>(mockMedications);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleTaken = (id: string) => {
    setMedications(
      medications.map(med =>
        med.id === id ? { ...med, takenToday: !med.takenToday } : med
      )
    );
  };

  const handleDelete = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };
  
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
    if (link.href) {
        URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = "medication-history.csv";
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const takenCount = medications.filter(m => m.takenToday).length;
  const totalCount = medications.length;

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
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Medication
            </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Today's Progress</CardTitle>
                 <CardDescription>You've taken {takenCount} of {totalCount} medications today.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full bg-secondary rounded-full h-2.5">
                    <div 
                        className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${totalCount > 0 ? (takenCount / totalCount) * 100 : 0}%` }}
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
              {medications.map(med => (
                <div key={med.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${med.takenToday ? 'bg-green-500/10' : 'bg-secondary/50'}`}>
                  <div className="flex items-center gap-4">
                    <Pill className={`h-6 w-6 ${med.takenToday ? 'text-green-500' : 'text-primary'}`} />
                    <div>
                      <p className="font-semibold">{med.name} <span className="text-sm font-normal text-muted-foreground">{med.dosage}</span></p>
                      <p className="text-sm text-muted-foreground">{med.frequency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={med.takenToday ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => toggleTaken(med.id)}
                    >
                      {/* FIX: Corrected button text to be dynamic based on taken state. */}
                      {med.takenToday ? 'Mark as Not Taken' : 'Mark as Taken'}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(med.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {medications.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No medications added yet. Click 'Add Medication' to start.</p>
                </div>
            )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal title="Add New Medication" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
         <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Medication Name</label>
              <Input placeholder="e.g., Ibuprofen" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Dosage</label>
              <Input placeholder="e.g., 200mg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Frequency</label>
              <Input placeholder="e.g., Twice a day" required />
            </div>
            <div className="flex justify-end gap-2 pt-2">
               <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
               <Button type="submit">Add Medication</Button>
            </div>
         </form>
      </Modal>
    </>
  );
};

export default MedicationTracker;