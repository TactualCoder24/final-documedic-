import React, { useEffect, useState, useCallback } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { PharmacyInventoryItem, PharmacyDispense } from '../../types';
import {
  getPharmacyInventory, createPharmacyInventoryItem, updatePharmacyInventoryItem, deletePharmacyInventoryItem,
  getPharmacyDispenses, dispensePharmacyItem,
} from '../../services/dataSupabase';
import { useToast } from '../../hooks/useToast';
import { Pill, Plus, Trash2, AlertTriangle } from '../icons/Icons';

interface PharmacyTabProps {
  clinicId: string;
}

const PharmacyTab: React.FC<PharmacyTabProps> = ({ clinicId }) => {
  const { success, error: toastError } = useToast();
  const [inventory, setInventory] = useState<PharmacyInventoryItem[]>([]);
  const [dispenses, setDispenses] = useState<PharmacyDispense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [medicineName, setMedicineName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('units');
  const [stockQuantity, setStockQuantity] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const [showDispenseFor, setShowDispenseFor] = useState<string | null>(null);
  const [dispenseQty, setDispenseQty] = useState('');
  const [dispensePatient, setDispensePatient] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inv, disp] = await Promise.all([
        getPharmacyInventory(clinicId),
        getPharmacyDispenses(clinicId, 20),
      ]);
      setInventory(inv);
      setDispenses(disp);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!medicineName.trim() || !unit.trim()) {
      toastError('Enter a medicine name and unit');
      return;
    }
    setSaving(true);
    try {
      await createPharmacyInventoryItem(clinicId, {
        medicineName: medicineName.trim(),
        category: category.trim() || undefined,
        unit: unit.trim(),
        stockQuantity: parseFloat(stockQuantity) || 0,
        reorderLevel: parseFloat(reorderLevel) || 0,
        unitPrice: parseFloat(unitPrice) || 0,
        expiryDate: expiryDate || undefined,
      });
      setMedicineName(''); setCategory(''); setUnit('units'); setStockQuantity(''); setReorderLevel(''); setUnitPrice(''); setExpiryDate('');
      success('Medicine added to inventory');
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to add medicine');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (item: PharmacyInventoryItem, patch: Partial<PharmacyInventoryItem>) => {
    setInventory(prev => prev.map(i => i.id === item.id ? { ...i, ...patch } : i));
  };

  const handleSaveRow = async (item: PharmacyInventoryItem) => {
    try {
      await updatePharmacyInventoryItem(item.id, {
        stockQuantity: item.stockQuantity,
        reorderLevel: item.reorderLevel,
        unitPrice: item.unitPrice,
      });
      success('Inventory updated');
    } catch (e) {
      console.error(e);
      toastError('Failed to update inventory');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm('Remove this medicine from inventory?')) return;
    try {
      await deletePharmacyInventoryItem(itemId);
      success('Medicine removed');
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to remove medicine');
    }
  };

  const handleDispense = async (item: PharmacyInventoryItem) => {
    const qty = parseFloat(dispenseQty);
    if (!qty || qty <= 0) {
      toastError('Enter a valid quantity');
      return;
    }
    if (qty > item.stockQuantity) {
      toastError('Not enough stock');
      return;
    }
    setSaving(true);
    try {
      await dispensePharmacyItem(clinicId, {
        inventoryId: item.id,
        medicineName: item.medicineName,
        quantity: qty,
        currentStock: item.stockQuantity,
        patientName: dispensePatient.trim() || undefined,
      });
      setShowDispenseFor(null); setDispenseQty(''); setDispensePatient('');
      success('Dispensed');
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to dispense');
    } finally {
      setSaving(false);
    }
  };

  const lowStockItems = inventory.filter(i => i.stockQuantity <= i.reorderLevel);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-card border border-border/50 flex items-start gap-3">
        <Pill className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Track pharmacy stock levels, reorder points, and dispense medicines against inventory.
        </p>
      </div>

      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>{lowStockItems.length}</strong> item{lowStockItems.length === 1 ? '' : 's'} at or below reorder level: {lowStockItems.map(i => i.medicineName).join(', ')}.
          </p>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
        <h3 className="font-bold font-heading mb-3 text-sm">Add Medicine</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input value={medicineName} onChange={e => setMedicineName(e.target.value)} placeholder="Medicine name" />
          <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category (optional)" />
          <Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="Unit (e.g. tablets, ml)" />
          <Input type="number" min="0" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} placeholder="Stock quantity" />
          <Input type="number" min="0" value={reorderLevel} onChange={e => setReorderLevel(e.target.value)} placeholder="Reorder level" />
          <Input type="number" min="0" step="0.01" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} placeholder="Unit price (₹)" />
          <Input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} placeholder="Expiry date" />
          <Button onClick={handleAdd} disabled={saving} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-6 text-muted-foreground">Loading inventory...</div>
      ) : inventory.length === 0 ? (
        <div className="text-center p-6 text-muted-foreground border border-dashed rounded-xl text-sm">No medicines in inventory yet.</div>
      ) : (
        <div className="space-y-2">
          {inventory.map(item => (
            <div key={item.id} className="p-3 rounded-xl bg-card border border-border/40">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[140px]">
                  <p className="font-semibold text-sm">{item.medicineName}</p>
                  <p className="text-xs text-muted-foreground">{item.category || 'Uncategorized'} · {item.unit}{item.expiryDate ? ` · Exp ${new Date(item.expiryDate).toLocaleDateString()}` : ''}</p>
                </div>
                <Input
                  type="number" min="0"
                  value={item.stockQuantity}
                  onChange={e => handleFieldChange(item, { stockQuantity: parseFloat(e.target.value) || 0 })}
                  onBlur={() => handleSaveRow(item)}
                  className={`w-24 h-9 ${item.stockQuantity <= item.reorderLevel ? 'border-amber-400' : ''}`}
                />
                <Input
                  type="number" min="0"
                  value={item.reorderLevel}
                  onChange={e => handleFieldChange(item, { reorderLevel: parseFloat(e.target.value) || 0 })}
                  onBlur={() => handleSaveRow(item)}
                  className="w-24 h-9"
                  title="Reorder level"
                />
                <Input
                  type="number" min="0" step="0.01"
                  value={item.unitPrice}
                  onChange={e => handleFieldChange(item, { unitPrice: parseFloat(e.target.value) || 0 })}
                  onBlur={() => handleSaveRow(item)}
                  className="w-24 h-9"
                  title="Unit price"
                />
                <Button size="sm" variant="outline" onClick={() => setShowDispenseFor(showDispenseFor === item.id ? null : item.id)}>
                  Dispense
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)} aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {showDispenseFor === item.id && (
                <div className="mt-3 flex flex-wrap items-center gap-2 p-3 rounded-lg border border-border/40">
                  <Input type="number" min="1" max={item.stockQuantity} value={dispenseQty} onChange={e => setDispenseQty(e.target.value)} placeholder="Quantity" className="w-28" />
                  <Input value={dispensePatient} onChange={e => setDispensePatient(e.target.value)} placeholder="Patient name (optional)" className="flex-1 min-w-[160px]" />
                  <Button size="sm" onClick={() => handleDispense(item)} disabled={saving}>Confirm Dispense</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {dispenses.length > 0 && (
        <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
          <h3 className="font-bold font-heading mb-3 text-sm">Recent Dispenses</h3>
          <div className="space-y-2">
            {dispenses.map(d => (
              <div key={d.id} className="p-2.5 rounded-lg bg-muted/40 flex items-center justify-between text-sm">
                <span>{d.medicineName} × {d.quantity}{d.patientName ? ` → ${d.patientName}` : ''}</span>
                <span className="text-xs text-muted-foreground">{new Date(d.dispensedAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyTab;
