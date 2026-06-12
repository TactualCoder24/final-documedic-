import React, { useEffect, useState, useCallback } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ClinicService } from '../../types';
import { getClinicServices, createClinicService, updateClinicService, deleteClinicService } from '../../services/dataSupabase';
import { useToast } from '../../hooks/useToast';
import { TrendingUp, Plus, Trash2 } from '../icons/Icons';

interface RateCardTabProps {
  clinicId: string;
}

const CATEGORIES: ClinicService['category'][] = ['consultation', 'procedure', 'diagnostic', 'other'];

const categoryLabels: Record<ClinicService['category'], string> = {
  consultation: 'Consultation',
  procedure: 'Procedure',
  diagnostic: 'Diagnostic',
  other: 'Other',
};

const RateCardTab: React.FC<RateCardTabProps> = ({ clinicId }) => {
  const { success, error: toastError } = useToast();
  const [services, setServices] = useState<ClinicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClinicService['category']>('consultation');
  const [price, setPrice] = useState('');
  const [taxRate, setTaxRate] = useState('0');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClinicServices(clinicId);
      setServices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!name.trim() || !price) {
      toastError('Enter a service name and price');
      return;
    }
    setSaving(true);
    try {
      await createClinicService(clinicId, {
        name: name.trim(),
        category,
        price: parseFloat(price),
        taxRate: parseFloat(taxRate) || 0,
      });
      setName(''); setPrice(''); setTaxRate('0'); setCategory('consultation');
      success('Service added');
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to add service');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (service: ClinicService) => {
    try {
      await updateClinicService(service.id, { isActive: !service.isActive });
      setServices(prev => prev.map(s => s.id === service.id ? { ...s, isActive: !s.isActive } : s));
    } catch (e) {
      console.error(e);
      toastError('Failed to update service');
    }
  };

  const handleFieldChange = async (service: ClinicService, patch: Partial<Pick<ClinicService, 'price' | 'taxRate' | 'name' | 'category'>>) => {
    setServices(prev => prev.map(s => s.id === service.id ? { ...s, ...patch } : s));
  };

  const handleSaveRow = async (service: ClinicService) => {
    try {
      await updateClinicService(service.id, { name: service.name, category: service.category, price: service.price, taxRate: service.taxRate });
      success('Service updated');
    } catch (e) {
      console.error(e);
      toastError('Failed to update service');
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await deleteClinicService(serviceId);
      success('Service removed');
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to delete service');
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-card border border-border/50 flex items-start gap-3">
        <TrendingUp className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Define your clinic's rate card. These services and prices can be used as quick-add items when generating invoices.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
        <h3 className="font-bold font-heading mb-3 text-sm">Add Service</h3>
        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Service name" />
          <select value={category} onChange={e => setCategory(e.target.value as ClinicService['category'])} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabels[c]}</option>)}
          </select>
          <Input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price (₹)" />
          <Input type="number" min="0" step="0.01" value={taxRate} onChange={e => setTaxRate(e.target.value)} placeholder="Tax %" />
          <Button onClick={handleAdd} disabled={saving} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-6 text-muted-foreground">Loading services...</div>
      ) : services.length === 0 ? (
        <div className="text-center p-6 text-muted-foreground border border-dashed rounded-xl text-sm">No services configured yet.</div>
      ) : (
        <div className="space-y-2">
          {services.map(service => (
            <div key={service.id} className="p-3 rounded-xl bg-card border border-border/40 flex flex-wrap items-center gap-2">
              <Input
                value={service.name}
                onChange={e => handleFieldChange(service, { name: e.target.value })}
                onBlur={() => handleSaveRow(service)}
                className="flex-1 min-w-[140px] h-9"
              />
              <select
                value={service.category}
                onChange={e => { handleFieldChange(service, { category: e.target.value as ClinicService['category'] }); }}
                onBlur={() => handleSaveRow(service)}
                className="h-9 rounded-md border border-input bg-background px-2 text-xs"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabels[c]}</option>)}
              </select>
              <Input
                type="number" min="0" step="0.01"
                value={service.price}
                onChange={e => handleFieldChange(service, { price: parseFloat(e.target.value) || 0 })}
                onBlur={() => handleSaveRow(service)}
                className="w-24 h-9"
              />
              <Input
                type="number" min="0" step="0.01"
                value={service.taxRate}
                onChange={e => handleFieldChange(service, { taxRate: parseFloat(e.target.value) || 0 })}
                onBlur={() => handleSaveRow(service)}
                className="w-20 h-9"
              />
              <button onClick={() => handleToggleActive(service)} className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full ${service.isActive ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-secondary text-muted-foreground'}`}>
                {service.isActive ? 'Active' : 'Inactive'}
              </button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(service.id)} aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RateCardTab;
