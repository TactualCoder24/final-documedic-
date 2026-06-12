import React, { useEffect, useState } from 'react';
import { getClinicAuditLog } from '../../services/dataSupabase';
import { AuditLogEntry } from '../../types';
import { ShieldCheck } from '../icons/Icons';

interface AuditLogTabProps {
  clinicId: string;
}

const ACTION_LABELS: Record<string, string> = {
  'staff.invite': 'Invited staff member',
  'staff.role_change': 'Changed staff role',
  'staff.status_change': 'Changed staff status',
  'staff.remove': 'Removed staff member',
};

const formatAction = (action: string): string => ACTION_LABELS[action] || action;

const AuditLogTab: React.FC<AuditLogTabProps> = ({ clinicId }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClinicAuditLog(clinicId)
      .then(setLogs)
      .finally(() => setLoading(false));
  }, [clinicId]);

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-card border border-border/50 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          A record of staff and configuration changes made within your clinic, for accountability and compliance.
        </p>
      </div>

      {loading ? (
        <div className="text-center p-6 text-muted-foreground">Loading audit log...</div>
      ) : logs.length === 0 ? (
        <div className="text-center p-6 text-muted-foreground border border-dashed rounded-xl text-sm">No audit log entries yet.</div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => (
            <div key={log.id} className="p-3 rounded-xl bg-card border border-border/40 flex items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-medium">{formatAction(log.action)}</p>
                {log.details && Object.keys(log.details).length > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(', ')}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-medium text-foreground">{log.actorName || 'Unknown'}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(log.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditLogTab;
