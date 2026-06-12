import React, { useState, useEffect, useCallback } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ClinicQueueEntry, Department, ClinicStaff } from '../../types';
import {
  getClinicQueue, addToQueue, updateQueueStatus, removeFromQueue,
  getDepartments, getClinicStaff
} from '../../services/dataSupabase';
import { useToast } from '../../hooks/useToast';
import {
  Plus, RefreshCw, CheckCircle2, XCircle, Clock, Users, Phone, ClipboardList
} from '../icons/Icons';

interface ClinicQueueTabProps {
  clinicId: string;
}

const statusConfig = {
  waiting:     { label: 'Waiting',     bg: 'bg-amber-50 dark:bg-amber-900/20',   text: 'text-amber-700 dark:text-amber-400',   border: 'border-amber-200 dark:border-amber-800/40'   },
  in_progress: { label: 'In Progress', bg: 'bg-blue-50 dark:bg-blue-900/20',     text: 'text-blue-700 dark:text-blue-400',     border: 'border-blue-200 dark:border-blue-800/40'     },
  completed:   { label: 'Completed',   bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/40' },
  cancelled:   { label: 'Cancelled',   bg: 'bg-secondary',                       text: 'text-muted-foreground',                border: 'border-border'                               },
};

const ClinicQueueTab: React.FC<ClinicQueueTabProps> = ({ clinicId }) => {
  const { success, error: toastError } = useToast();

  // Queue state
  const [queue, setQueue] = useState<ClinicQueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Lookup data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<ClinicStaff[]>([]);

  // New patient form
  const [showForm, setShowForm] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);

  // Filter
  const [filter, setFilter] = useState<'all' | ClinicQueueEntry['status']>('all');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [q, depts, staff] = await Promise.all([
        getClinicQueue(clinicId),
        getDepartments(clinicId),
        getClinicStaff(clinicId),
      ]);
      setQueue(q);
      setDepartments(depts);
      setDoctors(staff.filter(s => s.role === 'doctor'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [clinicId]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!patientName.trim()) { toastError('Patient name is required'); return; }
    setAdding(true);
    try {
      // Auto-generate next token number
      const maxToken = queue.reduce((m, e) => Math.max(m, e.tokenNumber || 0), 0);
      await addToQueue(clinicId, {
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim() || undefined,
        doctorId: selectedDoctorId || undefined,
        departmentId: selectedDeptId || undefined,
        notes: notes.trim() || undefined,
        tokenNumber: maxToken + 1,
      });
      success(`Token #${maxToken + 1} added to queue`);
      setPatientName(''); setPatientPhone(''); setSelectedDoctorId('');
      setSelectedDeptId(''); setNotes(''); setShowForm(false);
      load(true);
    } catch (e) {
      console.error(e);
      toastError('Failed to add to queue');
    } finally {
      setAdding(false);
    }
  };

  const handleStatus = async (entry: ClinicQueueEntry, status: ClinicQueueEntry['status']) => {
    try {
      await updateQueueStatus(entry.id, status);
      setQueue(prev => prev.map(e => e.id === entry.id ? { ...e, status } : e));
    } catch (e) {
      toastError('Failed to update status');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeFromQueue(id);
      setQueue(prev => prev.filter(e => e.id !== id));
      success('Entry removed');
    } catch (e) {
      toastError('Failed to remove entry');
    }
  };

  // Stats
  const waiting     = queue.filter(e => e.status === 'waiting').length;
  const inProgress  = queue.filter(e => e.status === 'in_progress').length;
  const completed   = queue.filter(e => e.status === 'completed').length;

  const filtered = filter === 'all' ? queue : queue.filter(e => e.status === filter);

  if (loading) {
    return <div className="text-center p-12 text-muted-foreground">Loading queue...</div>;
  }

  return (
    <div className="space-y-6">

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Waiting',     count: waiting,    color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20',   icon: <Clock className="h-5 w-5" />       },
          { label: 'In Progress', count: inProgress, color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20',     icon: <Users className="h-5 w-5" />      },
          { label: 'Completed',   count: completed,  color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: <CheckCircle2 className="h-5 w-5" /> },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-2xl border border-border/50 ${s.bg} flex items-center gap-3`}>
            <div className={`${s.color} opacity-80`}>{s.icon}</div>
            <div>
              <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Header: add + refresh ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'waiting', 'in_progress', 'completed', 'cancelled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border
                ${filter === f
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'}`}
            >
              {f === 'all' ? 'All' : statusConfig[f].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border rounded-xl bg-card transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Button onClick={() => setShowForm(v => !v)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Walk-In
          </Button>
        </div>
      </div>

      {/* ── Add patient form ── */}
      {showForm && (
        <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2">
          <h3 className="font-bold font-heading flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-emerald-500" /> Register Walk-In Patient
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Patient Name *</label>
              <Input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Phone</label>
              <Input value={patientPhone} onChange={e => setPatientPhone(e.target.value)} placeholder="Contact number" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Assign Doctor</label>
              <select
                value={selectedDoctorId}
                onChange={e => setSelectedDoctorId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Any available</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.userId || d.id}>
                    {d.staffName || d.staffEmail}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Department</label>
              <select
                value={selectedDeptId}
                onChange={e => setSelectedDeptId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">General / Any</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Notes (optional)</label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Chief complaint, priority notes..." />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={adding || !patientName.trim()}>
              {adding ? 'Adding...' : 'Add to Queue'}
            </Button>
          </div>
        </div>
      )}

      {/* ── Queue list ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center border border-dashed border-border rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <Users className="h-8 w-8 text-emerald-500" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Queue is empty</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === 'all' ? 'No patients in the queue. Add a walk-in to get started.' : `No patients with status "${statusConfig[filter as ClinicQueueEntry['status']]?.label}".`}
            </p>
          </div>
          {filter === 'all' && (
            <Button onClick={() => setShowForm(true)} className="gap-1.5">
              <Plus className="h-4 w-4" /> Add First Patient
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(entry => {
            const cfg = statusConfig[entry.status];
            const dept = departments.find(d => d.id === entry.departmentId);
            const doctor = doctors.find(d => d.userId === entry.doctorId || d.id === entry.doctorId);
            const checkedInTime = new Date(entry.checkedInAt).toLocaleTimeString([], { timeStyle: 'short' });
            return (
              <div
                key={entry.id}
                className={`p-4 rounded-2xl border ${cfg.border} ${cfg.bg} flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all`}
              >
                {/* Left: token + info */}
                <div className="flex items-start gap-4">
                  {entry.tokenNumber && (
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/70 dark:bg-black/20 border border-white/40 dark:border-white/10 flex flex-col items-center justify-center shadow-sm">
                      <p className="text-[9px] font-bold uppercase text-muted-foreground leading-none">No.</p>
                      <p className={`text-xl font-black leading-tight ${cfg.text}`}>{entry.tokenNumber}</p>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">{entry.patientName}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      {entry.patientPhone && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {entry.patientPhone}
                        </span>
                      )}
                      {dept && (
                        <span className="text-xs text-muted-foreground">
                          Dept: <span className="font-medium text-foreground">{dept.name}</span>
                        </span>
                      )}
                      {doctor && (
                        <span className="text-xs text-muted-foreground">
                          Dr: <span className="font-medium text-foreground">{doctor.staffName || doctor.staffEmail}</span>
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Checked in: <span className="font-medium">{checkedInTime}</span>
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">"{entry.notes}"</p>
                    )}
                  </div>
                </div>

                {/* Right: status badge + actions */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.text} bg-white/60 dark:bg-black/20 border border-white/40 dark:border-white/10`}>
                    {cfg.label}
                  </span>

                  {entry.status === 'waiting' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatus(entry, 'in_progress')}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white border-none"
                    >
                      Call In
                    </Button>
                  )}
                  {entry.status === 'in_progress' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatus(entry, 'completed')}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                    >
                      Complete
                    </Button>
                  )}
                  {(entry.status === 'waiting' || entry.status === 'in_progress') && (
                    <button
                      onClick={() => handleStatus(entry, 'cancelled')}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Cancel"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                  {(entry.status === 'completed' || entry.status === 'cancelled') && (
                    <button
                      onClick={() => handleRemove(entry.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Remove"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClinicQueueTab;
