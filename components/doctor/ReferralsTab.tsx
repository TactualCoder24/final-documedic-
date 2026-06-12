import React, { useState, useEffect, useCallback } from 'react';
import { getIncomingReferrals, getOutgoingReferrals, updateReferralStatus } from '../../services/dataSupabase';
import { Referral } from '../../types';
import { Send, Inbox, Stethoscope, CheckCircle2, XCircle } from '../icons/Icons';
import Button from '../ui/Button';
import { useToast } from '../../hooks/useToast';

interface ReferralsTabProps {
  doctorId: string;
}

const statusStyles: Record<Referral['status'], string> = {
  pending: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  acknowledged: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  completed: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
  declined: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400',
};

const ReferralsTab: React.FC<ReferralsTabProps> = ({ doctorId }) => {
  const { success, error } = useToast();
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [incoming, setIncoming] = useState<Referral[]>([]);
  const [outgoing, setOutgoing] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inc, out] = await Promise.all([
        getIncomingReferrals(doctorId),
        getOutgoingReferrals(doctorId),
      ]);
      setIncoming(inc);
      setOutgoing(out);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (ref: Referral, status: Referral['status']) => {
    setUpdatingId(ref.id);
    try {
      const sharedRecordContext = status === 'acknowledged' && ref.referredToDoctorId
        ? { referredToDoctorId: ref.referredToDoctorId, patientId: ref.patientId }
        : undefined;
      await updateReferralStatus(ref.id, status, sharedRecordContext);
      success(status === 'acknowledged' ? 'Referral acknowledged — patient added to your list' : 'Referral updated');
      load();
    } catch (e) {
      console.error(e);
      error('Failed to update referral');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="text-center p-12 text-muted-foreground">Loading referrals...</div>;

  const list = tab === 'incoming' ? incoming : outgoing;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setTab('incoming')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'incoming' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border/50 text-muted-foreground hover:text-foreground'}`}
        >
          <Inbox className="h-4 w-4" /> Received {incoming.length > 0 && `(${incoming.length})`}
        </button>
        <button
          onClick={() => setTab('outgoing')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'outgoing' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border/50 text-muted-foreground hover:text-foreground'}`}
        >
          <Send className="h-4 w-4" /> Sent {outgoing.length > 0 && `(${outgoing.length})`}
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-center p-10 text-muted-foreground border border-dashed rounded-xl text-sm flex flex-col items-center gap-2">
          <Stethoscope className="h-6 w-6 opacity-50" />
          {tab === 'incoming' ? 'No referrals received yet.' : 'No referrals sent yet.'}
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(ref => (
            <div key={ref.id} className="p-4 rounded-xl bg-card border border-border/40 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">{new Date(ref.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  <p className="font-semibold text-sm mt-0.5">
                    {tab === 'incoming'
                      ? <>From Dr. {ref.referringDoctorName || 'Unknown'} — Patient: {ref.patientName || 'Unknown'}</>
                      : <>To {ref.referredToName}{ref.specialty ? ` (${ref.specialty})` : ''} — Patient: {ref.patientName || 'Unknown'}</>}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full shrink-0 ${statusStyles[ref.status]}`}>
                  {ref.status}
                </span>
              </div>
              <p className="text-sm text-foreground/90">{ref.reason}</p>
              {ref.notes && <p className="text-xs text-muted-foreground">{ref.notes}</p>}
              {tab === 'incoming' && ref.status === 'pending' && (
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="gap-1.5" disabled={updatingId === ref.id} onClick={() => handleStatusChange(ref, 'acknowledged')}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Acknowledge
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-destructive" disabled={updatingId === ref.id} onClick={() => handleStatusChange(ref, 'declined')}>
                    <XCircle className="h-3.5 w-3.5" /> Decline
                  </Button>
                </div>
              )}
              {tab === 'incoming' && ref.status === 'acknowledged' && (
                <div className="flex flex-col gap-1.5 pt-1">
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Patient added to your patient list with shared history.</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5" disabled={updatingId === ref.id} onClick={() => handleStatusChange(ref, 'completed')}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark Completed
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReferralsTab;
