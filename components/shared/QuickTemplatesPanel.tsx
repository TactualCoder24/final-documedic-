import React, { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Zap, Bookmark, Trash2, Pencil, ArrowUp, ArrowDown } from '../icons/Icons';
import { ClinicalTemplate, ClinicalTemplateType, DiagnosisCode, PrescriptionMedication } from '../../types';
import { getClinicalTemplates, createClinicalTemplate, deleteClinicalTemplate, updateClinicalTemplate } from '../../services/dataSupabase';
import { getQuickTemplatesForSpecialty, QuickTemplate } from '../../services/medicalReference';
import { useToast } from '../../hooks/useToast';

export interface QuickTemplateData {
  diagnosis?: string;
  diagnosisCodes?: DiagnosisCode[];
  medications?: PrescriptionMedication[];
  tests?: string[];
  advice?: string;
  notes?: string;
}

interface QuickTemplatesPanelProps {
  doctorId: string;
  specialty?: string;
  type: ClinicalTemplateType;
  label: string;
  isOpen: boolean;
  onApply: (template: QuickTemplateData) => void;
  /** Returns the current draft data to save as a new template, or null if there's nothing worth saving. */
  getSaveData: () => QuickTemplateData | null;
}

const QuickTemplatesPanel: React.FC<QuickTemplatesPanelProps> = ({ doctorId, specialty, type, label, isOpen, onApply, getSaveData }) => {
  const { success: toastSuccess, error: toastError } = useToast();
  const [customTemplates, setCustomTemplates] = useState<ClinicalTemplate[]>([]);
  const [nameInput, setNameInput] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [manageMode, setManageMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const quickTemplates: QuickTemplate[] = getQuickTemplatesForSpecialty(specialty, type);

  useEffect(() => {
    if (!isOpen) return;
    getClinicalTemplates(doctorId, type).then(setCustomTemplates).catch(err => console.error('Error loading templates:', err));
  }, [isOpen, doctorId, type]);

  const handleSave = async () => {
    const name = (nameInput || '').trim();
    if (!name) return;
    const data = getSaveData();
    if (!data) {
      toastError('Nothing to save yet');
      return;
    }
    setSaving(true);
    try {
      const created = await createClinicalTemplate(doctorId, { type, name, ...data });
      setCustomTemplates(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNameInput(null);
      toastSuccess('Template saved');
    } catch (err) {
      console.error(err);
      toastError('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteClinicalTemplate(id);
      setCustomTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
      toastError('Failed to delete template');
    }
  };

  const startRename = (t: ClinicalTemplate) => {
    setEditingId(t.id);
    setEditingName(t.name);
  };

  const handleRename = async (id: string) => {
    const name = editingName.trim();
    if (!name) {
      setEditingId(null);
      return;
    }
    try {
      await updateClinicalTemplate(id, { name });
      setCustomTemplates(prev => prev.map(t => (t.id === id ? { ...t, name } : t)));
    } catch (err) {
      console.error(err);
      toastError('Failed to rename template');
    } finally {
      setEditingId(null);
    }
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const index = customTemplates.findIndex(t => t.id === id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (index === -1 || swapIndex < 0 || swapIndex >= customTemplates.length) return;

    const current = customTemplates[index];
    const swapWith = customTemplates[swapIndex];
    const currentOrder = current.sortOrder ?? 0;
    const swapOrder = swapWith.sortOrder ?? 0;
    const newCurrentOrder = swapOrder;
    const newSwapOrder = currentOrder === swapOrder ? currentOrder - 1 : currentOrder;

    const reordered = [...customTemplates];
    [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
    setCustomTemplates(reordered.map(t => {
      if (t.id === current.id) return { ...t, sortOrder: newCurrentOrder };
      if (t.id === swapWith.id) return { ...t, sortOrder: newSwapOrder };
      return t;
    }));

    try {
      await Promise.all([
        updateClinicalTemplate(current.id, { sortOrder: newCurrentOrder }),
        updateClinicalTemplate(swapWith.id, { sortOrder: newSwapOrder }),
      ]);
    } catch (err) {
      console.error(err);
      toastError('Failed to reorder templates');
    }
  };

  if (quickTemplates.length === 0 && customTemplates.length === 0 && nameInput === null) {
    return (
      <div className="flex justify-end">
        <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => setNameInput('')}>
          <Bookmark className="h-3 w-3" /> Save as {label.toLowerCase()}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl border border-dashed border-border/60 bg-card/40 space-y-2">
      <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
        <Zap className="h-4 w-4" /> {label} {specialty ? `(${specialty})` : ''}
      </label>
      {quickTemplates.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quickTemplates.map(t => (
            <button
              key={t.name}
              type="button"
              onClick={() => onApply(t)}
              className="text-xs px-2.5 py-1.5 rounded-full border border-border/60 bg-background hover:bg-primary/5 hover:border-primary/40 transition-colors"
            >
              {t.name}
            </button>
          ))}
        </div>
      )}
      {customTemplates.length > 0 && (
        <div className="pt-1 border-t border-border/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Saved</span>
            <Button type="button" variant="ghost" size="sm" className="gap-1 text-xs h-6 px-2" onClick={() => { setManageMode(m => !m); setEditingId(null); }}>
              <Pencil className="h-3 w-3" /> {manageMode ? 'Done' : 'Manage'}
            </Button>
          </div>
          {manageMode ? (
            <div className="space-y-1.5">
              {customTemplates.map((t, idx) => (
                <div key={t.id} className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg border border-border/60 bg-background">
                  <div className="flex flex-col -my-1">
                    <button type="button" disabled={idx === 0} onClick={() => handleMove(t.id, 'up')} className="disabled:opacity-30 hover:text-primary">
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button type="button" disabled={idx === customTemplates.length - 1} onClick={() => handleMove(t.id, 'down')} className="disabled:opacity-30 hover:text-primary">
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                  {editingId === t.id ? (
                    <Input
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onBlur={() => handleRename(t.id)}
                      onKeyDown={e => { if (e.key === 'Enter') handleRename(t.id); if (e.key === 'Escape') setEditingId(null); }}
                      className="flex-1 h-7 text-xs"
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1 truncate">{t.name}</span>
                  )}
                  <button type="button" onClick={() => startRename(t)} className="hover:text-primary">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button type="button" onClick={() => handleDelete(t.id)} className="hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {customTemplates.map(t => (
                <span key={t.id} className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border border-primary/30 bg-primary/5">
                  <button type="button" onClick={() => onApply(t)} className="flex items-center gap-1 hover:text-primary">
                    <Bookmark className="h-3 w-3" /> {t.name}
                  </button>
                  <button type="button" onClick={() => handleDelete(t.id)} className="hover:text-destructive ml-1">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="pt-1 border-t border-border/40">
        {nameInput === null ? (
          <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => setNameInput('')}>
            <Bookmark className="h-3 w-3" /> Save as {label.toLowerCase()}
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder={`${label} name`}
              className="flex-1 h-8 text-xs"
              autoFocus
            />
            <Button type="button" size="sm" onClick={handleSave} disabled={saving || !nameInput.trim()}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setNameInput(null)}>Cancel</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickTemplatesPanel;
