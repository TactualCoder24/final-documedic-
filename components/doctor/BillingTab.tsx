import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Trash2, FileDown, CheckCircle2 } from '../icons/Icons';
import { Invoice, InvoiceItem, Profile } from '../../types';
import { getInvoicesForDoctor, createInvoice, updateInvoiceStatus, deleteInvoice } from '../../services/dataSupabase';
import { generateInvoicePdf } from '../../services/invoicePdf';
import { useToast } from '../../hooks/useToast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

const emptyItem = (): InvoiceItem => ({ description: '', quantity: 1, unitPrice: 0 });

const statusStyles: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  due: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  partial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
};

interface BillingTabProps {
  doctorId: string;
  doctorName: string;
  doctorSpecialty?: string;
  patients: (Profile & { id: string })[];
}

const BillingTab: React.FC<BillingTabProps> = ({ doctorId, doctorName, doctorSpecialty, patients }) => {
  const { success, error } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New invoice form state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);
  const [status, setStatus] = useState<'due' | 'paid' | 'partial'>('due');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getInvoicesForDoctor(doctorId);
      setInvoices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => { load(); }, [load]);

  const summary = useMemo(() => {
    const total = invoices.reduce((s, i) => s + i.total, 0);
    const paid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
    const due = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.total, 0);
    return { total, paid, due, count: invoices.length };
  }, [invoices]);

  const resetForm = () => {
    setSelectedPatientId(''); setItems([emptyItem()]); setStatus('due'); setDueDate(''); setNotes('');
  };

  const updateItem = (idx: number, patch: Partial<InvoiceItem>) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  };
  const addItemRow = () => setItems(prev => [...prev, emptyItem()]);
  const removeItemRow = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const formTotal = items.reduce((s, it) => s + (it.quantity || 0) * (it.unitPrice || 0), 0);

  const handleCreate = async () => {
    const patient = patients.find(p => p.id === selectedPatientId);
    const validItems = items.filter(i => i.description.trim() && i.quantity > 0);
    if (!patient || validItems.length === 0) {
      error('Select a patient and add at least one item');
      return;
    }
    setSaving(true);
    try {
      await createInvoice(doctorId, patient.id, {
        patientName: patient.name || 'Patient',
        items: validItems,
        status,
        dueDate: dueDate || undefined,
        notes: notes.trim() || undefined,
      });
      success('Invoice created');
      resetForm();
      setIsModalOpen(false);
      load();
    } catch (e) {
      console.error(e);
      error('Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (invoice: Invoice, newStatus: 'due' | 'paid' | 'partial') => {
    try {
      await updateInvoiceStatus(invoice.id, newStatus);
      setInvoices(prev => prev.map(i => i.id === invoice.id ? { ...i, status: newStatus } : i));
    } catch (e) {
      console.error(e);
      error('Failed to update status');
    }
  };

  const handleDelete = async (invoiceId: string) => {
    try {
      await deleteInvoice(invoiceId);
      setInvoices(prev => prev.filter(i => i.id !== invoiceId));
      success('Invoice deleted');
    } catch (e) {
      console.error(e);
      error('Failed to delete invoice');
    }
  };

  if (loading) return <div className="text-center p-12 text-muted-foreground">Loading billing data...</div>;

  return (
    <div className="space-y-6">
      {/* Revenue summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Billed</p>
          <p className="text-2xl font-bold font-heading mt-1">₹{summary.total.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">{summary.count} invoices</p>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Collected</p>
          <p className="text-2xl font-bold font-heading mt-1 text-emerald-500">₹{summary.paid.toFixed(2)}</p>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Outstanding</p>
          <p className="text-2xl font-bold font-heading mt-1 text-amber-500">₹{summary.due.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={() => setIsModalOpen(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New Invoice
        </Button>
      </div>

      {/* Invoice list */}
      {invoices.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">No invoices yet.</div>
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => (
            <div key={inv.id} className="p-4 rounded-xl bg-card border border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-sm">{inv.patientName || 'Patient'}</p>
                <p className="text-xs text-muted-foreground">{new Date(inv.issuedDate).toLocaleDateString()} · {inv.items.length} item(s)</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-bold font-heading">₹{inv.total.toFixed(2)}</p>
                <select
                  value={inv.status}
                  onChange={e => handleStatusChange(inv, e.target.value as 'due' | 'paid' | 'partial')}
                  className={`text-xs font-semibold px-2 py-1 rounded-full border-none outline-none cursor-pointer ${statusStyles[inv.status]}`}
                >
                  <option value="due">Due</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => generateInvoicePdf(inv, doctorName, doctorSpecialty)} aria-label="Download PDF">
                  <FileDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(inv.id)} aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Invoice Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title="New Invoice" variant="glass">
        <div className="space-y-4 max-w-xl">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Patient</label>
            <select
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select patient...</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name || p.id.substring(0, 8)}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Line Items</label>
            <div className="space-y-2 mt-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input value={item.description} onChange={e => updateItem(idx, { description: e.target.value })} placeholder="Description (e.g. Consultation)" className="flex-1" />
                  <Input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, { quantity: parseFloat(e.target.value) || 0 })} placeholder="Qty" className="w-20" />
                  <Input type="number" min="0" value={item.unitPrice} onChange={e => updateItem(idx, { unitPrice: parseFloat(e.target.value) || 0 })} placeholder="Price" className="w-24" />
                  <Button variant="ghost" size="icon" onClick={() => removeItemRow(idx)} className="text-destructive shrink-0"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addItemRow} className="mt-2 gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add item
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as 'due' | 'paid' | 'partial')} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="due">Due</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Due Date</label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="font-bold font-heading text-lg">Total: ₹{formTotal.toFixed(2)}</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }} disabled={saving}>Cancel</Button>
              <Button type="button" onClick={handleCreate} disabled={saving} className="gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> {saving ? 'Saving...' : 'Create Invoice'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BillingTab;
