import React, { useEffect, useState, useCallback } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { InsuranceClaim } from '../../types';
import { getInsuranceClaims, createInsuranceClaim, updateInsuranceClaimStatus } from '../../services/dataSupabase';
import { useToast } from '../../hooks/useToast';
import { ShieldCheck, Plus } from '../icons/Icons';

interface InsuranceClaimsTabProps {
  clinicId: string;
}

const STATUSES: InsuranceClaim['status'][] = ['draft', 'submitted', 'approved', 'rejected', 'settled'];

const statusLabels: Record<InsuranceClaim['status'], string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
  settled: 'Settled',
};

const statusStyles: Record<InsuranceClaim['status'], string> = {
  draft: 'bg-secondary text-muted-foreground',
  submitted: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  approved: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  rejected: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400',
  settled: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
};

const InsuranceClaimsTab: React.FC<InsuranceClaimsTabProps> = ({ clinicId }) => {
  const { success, error: toastError } = useToast();
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [patientName, setPatientName] = useState('');
  const [insurerName, setInsurerName] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [claimAmount, setClaimAmount] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getInsuranceClaims(clinicId);
      setClaims(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!patientName.trim() || !insurerName.trim() || !claimAmount) {
      toastError('Enter patient name, insurer, and claim amount');
      return;
    }
    setSaving(true);
    try {
      await createInsuranceClaim(clinicId, {
        patientName: patientName.trim(),
        insurerName: insurerName.trim(),
        policyNumber: policyNumber.trim() || undefined,
        claimAmount: parseFloat(claimAmount),
      });
      setPatientName(''); setInsurerName(''); setPolicyNumber(''); setClaimAmount('');
      success('Claim created');
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to create claim');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (claim: InsuranceClaim, status: InsuranceClaim['status']) => {
    try {
      await updateInsuranceClaimStatus(claim.id, status);
      load();
    } catch (e) {
      console.error(e);
      toastError('Failed to update claim');
    }
  };

  const totalsByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = claims.filter(c => c.status === s).reduce((sum, c) => sum + c.claimAmount, 0);
    return acc;
  }, {} as Record<InsuranceClaim['status'], number>);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-card border border-border/50 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Track insurance claims from draft through submission to settlement.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATUSES.map(s => (
          <div key={s} className="p-3 rounded-xl bg-card border border-border/40 text-center">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{statusLabels[s]}</p>
            <p className="text-lg font-bold font-heading">₹{totalsByStatus[s].toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
        <h3 className="font-bold font-heading mb-3 text-sm">New Claim</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Patient name" />
          <Input value={insurerName} onChange={e => setInsurerName(e.target.value)} placeholder="Insurer name" />
          <Input value={policyNumber} onChange={e => setPolicyNumber(e.target.value)} placeholder="Policy number (optional)" />
          <Input type="number" min="0" step="0.01" value={claimAmount} onChange={e => setClaimAmount(e.target.value)} placeholder="Claim amount (₹)" />
          <Button onClick={handleAdd} disabled={saving} className="gap-1.5">
            <Plus className="h-4 w-4" /> Create
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-6 text-muted-foreground">Loading claims...</div>
      ) : claims.length === 0 ? (
        <div className="text-center p-6 text-muted-foreground border border-dashed rounded-xl text-sm">No insurance claims yet.</div>
      ) : (
        <div className="space-y-2">
          {claims.map(claim => (
            <div key={claim.id} className="p-3 rounded-xl bg-card border border-border/40 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-sm">{claim.patientName} — {claim.insurerName}</p>
                <p className="text-xs text-muted-foreground">
                  {claim.policyNumber ? `Policy ${claim.policyNumber} · ` : ''}₹{claim.claimAmount.toLocaleString()}
                  {' · '}{new Date(claim.createdAt).toLocaleDateString()}
                </p>
              </div>
              <select
                value={claim.status}
                onChange={e => handleStatusChange(claim, e.target.value as InsuranceClaim['status'])}
                className={`h-8 rounded-full px-2 text-xs font-semibold border-0 ${statusStyles[claim.status]}`}
              >
                {STATUSES.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InsuranceClaimsTab;
