import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/ui/ThemeToggle';
import NotificationBell from '../components/shared/NotificationBell';
import Logo from '../components/icons/Logo';
import {
  Building2, ClipboardList, Users, Clock,
  LogOut, BarChart3, TrendingUp,
  ShieldCheck, Calendar, KeyRound, FileText, ClipboardCheck,
  BedDouble, Pill, TestTube2, Wrench, Boxes
} from '../components/icons/Icons';
import { getClinic } from '../services/dataSupabase';
import { Clinic } from '../types';

// Tab components
import ClinicProfileTab    from '../components/clinic/ClinicProfileTab';
import ClinicDepartmentsTab from '../components/clinic/ClinicDepartmentsTab';
import ClinicStaffTab      from '../components/clinic/ClinicStaffTab';
import ClinicQueueTab      from '../components/clinic/ClinicQueueTab';
import ClinicAnalyticsTab  from '../components/clinic/ClinicAnalyticsTab';
import ClinicBillingTab    from '../components/clinic/ClinicBillingTab';
import AuditLogTab         from '../components/clinic/AuditLogTab';
import SchedulerConfigTab  from '../components/clinic/SchedulerConfigTab';
import PermissionsTab      from '../components/clinic/PermissionsTab';
import RateCardTab         from '../components/clinic/RateCardTab';
import IntakeBuilderTab    from '../components/clinic/IntakeBuilderTab';
import BedManagementTab    from '../components/clinic/BedManagementTab';
import PharmacyTab         from '../components/clinic/PharmacyTab';
import LabOrdersTab        from '../components/clinic/LabOrdersTab';
import InsuranceClaimsTab  from '../components/clinic/InsuranceClaimsTab';
import EquipmentTab        from '../components/clinic/EquipmentTab';
import CommerceSettingsTab from '../components/clinic/CommerceSettingsTab';

type ClinicTabType = 'profile' | 'departments' | 'staff' | 'queue' | 'analytics' | 'billing' | 'scheduler' | 'permissions' | 'ratecard' | 'intake' | 'audit'
  | 'beds' | 'pharmacy' | 'lab' | 'insurance' | 'equipment' | 'commerce';

// ─── NavItem ─────────────────────────────────────────────────────────────────
function NavItem({
  active, icon, label, badge, onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  onClick: () => void;
  key?: React.Key;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium relative
        ${active
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ClinicDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ClinicTabType>('profile');
  const [clinic, setClinic] = useState<Clinic | null>(null);

  // Load clinic name for sidebar display
  useEffect(() => {
    if (user) {
      getClinic(user.uid)
        .then(c => setClinic(c))
        .catch(console.error);
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems: { tab: ClinicTabType; icon: React.ReactNode; label: string; badge?: string }[] = [
    { tab: 'profile',     icon: <Building2 size={18} />,     label: 'Clinic Profile'  },
    { tab: 'departments', icon: <ClipboardList size={18} />, label: 'Departments'     },
    { tab: 'staff',       icon: <Users size={18} />,         label: 'Staff'           },
    { tab: 'queue',       icon: <Clock size={18} />,         label: 'OPD Queue', badge: 'Live' },
    { tab: 'analytics',   icon: <BarChart3 size={18} />,     label: 'Analytics'       },
    { tab: 'billing',     icon: <TrendingUp size={18} />,    label: 'Billing'         },
    { tab: 'scheduler',   icon: <Calendar size={18} />,      label: 'Scheduler'       },
    { tab: 'permissions', icon: <KeyRound size={18} />,      label: 'Permissions'     },
    { tab: 'ratecard',    icon: <FileText size={18} />,      label: 'Rate Card'       },
    { tab: 'intake',      icon: <ClipboardCheck size={18} />, label: 'Intake Forms'   },
    { tab: 'audit',       icon: <ShieldCheck size={18} />,   label: 'Audit Log'       },
    { tab: 'beds',        icon: <BedDouble size={18} />,     label: 'Beds & IPD'      },
    { tab: 'pharmacy',    icon: <Pill size={18} />,          label: 'Pharmacy'        },
    { tab: 'lab',         icon: <TestTube2 size={18} />,     label: 'Lab Orders'      },
    { tab: 'insurance',   icon: <ShieldCheck size={18} />,   label: 'Insurance'       },
    { tab: 'equipment',   icon: <Wrench size={18} />,        label: 'Equipment'       },
    { tab: 'commerce',    icon: <Boxes size={18} />,         label: 'Commerce'        },
  ];

  const tabTitle: Record<ClinicTabType, string> = {
    profile:     'Clinic Profile',
    departments: 'Departments',
    staff:       'Staff Management',
    queue:       'OPD Queue',
    analytics:   'Practice Analytics',
    billing:     'Billing & Revenue',
    scheduler:   'Scheduler Configuration',
    permissions: 'Roles & Permissions',
    ratecard:    'Rate Card',
    intake:      'Intake Form Builder',
    audit:       'Audit Log',
    beds:        'Beds & IPD',
    pharmacy:    'Pharmacy',
    lab:         'Lab Orders',
    insurance:   'Insurance Claims',
    equipment:   'Equipment Tracking',
    commerce:    'Clinic Commerce',
  };

  const tabSubtitle: Record<ClinicTabType, string> = {
    profile:     'Manage your clinic details, specialties, and contact info.',
    departments: 'Organise your clinic into departments for better routing.',
    staff:       'Invite and manage doctors, nurses, and front-desk staff.',
    queue:       'Real-time walk-in queue management for front-desk staff.',
    analytics:   'Patient volume, revenue, and doctor utilization across the clinic.',
    billing:     'Consolidated invoices and revenue across all your doctors.',
    scheduler:   'Configure appointment slot durations, buffers, and walk-in handling per doctor.',
    permissions: 'Define what each role can see and do within your clinic.',
    ratecard:    'Set prices and tax rates for consultations, procedures, and diagnostics.',
    intake:      'Build custom pre-visit intake forms with consent and e-signature capture.',
    audit:       'A record of staff and configuration changes for accountability and compliance.',
    beds:        'Manage wards, beds, and in-patient (IPD) admissions and discharges.',
    pharmacy:    'Track medicine stock, reorder levels, and dispense against inventory.',
    lab:         'Manage lab test orders from sample collection to completed results.',
    insurance:   'Track insurance claims from draft through submission to settlement.',
    equipment:   'Track medical equipment, status, location, and service schedules.',
    commerce:    'Configure pharmacy and lab partner integrations, markup, and delivery fees.',
  };

  const clinicName = clinic?.name || user?.displayName || 'Clinic';

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-card/50 backdrop-blur-xl h-screen sticky top-0 z-40 flex-shrink-0">
        {/* Logo */}
        <div className="p-4 flex items-center gap-2.5 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 shadow-sm">
            <Logo className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold font-heading tracking-tight">DocuMedic</span>
          <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
            Clinic
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ tab, icon, label, badge }) => (
            <NavItem
              key={tab}
              active={activeTab === tab}
              icon={icon}
              label={label}
              badge={badge}
              onClick={() => setActiveTab(tab)}
            />
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(clinicName)}&background=10b981&color=fff&bold=true`}
              alt={clinicName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-200 dark:ring-emerald-900 flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{clinicName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || 'Clinic Admin'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <ThemeToggle />
              {user?.uid && <NotificationBell userId={user.uid} />}
            </div>
            <button
              onClick={handleSignOut}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium flex items-center gap-1"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Top Header ── */}
      <div className="md:hidden flex-shrink-0">
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-white/90 dark:bg-background/90 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0">
              <Logo className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm truncate max-w-[140px]">{clinicName}</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user?.uid && <NotificationBell userId={user.uid} />}
            <button
              onClick={handleSignOut}
              className="text-xs text-muted-foreground hover:text-destructive font-medium"
            >
              Sign Out
            </button>
          </div>
        </header>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 md:h-screen">
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold font-heading">{tabTitle[activeTab]}</h1>
              <p className="text-muted-foreground text-sm mt-0.5">{tabSubtitle[activeTab]}</p>
            </div>

            {/* Tab content */}
            {user && (
              <>
                {activeTab === 'profile'     && <ClinicProfileTab    clinicId={user.uid} defaultName={user.displayName || ''} />}
                {activeTab === 'departments' && <ClinicDepartmentsTab clinicId={user.uid} />}
                {activeTab === 'staff'       && <ClinicStaffTab       clinicId={user.uid} />}
                {activeTab === 'queue'       && <ClinicQueueTab        clinicId={user.uid} />}
                {activeTab === 'analytics'   && <ClinicAnalyticsTab    clinicId={user.uid} />}
                {activeTab === 'billing'     && <ClinicBillingTab      clinicId={user.uid} />}
                {activeTab === 'scheduler'   && <SchedulerConfigTab    clinicId={user.uid} />}
                {activeTab === 'permissions' && <PermissionsTab        clinicId={user.uid} />}
                {activeTab === 'ratecard'    && <RateCardTab           clinicId={user.uid} />}
                {activeTab === 'intake'      && <IntakeBuilderTab      clinicId={user.uid} />}
                {activeTab === 'audit'       && <AuditLogTab           clinicId={user.uid} />}
                {activeTab === 'beds'        && <BedManagementTab      clinicId={user.uid} />}
                {activeTab === 'pharmacy'    && <PharmacyTab           clinicId={user.uid} />}
                {activeTab === 'lab'         && <LabOrdersTab          clinicId={user.uid} />}
                {activeTab === 'insurance'   && <InsuranceClaimsTab    clinicId={user.uid} />}
                {activeTab === 'equipment'   && <EquipmentTab          clinicId={user.uid} />}
                {activeTab === 'commerce'    && <CommerceSettingsTab   clinicId={user.uid} />}
              </>
            )}
          </motion.div>
        </div>
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-background/95 backdrop-blur-md border-t border-border/50">
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.map(n => (
            <button
              key={n.tab}
              onClick={() => setActiveTab(n.tab)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all relative
                ${activeTab === n.tab
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground hover:text-foreground'}`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${activeTab === n.tab ? 'bg-emerald-500/10' : ''}`}>
                {n.icon}
              </div>
              <span className="text-[10px] font-medium leading-none">{n.label}</span>
              {n.badge && (
                <span className="absolute -top-0.5 -right-0.5 text-[8px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-1 py-0.5 rounded-full leading-none">
                  {n.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default ClinicDashboard;
