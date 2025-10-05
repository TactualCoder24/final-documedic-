import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { UploadCloud, FileText, Trash2, Download } from '../components/icons/Icons';
import { MedicalRecord } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const mockRecords: MedicalRecord[] = [
  { id: 'rec1', name: 'Annual Blood Panel', type: 'Lab Report', date: '2023-10-15', fileUrl: '#' },
  { id: 'rec2', name: 'MRI Scan - Left Knee', type: 'Imaging', date: '2023-09-22', fileUrl: '#' },
  { id: 'rec3', name: 'Amoxicillin Prescription', type: 'Prescription', date: '2023-08-01', fileUrl: '#' },
  { id: 'rec4', name: 'Cardiology Follow-up', type: 'Consultation Note', date: '2023-07-19', fileUrl: '#' },
];

const MedicalRecords: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>(mockRecords);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = (id: string) => {
    setRecords(records.filter(record => record.id !== id));
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
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = "medical-records.csv";
    link.style.visibility = 'hidden';
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
                    <p className="text-sm text-muted-foreground">{record.type} - {record.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={record.fileUrl} target="_blank" rel="noopener noreferrer">View</a>
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
         <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
            <div>
              <label htmlFor="doc-name" className="block text-sm font-medium text-foreground mb-1">Document Name</label>
              <Input id="doc-name" placeholder="e.g., Annual Check-up Results" required />
            </div>
             <div>
              <label htmlFor="doc-type" className="block text-sm font-medium text-foreground mb-1">Document Type</label>
               <select id="doc-type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Lab Report</option>
                  <option>Prescription</option>
                  <option>Imaging</option>
                  <option>Consultation Note</option>
               </select>
            </div>
            <div>
              <label htmlFor="doc-file" className="block text-sm font-medium text-foreground mb-1">File</label>
              <Input id="doc-file" type="file" required />
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