import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { UploadCloud, FileText, Trash2, Download } from '../components/icons/Icons';
import { MedicalRecord } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { getRecords, addRecord, deleteRecord } from '../services/data';

const MedicalRecords: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshRecords = React.useCallback(() => {
    if (user) {
      setRecords(getRecords(user.uid));
    }
  }, [user]);

  useEffect(() => {
    refreshRecords();
  }, [refreshRecords]);

  const handleDelete = (id: string) => {
    if (user) {
      deleteRecord(user.uid, id);
      refreshRecords();
    }
  };

  const handleAddRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get('doc-name') as string;
    const type = formData.get('doc-type') as MedicalRecord['type'];
    const file = (document.getElementById('doc-file') as HTMLInputElement)?.files?.[0];

    if (name && type && file) {
      await addRecord(user.uid, { name, type, file });
      refreshRecords();
      setIsModalOpen(false);
    }
  };

  const handleExport = () => {
    if (records.length === 0) {
      alert("No records to export.");
      return;
    }
    const headers = ["ID", "Name", "Type", "Date"];
    const csvContent = [
      headers.join(","),
      ...records.map(r => [r.id, `"${r.name}"`, r.type, r.date].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "medical-records.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading">Medical Records</h1>
          <p className="text-muted-foreground">Manage your health documents, reports, and prescriptions.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" disabled={records.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <UploadCloud className="mr-2 h-4 w-4" /> Upload Document
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>You have {records.length} documents stored securely.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records.map(record => (
              <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <div className="flex items-center gap-4">
                  <FileText className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold">{record.name}</p>
                    <p className="text-sm text-muted-foreground">{record.type} - {new Date(record.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={record.fileUrl} target="_blank" rel="noopener noreferrer" download={record.name}>View</a>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-muted-foreground hover:text-destructive" 
                    onClick={() => handleDelete(record.id)}
                    aria-label={`Delete record for ${record.name}`}
                   >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
             {records.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No records found. Upload your first document to get started.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Modal title="Upload New Document" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
         <form className="space-y-4" onSubmit={handleAddRecord}>
            <div>
              <label htmlFor="doc-name" className="block text-sm font-medium text-foreground mb-1">Document Name</label>
              <Input id="doc-name" name="doc-name" placeholder="e.g., Annual Check-up Results" required />
            </div>
             <div>
              <label htmlFor="doc-type" className="block text-sm font-medium text-foreground mb-1">Document Type</label>
               <select id="doc-type" name="doc-type" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="Lab Report">Lab Report</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Imaging">Imaging</option>
                  <option value="Consultation Note">Consultation Note</option>
               </select>
            </div>
            <div>
              <label htmlFor="doc-file" className="block text-sm font-medium text-foreground mb-1">File</label>
              <Input id="doc-file" name="doc-file" type="file" required />
            </div>
            <div className="flex justify-end gap-2 pt-2">
               <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
               <Button type="submit">Upload</Button>
            </div>
         </form>
      </Modal>
    </>
  );
};

export default MedicalRecords;
