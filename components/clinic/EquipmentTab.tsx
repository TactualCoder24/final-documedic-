import React, { useEffect, useState, useCallback } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { EquipmentAsset } from '../../types';
import { getEquipmentAssets, createEquipmentAsset, updateEquipmentAsset, deleteEquipmentAsset } from '../../services/dataSupabase';
import { useToast } from '../../hooks/useToast';
import { Wrench, Plus, Trash2 } from '../icons/Icons';

interface EquipmentTabProps {
  clinicId: string;
}

const STATUSES: EquipmentAsset['status'][] = ['operational', 'maintenance', 'retired'];

const statusLabels: Record<EquipmentAsset['status'], string> = {
  operational: 'Operational',
  maintenance: 'Maintenance',
  retired: 'Retired',
};

const statusStyles: Record<EquipmentAsset['status'], string> = {
  operational: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
  maintenance: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  retired: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400',
};

const EquipmentTab: React.FC<EquipmentTabProps> = ({ clinicId }) => {
  const { success, error: toastError } = useToast();
  const [assets, setAssets] = useState<EquipmentAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('');
  const [nextServiceDate, setNextServiceDate] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEquipmentAssets(clinicId);
      setAssets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!name.trim()) {
      toastError('Enter an equipment name');
      return;
    }
    setSaving(true);
    try {
      await createEquipmentAsset(clinicId, {
        name: name.trim(),
        category: category.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        location: location.trim() || undefined,
        nextServiceDate: nextServiceDate || undefined,
      });
      setName(''); setCategory(''); setSerialNumber(''); setLocation(''); setNextServiceDate('');
      success('Equipment added');
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to add equipment');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (asset: EquipmentAsset, status: EquipmentAsset['status']) => {
    try {
      const patch: Parameters<typeof updateEquipmentAsset>[1] = { status };
      if (status === 'operational' && asset.status === 'maintenance') {
        patch.lastServiceDate = new Date().toISOString().slice(0, 10);
      }
      await updateEquipmentAsset(asset.id, patch);
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to update equipment');
    }
  };

  const handleDelete = async (assetId: string) => {
    if (!window.confirm('Remove this equipment record?')) return;
    try {
      await deleteEquipmentAsset(assetId);
      success('Equipment removed');
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to remove equipment');
    }
  };

  const dueForService = assets.filter(a => a.nextServiceDate && new Date(a.nextServiceDate) <= new Date());

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-card border border-border/50 flex items-start gap-3">
        <Wrench className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Track medical equipment and assets, their status, location, and service schedule.
        </p>
      </div>

      {dueForService.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>{dueForService.length}</strong> item{dueForService.length === 1 ? '' : 's'} due for service: {dueForService.map(a => a.name).join(', ')}.
          </p>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
        <h3 className="font-bold font-heading mb-3 text-sm">Add Equipment</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Equipment name" />
          <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category (optional)" />
          <Input value={serialNumber} onChange={e => setSerialNumber(e.target.value)} placeholder="Serial number (optional)" />
          <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location (optional)" />
          <Input type="date" value={nextServiceDate} onChange={e => setNextServiceDate(e.target.value)} placeholder="Next service date" />
          <Button onClick={handleAdd} disabled={saving} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-6 text-muted-foreground">Loading equipment...</div>
      ) : assets.length === 0 ? (
        <div className="text-center p-6 text-muted-foreground border border-dashed rounded-xl text-sm">No equipment tracked yet.</div>
      ) : (
        <div className="space-y-2">
          {assets.map(asset => (
            <div key={asset.id} className="p-3 rounded-xl bg-card border border-border/40 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-sm">{asset.name}</p>
                <p className="text-xs text-muted-foreground">
                  {asset.category || 'Uncategorized'}
                  {asset.location ? ` · ${asset.location}` : ''}
                  {asset.serialNumber ? ` · S/N ${asset.serialNumber}` : ''}
                  {asset.nextServiceDate ? ` · Next service ${new Date(asset.nextServiceDate).toLocaleDateString()}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={asset.status}
                  onChange={e => handleStatusChange(asset, e.target.value as EquipmentAsset['status'])}
                  className={`h-8 rounded-full px-2 text-xs font-semibold border-0 ${statusStyles[asset.status]}`}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                </select>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(asset.id)} aria-label="Delete">
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

export default EquipmentTab;
