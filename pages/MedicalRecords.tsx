import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { UploadCloud, FileText, Trash2, Download, Sparkles } from '../components/icons/Icons';
import { MedicalRecord, DocumentAnalysis } from '../types';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { getRecords, addRecord, deleteRecord } from '../services/dataSupabase';
import { analyzeMedicalDocument } from '../services/gemini';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

type FilterType = 'All' | MedicalRecord['type'];

const MedicalRecords: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<MedicalRecord['type']>('Lab Report');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const refreshRecords = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const data = await getRecords(user.uid);
      setRecords(data);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshRecords();
  }, [refreshRecords]);

  const openUploadModal = () => {
    setSelectedDocType('Lab Report');
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (user) {
      await deleteRecord(user.uid, id);
      await refreshRecords();
    }
  };

  const handleAddRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || isUploading) return; // Prevent duplicate submissions

    const formData = new FormData(e.currentTarget);
    const name = formData.get('doc-name') as string;
    const type = formData.get('doc-type') as MedicalRecord['type'];
    const file = (document.getElementById('doc-file') as HTMLInputElement)?.files?.[0];
    const shouldAnalyze = (formData.get('analyze-doc') as string) === 'on';

    if (name && type && file) {
      setIsUploading(true); // Set uploading state

      if (shouldAnalyze && file.type.startsWith('image/')) {
        setIsAnalyzing(true);
        setAnalysisError(null);
        handleModalClose();

        try {
          const base64Image = await fileToBase64(file);
          const result = await analyzeMedicalDocument(base64Image, file.type);

          if (result) {
            await addRecord(user.uid, { name, type, file }, result);
            setAnalysisResult(result);
          } else {
            // Save without analysis if AI fails
            await addRecord(user.uid, { name, type, file });
            setAnalysisError('AI analysis failed. The document has been saved without a summary.');
          }
        } catch (error) {
          await addRecord(user.uid, { name, type, file });
          setAnalysisError('An error occurred during analysis. The document has been saved without a summary.');
        } finally {
          setIsAnalyzing(false);
          setIsUploading(false);
          await refreshRecords();
        }
      } else {
        try {
          await addRecord(user.uid, { name, type, file });
          await refreshRecords();
          handleModalClose();
        } finally {
          setIsUploading(false);
        }
      }
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

  const closeAnalysisModal = () => {
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  const filteredRecords = activeFilter === 'All' ? records : records.filter(r => r.type === activeFilter);
  const filterTabs: FilterType[] = ['All', 'Lab Report', 'Prescription', 'Imaging', 'Consultation Note', 'Visit Summary', 'Analyzed Document'];

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading">My Documents</h1>
          <p className="text-muted-foreground">Manage your health documents, reports, and prescriptions.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" disabled={records.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
          <Button onClick={openUploadModal}>
            <UploadCloud className="mr-2 h-4 w-4" /> Upload Document
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <div className="border-b border-border -mx-6 px-2 sm:px-6">
            <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
              {filterTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`${activeFilter === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    } whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm transition-colors`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-muted-foreground text-center py-10">Loading documents...</p>
            ) : filteredRecords.length > 0 ? (
              filteredRecords.map(record => (
                <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="flex items-center gap-4">
                    <FileText className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold">{record.name}</p>
                      <p className="text-sm text-muted-foreground">{record.type} - {new Date(record.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.analysis && (
                      <Button variant="outline" size="sm" onClick={() => setAnalysisResult(record.analysis!)}>
                        <Sparkles className="mr-2 h-4 w-4" /> Analyze
                      </Button>
                    )}
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
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No documents found for this category.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal title="Upload New Document" isOpen={isModalOpen} onClose={handleModalClose}>
        <form className="space-y-4" onSubmit={handleAddRecord}>
          <div>
            <label htmlFor="doc-name" className="block text-sm font-medium text-foreground mb-1">Document Name</label>
            <Input id="doc-name" name="doc-name" placeholder="e.g., Annual Check-up Results" required />
          </div>
          <div>
            <label htmlFor="doc-type" className="block text-sm font-medium text-foreground mb-1">Document Type</label>
            <select
              id="doc-type"
              name="doc-type"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value as MedicalRecord['type'])}
            >
              <option value="Lab Report">Lab Report</option>
              <option value="Prescription">Prescription</option>
              <option value="Imaging">Imaging</option>
              <option value="Consultation Note">Consultation Note</option>
              <option value="Visit Summary">Visit Summary</option>
            </select>
          </div>
          <div>
            <label htmlFor="doc-file" className="block text-sm font-medium text-foreground mb-1">File</label>
            <Input id="doc-file" name="doc-file" type="file" required accept="image/*,application/pdf" onChange={handleFileChange} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="analyze-doc"
                name="analyze-doc"
                className="rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
                disabled={!!selectedFile && !selectedFile.type.startsWith('image/')}
              />
              <label htmlFor="analyze-doc" className="text-sm font-medium text-foreground">Analyze with AI <span className="text-muted-foreground text-xs">(Image files only)</span></label>
            </div>
            {selectedFile && !selectedFile.type.startsWith('image/') && (
              <p className="text-xs text-destructive mt-1">
                The selected file is not an image. Please upload a JPG or PNG to enable AI analysis.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={handleModalClose} disabled={isUploading}>Cancel</Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal title="AI Document Analysis" isOpen={isAnalyzing || !!analysisResult || !!analysisError} onClose={closeAnalysisModal}>
        {isAnalyzing ? (
          <div className="text-center p-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analyzing your document... This may take a moment.</p>
          </div>
        ) : analysisError ? (
          <div>
            <p className="text-destructive">{analysisError}</p>
            <div className="flex justify-end mt-4">
              <Button onClick={closeAnalysisModal}>Close</Button>
            </div>
          </div>
        ) : analysisResult ? (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <h3 className="font-bold text-lg font-heading">Summary</h3>
              <p className="text-sm text-muted-foreground">{analysisResult.summary}</p>
            </div>
            {analysisResult.vitals && analysisResult.vitals.length > 0 && (
              <div>
                <h3 className="font-bold text-lg font-heading">Key Vitals Extracted</h3>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {analysisResult.vitals.map(v => <li key={v.name} className="text-sm"><strong>{v.name}:</strong> {v.value} {v.unit}</li>)}
                </ul>
              </div>
            )}
            {analysisResult.definitions && analysisResult.definitions.length > 0 && (
              <div>
                <h3 className="font-bold text-lg font-heading">Medical Term Definitions</h3>
                <ul className="space-y-2 mt-2">
                  {analysisResult.definitions.map(d => <li key={d.term} className="text-sm"><strong className="text-primary">{d.term}:</strong> {d.definition}</li>)}
                </ul>
              </div>
            )}
            <div className="flex justify-end pt-4">
              <Button onClick={closeAnalysisModal}>Close</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
};

export default MedicalRecords;