import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getActiveClinicMembership } from '../services/dataSupabase';
import { ClinicStaff } from '../types';

export interface ClinicAccess {
  loading: boolean;
  clinicId: string | null;
  isOwner: boolean;
  staffRole: ClinicStaff['role'] | null;
}

// Resolves which clinic (if any) the signed-in user can access the clinic
// dashboard for: the clinic owner account itself, or an active clinic_staff
// member (front-desk/nurse/admin/doctor) of someone else's clinic.
export const useClinicAccess = (): ClinicAccess => {
  const { user, userRole } = useAuth();
  const [access, setAccess] = useState<ClinicAccess>({ loading: true, clinicId: null, isOwner: false, staffRole: null });

  useEffect(() => {
    if (!user) {
      setAccess({ loading: false, clinicId: null, isOwner: false, staffRole: null });
      return;
    }

    if (userRole === 'clinic') {
      setAccess({ loading: false, clinicId: user.uid, isOwner: true, staffRole: null });
      return;
    }

    let cancelled = false;
    setAccess(prev => ({ ...prev, loading: true }));
    getActiveClinicMembership(user.uid)
      .then(membership => {
        if (cancelled) return;
        setAccess({
          loading: false,
          clinicId: membership?.clinicId || null,
          isOwner: false,
          staffRole: membership?.role || null,
        });
      })
      .catch(() => {
        if (!cancelled) setAccess({ loading: false, clinicId: null, isOwner: false, staffRole: null });
      });

    return () => { cancelled = true; };
  }, [user, userRole]);

  return access;
};
