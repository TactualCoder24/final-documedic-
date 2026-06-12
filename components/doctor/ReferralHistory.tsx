import React from 'react';
import { Send, Stethoscope } from '../icons/Icons';
import { Referral } from '../../types';

interface ReferralHistoryProps {
  referrals: Referral[];
}

const statusStyles: Record<Referral['status'], string> = {
  pending: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  acknowledged: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  completed: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
  declined: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400',
};

const ReferralHistory: React.FC<ReferralHistoryProps> = ({ referrals }) => {
  if (referrals.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground border border-dashed rounded-xl text-sm flex flex-col items-center gap-2">
        <Send className="h-6 w-6 opacity-50" />
        No referrals yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {referrals.map(ref => (
        <div key={ref.id} className="p-4 rounded-xl bg-card border border-border/40 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">{new Date(ref.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              <p className="font-semibold text-sm mt-0.5 flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5 text-primary" />
                Referred to {ref.referredToName}{ref.specialty ? ` (${ref.specialty})` : ''}
              </p>
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full shrink-0 ${statusStyles[ref.status]}`}>
              {ref.status}
            </span>
          </div>
          <p className="text-sm text-foreground/90">{ref.reason}</p>
          {ref.notes && <p className="text-xs text-muted-foreground">{ref.notes}</p>}
        </div>
      ))}
    </div>
  );
};

export default ReferralHistory;
