import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getClinicInvoices, ClinicInvoice } from '../../services/dataSupabase';

const statusStyles: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  due: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  partial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
};

interface ClinicBillingTabProps {
  clinicId: string;
}

const ClinicBillingTab: React.FC<ClinicBillingTabProps> = ({ clinicId }) => {
  const [invoices, setInvoices] = useState<ClinicInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorFilter, setDoctorFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClinicInvoices(clinicId);
      setInvoices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => { load(); }, [load]);

  const doctorNames = useMemo(() => {
    const names = new Set(invoices.map(i => i.doctorName || 'Doctor'));
    return Array.from(names).sort();
  }, [invoices]);

  const filtered = useMemo(() => {
    if (doctorFilter === 'all') return invoices;
    return invoices.filter(i => (i.doctorName || 'Doctor') === doctorFilter);
  }, [invoices, doctorFilter]);

  const summary = useMemo(() => {
    const total = filtered.reduce((s, i) => s + i.total, 0);
    const paid = filtered.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
    const due = filtered.filter(i => i.status !== 'paid').reduce((s, i) => s + i.total, 0);
    return { total, paid, due, count: filtered.length };
  }, [filtered]);

  const byDoctor = useMemo(() => {
    const map = new Map<string, number>();
    invoices.forEach(i => {
      const name = i.doctorName || 'Doctor';
      map.set(name, (map.get(name) || 0) + i.total);
    });
    return Array.from(map.entries())
      .map(([doctorName, total]) => ({ doctorName, total }))
      .sort((a, b) => b.total - a.total);
  }, [invoices]);

  if (loading) return <div className="text-center p-12 text-muted-foreground">Loading clinic billing data...</div>;

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

      {/* Revenue by doctor */}
      {byDoctor.length > 0 && (
        <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
          <h3 className="font-bold font-heading mb-4">Revenue by Doctor</h3>
          <div className="space-y-2">
            {byDoctor.map(d => {
              const pct = summary.total > 0 ? Math.round((d.total / byDoctor.reduce((s, x) => s + x.total, 0)) * 100) : 0;
              return (
                <div key={d.doctorName} className="flex items-center gap-3 text-sm">
                  <span className="w-32 truncate font-medium">{d.doctorName}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-24 text-right font-semibold">₹{d.total.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex justify-end">
        <select
          value={doctorFilter}
          onChange={e => setDoctorFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All doctors</option>
          {doctorNames.map(name => <option key={name} value={name}>{name}</option>)}
        </select>
      </div>

      {/* Invoice list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">No invoices yet.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(inv => (
            <div key={inv.id} className="p-4 rounded-xl bg-card border border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-sm">{inv.patientName || 'Patient'}</p>
                <p className="text-xs text-muted-foreground">{inv.doctorName} · {new Date(inv.issuedDate).toLocaleDateString()} · {inv.items.length} item(s)</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-bold font-heading">₹{inv.total.toFixed(2)}</p>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyles[inv.status]}`}>
                  {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClinicBillingTab;
