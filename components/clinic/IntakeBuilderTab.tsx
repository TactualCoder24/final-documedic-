import React, { useEffect, useState, useCallback } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ClinicIntakeTemplate, IntakeField } from '../../types';
import { getClinicIntakeTemplates, saveIntakeTemplate, deleteIntakeTemplate } from '../../services/dataSupabase';
import { useToast } from '../../hooks/useToast';
import { ClipboardList, Plus, Trash2, ArrowLeft, ArrowRight } from '../icons/Icons';

interface IntakeBuilderTabProps {
  clinicId: string;
}

const FIELD_TYPES: IntakeField['type'][] = ['text', 'textarea', 'select', 'checkbox'];

const fieldTypeLabels: Record<IntakeField['type'], string> = {
  text: 'Short Text',
  textarea: 'Long Text',
  select: 'Dropdown',
  checkbox: 'Checkbox',
};

const newField = (): IntakeField => ({
  id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  label: '',
  type: 'text',
  required: false,
});

const emptyTemplate = (): ClinicIntakeTemplate => ({
  id: '',
  clinicId: '',
  name: 'New Intake Form',
  fields: [],
  consentText: 'I confirm that the information provided is accurate to the best of my knowledge and consent to treatment.',
  isActive: true,
  createdAt: '',
  updatedAt: '',
});

const IntakeBuilderTab: React.FC<IntakeBuilderTabProps> = ({ clinicId }) => {
  const { success, error: toastError } = useToast();
  const [templates, setTemplates] = useState<ClinicIntakeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ClinicIntakeTemplate | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClinicIntakeTemplates(clinicId);
      setTemplates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => { load(); }, [load]);

  const updateField = (fieldId: string, patch: Partial<IntakeField>) => {
    if (!editing) return;
    setEditing({ ...editing, fields: editing.fields.map(f => f.id === fieldId ? { ...f, ...patch } : f) });
  };

  const moveField = (fieldId: string, direction: -1 | 1) => {
    if (!editing) return;
    const idx = editing.fields.findIndex(f => f.id === fieldId);
    const newIdx = idx + direction;
    if (idx === -1 || newIdx < 0 || newIdx >= editing.fields.length) return;
    const fields = [...editing.fields];
    [fields[idx], fields[newIdx]] = [fields[newIdx], fields[idx]];
    setEditing({ ...editing, fields });
  };

  const addField = () => {
    if (!editing) return;
    setEditing({ ...editing, fields: [...editing.fields, newField()] });
  };

  const removeField = (fieldId: string) => {
    if (!editing) return;
    setEditing({ ...editing, fields: editing.fields.filter(f => f.id !== fieldId) });
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toastError('Enter a template name');
      return;
    }
    setSaving(true);
    try {
      await saveIntakeTemplate(clinicId, {
        id: editing.id || undefined,
        name: editing.name.trim(),
        fields: editing.fields,
        consentText: editing.consentText,
        isActive: editing.isActive,
      });
      success('Intake form saved');
      setEditing(null);
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to save intake form');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!window.confirm('Delete this intake form template?')) return;
    try {
      await deleteIntakeTemplate(templateId);
      success('Template deleted');
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to delete template');
    }
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Form Name</label>
            <Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="e.g., General Intake" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.isActive} onChange={e => setEditing({ ...editing, isActive: e.target.checked })} className="rounded border-gray-300 text-primary focus:ring-primary" />
            Active (shown to patients before appointments)
          </label>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-heading text-sm">Fields</h3>
            <Button size="sm" onClick={addField} className="gap-1.5"><Plus className="h-4 w-4" /> Add Field</Button>
          </div>
          {editing.fields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No fields yet. Add one to get started.</p>
          ) : (
            <div className="space-y-2">
              {editing.fields.map((field, idx) => (
                <div key={field.id} className="p-3 rounded-xl bg-secondary/40 border border-border/30 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      value={field.label}
                      onChange={e => updateField(field.id, { label: e.target.value })}
                      placeholder="Field label"
                      className="flex-1 min-w-[140px] h-9"
                    />
                    <select
                      value={field.type}
                      onChange={e => updateField(field.id, { type: e.target.value as IntakeField['type'] })}
                      className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      {FIELD_TYPES.map(t => <option key={t} value={t}>{fieldTypeLabels[t]}</option>)}
                    </select>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, { required: e.target.checked })} className="rounded border-gray-300 text-primary focus:ring-primary" />
                      Required
                    </label>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveField(field.id, -1)} disabled={idx === 0} aria-label="Move up">
                      <ArrowLeft className="h-4 w-4 rotate-90" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveField(field.id, 1)} disabled={idx === editing.fields.length - 1} aria-label="Move down">
                      <ArrowRight className="h-4 w-4 rotate-90" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeField(field.id)} aria-label="Remove field">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {field.type === 'select' && (
                    <Input
                      value={(field.options || []).join(', ')}
                      onChange={e => updateField(field.id, { options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) })}
                      placeholder="Options, comma separated (e.g., Yes, No, Not sure)"
                      className="h-9"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm space-y-2">
          <h3 className="font-bold font-heading text-sm">Consent Text</h3>
          <textarea
            rows={3}
            value={editing.consentText || ''}
            onChange={e => setEditing({ ...editing, consentText: e.target.value })}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Consent statement patients must agree to before submitting"
          />
          <p className="text-xs text-muted-foreground">Patients will see this text with a checkbox and a signature pad before submitting their intake form.</p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Form'}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-card border border-border/50 flex items-start gap-3">
        <ClipboardList className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Build custom pre-visit intake forms for your patients, with consent text and e-signature capture.
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setEditing(emptyTemplate())} className="gap-1.5"><Plus className="h-4 w-4" /> New Form</Button>
      </div>

      {loading ? (
        <div className="text-center p-6 text-muted-foreground">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="text-center p-6 text-muted-foreground border border-dashed rounded-xl text-sm">No intake forms yet. Create one to get started.</div>
      ) : (
        <div className="space-y-2">
          {templates.map(template => (
            <div key={template.id} className="p-3 rounded-xl bg-card border border-border/40 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-sm">{template.name}</p>
                <p className="text-xs text-muted-foreground">{template.fields.length} field{template.fields.length === 1 ? '' : 's'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full ${template.isActive ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-secondary text-muted-foreground'}`}>
                  {template.isActive ? 'Active' : 'Inactive'}
                </span>
                <Button variant="outline" size="sm" onClick={() => setEditing(template)}>Edit</Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(template.id)} aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IntakeBuilderTab;
