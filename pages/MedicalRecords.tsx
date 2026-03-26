import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../hooks/useToast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { UploadCloud, FileText, Trash2, Download, Sparkles } from '../components/icons/Icons';
import { MedicalRecord, DocumentAnalysis } from '../types';
import { useTranslation } from 'react-i18next';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { getRecords, addRecord, deleteRecord } from '../services/dataSupabase';
import { analyzeMedicalDocument } from '../services/aiService';
import EmptyState from '../components/ui/EmptyState';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

type FilterType = 'All' | MedicalRecord['type'];

/* ── per-type visual config ──────────────────────────────────────── */
const typeConfig: Record<string, { bg: string; text: string; border: string }> = {
  'Lab Report':        { bg: 'bg-blue-50 dark:bg-blue-900/20',    text: 'text-blue-600 dark:text-blue-400',    border: 'border-blue-200 dark:border-blue-800' },
  'Prescription':      { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  'Imaging':           { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
  'Consultation Note': { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  'Visit Summary':     { bg: 'bg-pink-50 dark:bg-pink-900/20',     text: 'text-pink-600 dark:text-pink-400',     border: 'border-pink-200 dark:border-pink-800' },
  'Analyzed Document': { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' },
  'default':           { bg: 'bg-slate-50 dark:bg-slate-900/20',   text: 'text-slate-600 dark:text-slate-400',   border: 'border-slate-200 dark:border-slate-800' },
};

const getTypeConfig = (type: string) => typeConfig[type] || typeConfig['default'];

/* ── vital chip status helper ─────────────────────────────────────── */
const getVitalStatus = (name: string, value: string): { label: string; cls: string } => {
  const num = parseFloat(value);
  const n = name.toLowerCase();
  if (n.includes('glucose') || n.includes('sugar')) {
    if (num < 70)  return { label: 'Low',    cls: 'vital-chip vital-chip-low' };
    if (num > 140) return { label: 'High',   cls: 'vital-chip vital-chip-high' };
    return { label: 'Normal', cls: 'vital-chip vital-chip-normal' };
  }
  if (n.includes('hemoglobin') || n.includes('hgb')) {
    if (num < 12)  return { label: 'Low',    cls: 'vital-chip vital-chip-low' };
    if (num > 17)  return { label: 'High',   cls: 'vital-chip vital-chip-high' };
    return { label: 'Normal', cls: 'vital-chip vital-chip-normal' };
  }
  return { label: 'Extracted', cls: 'vital-chip vital-chip-normal' };
};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
const MedicalRecords: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const toast = useToast();
  const [records, setRecords]           = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [isUploading, setIsUploading]   = useState(false);
  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysis | null>(null);
  const [analysisError, setAnalysisError]   = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<MedicalRecord['type']>('Lab Report');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [dragActive, setDragActive]     = useState(false);

  const refreshRecords = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const data = await getRecords(user.uid);
      setRecords(data);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { refreshRecords(); }, [refreshRecords]);

  const openUploadModal = () => {
    setSelectedDocType('Lab Report');
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => { setIsModalOpen(false); setSelectedFile(null); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleDelete = async (id: string) => {
    if (user) { await deleteRecord(user.uid, id); await refreshRecords(); }
  };

  const handleAddRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || isUploading) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get('doc-name') as string;
    const type = formData.get('doc-type') as MedicalRecord['type'];
    const file = (document.getElementById('doc-file') as HTMLInputElement)?.files?.[0];
    const shouldAnalyze = (formData.get('analyze-doc') as string) === 'on';

    if (name && type && file) {
      setIsUploading(true);
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
            await addRecord(user.uid, { name, type, file });
            setAnalysisError(t('records.ai_fail', 'AI analysis failed. Document saved without a summary.'));
          }
        } catch {
          await addRecord(user.uid, { name, type, file });
          setAnalysisError(t('records.ai_error', 'An error occurred during analysis. Document saved without a summary.'));
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
    if (records.length === 0) { toast.warning(t('records.no_records_export', 'No records to export.')); return; }
    const headers = ['ID', 'Name', 'Type', 'Date'];
    const csvContent = [headers.join(','), ...records.map(r => [r.id, `"${r.name}"`, r.type, r.date].join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'medical-records.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closeAnalysisModal = () => { setAnalysisResult(null); setAnalysisError(null); };

  const filteredRecords = activeFilter === 'All' ? records : records.filter(r => r.type === activeFilter);
  const filterTabs: FilterType[] = ['All', 'Lab Report', 'Prescription', 'Imaging', 'Consultation Note', 'Visit Summary', 'Analyzed Document'];

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading">{t('records.title', 'My Documents')}</h1>
          <p className="text-muted-foreground mt-1">{t('records.subtitle', 'Manage your health documents, reports, and prescriptions.')}</p>
        </div>
        <div className="flex gap-2.5">
          <Button onClick={handleExport} variant="outline" disabled={records.length === 0} className="gap-2">
            <Download className="h-4 w-4" /> {t('records.export', 'Export')}
          </Button>
          <Button onClick={openUploadModal} className="gap-2">
            <UploadCloud className="h-4 w-4" /> {t('records.upload_button', 'Upload Document')}
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      {records.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {(['All', 'Lab Report', 'Prescription', 'Imaging'] as FilterType[]).map(type => {
            const count = type === 'All' ? records.length : records.filter(r => r.type === type).length;
            const cfg = getTypeConfig(type === 'All' ? 'default' : type);
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`p-4 rounded-xl border text-left transition-all duration-200 ${activeFilter === type ? `${cfg.bg} ${cfg.border} shadow-sm` : 'bg-white dark:bg-card border-slate-100 dark:border-border/50 hover:border-primary/30'}`}
              >
                <p className={`text-2xl font-bold font-heading ${activeFilter === type ? cfg.text : 'text-foreground'}`}>{count}</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">{type === 'All' ? 'Total Records' : type + 's'}</p>
              </button>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle>{t('records.your_docs', 'Your Documents')}</CardTitle>
          </div>
          {/* Filter tabs */}
          <div className="border-b border-border/50 -mx-6 px-6 mt-4">
            <nav className="-mb-px flex space-x-1 overflow-x-auto" aria-label="Filter tabs">
              {filterTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`whitespace-nowrap py-2.5 px-3 border-b-2 font-semibold text-xs transition-all ${
                    activeFilter === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 rounded-xl skeleton" />
              ))}
            </div>
          ) : filteredRecords.length > 0 ? (
            <div className="space-y-3">
              {filteredRecords.map(record => {
                const cfg = getTypeConfig(record.type);
                return (
                  <div key={record.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/60 dark:bg-secondary/30 border border-slate-100 dark:border-border/40 hover:border-primary/25 hover:shadow-[0_2px_12px_rgba(37,99,235,0.08)] transition-all group">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <FileText className={`h-5 w-5 ${cfg.text}`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{record.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                          {record.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        {record.analysis && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                            ✦ AI Analyzed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                      {record.analysis && (
                        <Button variant="ghost" size="sm" onClick={() => setAnalysisResult(record.analysis!)} className="gap-1.5 h-8 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline text-xs">AI Summary</span>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
                        <a href={record.fileUrl} target="_blank" rel="noopener noreferrer" download={record.name}>View</a>
                      </Button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-red-50 dark:hover:bg-destructive/10 transition-colors"
                        aria-label={`Delete ${record.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title={t('records.empty_title', 'No documents found')}
              description={t('records.empty_desc', 'Upload your first medical report and let AI analyze it for you.')}
              ctaText={t('records.upload_button', 'Upload Document')}
              ctaAction={openUploadModal}
            />
          )}
        </CardContent>
      </Card>

      {/* ── Upload Modal ─────────────────────────────────────────────── */}
      <Modal title={t('records.modals.upload_title', 'Upload New Document')} isOpen={isModalOpen} onClose={handleModalClose}>
        <form className="space-y-5" onSubmit={handleAddRecord}>
          <div>
            <label htmlFor="doc-name" className="block text-sm font-medium text-foreground mb-1.5">{t('records.modals.doc_name', 'Document Name')}</label>
            <Input id="doc-name" name="doc-name" placeholder={t('records.modals.doc_name_placeholder', 'e.g., Annual Check-up Results')} required />
          </div>
          <div>
            <label htmlFor="doc-type" className="block text-sm font-medium text-foreground mb-1.5">{t('records.modals.doc_type', 'Document Type')}</label>
            <select
              id="doc-type"
              name="doc-type"
              required
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
              value={selectedDocType}
              onChange={e => setSelectedDocType(e.target.value as MedicalRecord['type'])}
            >
              {['Lab Report', 'Prescription', 'Imaging', 'Consultation Note', 'Visit Summary'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Drag-drop upload zone */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('records.modals.file', 'File')}</label>
            <label
              htmlFor="doc-file"
              className={`upload-zone flex flex-col items-center gap-3 cursor-pointer ${dragActive ? 'drag-active' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={e => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files[0]; if (f) setSelectedFile(f); }}
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-primary/10 flex items-center justify-center">
                <UploadCloud className="h-6 w-6 text-primary" />
              </div>
              {selectedFile ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">Drop your file here</p>
                  <p className="text-xs text-muted-foreground mt-0.5">or click to browse — JPG, PNG, PDF</p>
                </div>
              )}
              <input id="doc-file" name="doc-file" type="file" className="sr-only" accept="image/*,application/pdf" onChange={handleFileChange} required />
            </label>
          </div>

          {/* AI toggle */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/15 border border-indigo-100 dark:border-indigo-800/30">
            <input
              type="checkbox"
              id="analyze-doc"
              name="analyze-doc"
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
              disabled={!!selectedFile && !selectedFile.type.startsWith('image/')}
            />
            <div>
              <label htmlFor="analyze-doc" className="text-sm font-semibold text-foreground cursor-pointer">
                <Sparkles className="inline h-3.5 w-3.5 mr-1 text-indigo-500" />
                {t('records.modals.analyze_ai', 'Analyze with AI')}
              </label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {selectedFile && !selectedFile.type.startsWith('image/')
                  ? t('records.modals.not_image_warn', 'Upload a JPG or PNG to enable AI analysis.')
                  : t('records.modals.image_only', 'Extracts vitals & medical terms (image files only)')}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={handleModalClose} disabled={isUploading}>{t('records.modals.cancel', 'Cancel')}</Button>
            <Button type="submit" disabled={isUploading} className="gap-2">
              {isUploading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('records.modals.uploading', 'Uploading…')}</>
              ) : (
                <><UploadCloud className="h-4 w-4" />{t('records.modals.upload', 'Upload')}</>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── AI Analysis Modal ────────────────────────────────────────── */}
      <Modal title={t('records.analysis.title', 'AI Document Analysis')} isOpen={isAnalyzing || !!analysisResult || !!analysisError} onClose={closeAnalysisModal}>
        {isAnalyzing ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-7 w-7 text-indigo-500 animate-pulse" />
            </div>
            <p className="font-semibold text-foreground">Analyzing your document…</p>
            <p className="text-sm text-muted-foreground mt-1">{t('records.analysis.analyzing', 'This may take a moment.')}</p>
          </div>
        ) : analysisError ? (
          <div className="space-y-4">
            <p className="text-destructive text-sm">{analysisError}</p>
            <div className="flex justify-end"><Button onClick={closeAnalysisModal}>Close</Button></div>
          </div>
        ) : analysisResult ? (
          <div className="space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Summary */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/15 border border-blue-100 dark:border-blue-800/30">
              <h3 className="font-bold text-sm font-heading text-blue-700 dark:text-blue-400 mb-1.5">
                📋 {t('records.analysis.summary', 'Summary')}
              </h3>
              <p className="text-sm text-foreground leading-relaxed">{analysisResult.summary}</p>
            </div>

            {/* Extracted vitals as chips */}
            {analysisResult.vitals && analysisResult.vitals.length > 0 && (
              <div>
                <h3 className="font-bold text-sm font-heading text-foreground mb-3">
                  ⚗️ {t('records.analysis.key_vitals', 'Key Vitals Extracted')}
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {analysisResult.vitals.map(v => {
                    const status = getVitalStatus(v.name, v.value);
                    return (
                      <div key={v.name} className="p-3 rounded-xl bg-white dark:bg-card border border-slate-100 dark:border-border/50 min-w-[130px]">
                        <p className="text-xs font-semibold text-muted-foreground">{v.name}</p>
                        <p className="text-lg font-bold font-heading text-foreground mt-0.5">{v.value} <span className="text-xs font-normal text-muted-foreground">{v.unit}</span></p>
                        <span className={status.cls}>{status.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Definitions */}
            {analysisResult.definitions && analysisResult.definitions.length > 0 && (
              <div>
                <h3 className="font-bold text-sm font-heading text-foreground mb-3">🔬 {t('records.analysis.medical_terms', 'Medical Term Definitions')}</h3>
                <div className="space-y-2">
                  {analysisResult.definitions.map(d => (
                    <div key={d.term} className="p-3 rounded-lg bg-slate-50 dark:bg-secondary/30 border border-slate-100 dark:border-border/40">
                      <p className="text-sm font-bold text-primary">{d.term}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{d.definition}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={closeAnalysisModal}>{t('records.analysis.close', 'Close')}</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
};

export default MedicalRecords;