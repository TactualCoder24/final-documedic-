import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ui/ThemeToggle';
import Button from './ui/Button';
import { Menu, X, LogOut, Settings } from './icons/Icons';
import Logo from './icons/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { navGroups } from './navConfig';
import Breadcrumbs from './ui/Breadcrumbs';
import SpotlightTour from './walkthrough/SpotlightTour';
import OnboardingChecklist from './walkthrough/OnboardingChecklist';
import FeatureHint from './walkthrough/FeatureHint';
import { useOnboarding } from '../hooks/useOnboarding';
import { PENDING_ONBOARDING_KEY } from './walkthrough/LandingOnboardingWizard';
import { saveProfile, addMedication, addVital, addRecord } from '../services/dataSupabase';
import { useTranslation } from 'react-i18next';

const COLLAPSED_KEY = 'sidebar-collapsed-groups';

const tourDataMap: Record<string, string> = {
  '/dashboard': 'sidebar-dashboard',
};

const getInitialCollapsed = (): Record<string, boolean> => {
  try {
    const stored = localStorage.getItem(COLLAPSED_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

/* ── greeting helper ─────────────────────────────────────────────────── */
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

/* ── Type badge colors per nav group ─────────────────────────────────── */
const groupColors: Record<string, string> = {
  'Overview':         'text-blue-600 dark:text-blue-400',
  'My Health Record': 'text-emerald-600 dark:text-emerald-400',
  'Tools & Tracking': 'text-violet-600 dark:text-violet-400',
  'Care Planning':    'text-orange-500 dark:text-orange-400',
  'Connect':          'text-pink-500 dark:text-pink-400',
};

/* ════════════════════════════════════════════════
   SIDEBAR
════════════════════════════════════════════════ */
const Sidebar: React.FC<{ isOpen: boolean; toggle: () => void }> = ({ isOpen, toggle }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(getInitialCollapsed);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleGroup = (label: string) => {
    const next = { ...collapsed, [label]: !collapsed[label] };
    setCollapsed(next);
    localStorage.setItem(COLLAPSED_KEY, JSON.stringify(next));
  };

  const isGroupActive = (items: { path: string }[]) =>
    items.some(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));

  return (
    <>
      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen flex flex-col
          bg-white dark:bg-card
          border-r border-slate-100 dark:border-border/50
          shadow-[2px_0_16px_rgba(37,99,235,0.06)]
          transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 dark:border-border/50 shrink-0">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm group-hover:shadow-blue-200 dark:group-hover:shadow-blue-900 transition-shadow">
              <Logo className="h-5 w-5 text-white" />
            </div>
            <span className="text-[1.1rem] font-bold font-heading text-slate-800 dark:text-foreground tracking-tight">
              DocuMedic
            </span>
          </NavLink>
          <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={toggle} aria-label="Close menu">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-4">
          {navGroups.map((group) => {
            const isActive = isGroupActive(group.items);
            const isCollapsed = collapsed[group.label] && !isActive;
            const groupColor = groupColors[group.label] || 'text-muted-foreground';

            return (
              <div key={group.label}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={`flex items-center justify-between w-full px-2 py-1 mb-1 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-md ${groupColor} opacity-70 hover:opacity-100`}
                  aria-expanded={!isCollapsed}
                >
                  {t(`nav.group.${group.label}`, group.label)}
                  <motion.svg
                    animate={{ rotate: isCollapsed ? -90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-2.5 w-2.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </motion.svg>
                </button>

                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-0.5">
                        {group.items.map(({ path, label, icon: Icon }) => (
                          <NavLink
                            key={path}
                            to={path}
                            end={path === '/dashboard'}
                            className={({ isActive: linkActive }) =>
                              `relative flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 group/nav
                              ${linkActive
                                ? 'bg-blue-50 dark:bg-primary/15 text-blue-700 dark:text-primary font-semibold'
                                : 'text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-secondary/60 hover:text-slate-900 dark:hover:text-foreground'
                              }`
                            }
                            onClick={() => { if (isOpen) toggle(); }}
                            {...(tourDataMap[path] ? { 'data-tour': tourDataMap[path] } : {})}
                          >
                            {({ isActive: linkActive }) => (
                              <>
                                {linkActive && (
                                  <span className="nav-active-bar" aria-hidden="true" />
                                )}
                                <Icon className={`mr-2.5 h-4 w-4 shrink-0 transition-colors
                                  ${linkActive ? 'text-blue-600 dark:text-primary' : 'text-slate-400 dark:text-muted-foreground group-hover/nav:text-slate-600 dark:group-hover/nav:text-foreground'}`}
                                />
                                {t(`nav.item.${label}`, label)}
                              </>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Settings — standalone */}
          <div className="pt-2 border-t border-slate-100 dark:border-border/40">
            <NavLink
              to="/settings"
              className={({ isActive: linkActive }) =>
                `relative flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 group/nav
                ${linkActive
                  ? 'bg-blue-50 dark:bg-primary/15 text-blue-700 dark:text-primary font-semibold'
                  : 'text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-secondary/60 hover:text-slate-900 dark:hover:text-foreground'
                }`
              }
              onClick={() => { if (isOpen) toggle(); }}
            >
              {({ isActive: linkActive }) => (
                <>
                  {linkActive && <span className="nav-active-bar" aria-hidden="true" />}
                  <Settings className={`mr-2.5 h-4 w-4 shrink-0 ${linkActive ? 'text-blue-600 dark:text-primary' : 'text-slate-400 dark:text-muted-foreground'}`} />
                  {t('nav.item.Settings', 'Settings')}
                </>
              )}
            </NavLink>
          </div>
        </nav>

        {/* User profile footer */}
        <div className="shrink-0 px-4 py-4 border-t border-slate-100 dark:border-border/50 bg-slate-50/60 dark:bg-card">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white dark:hover:bg-secondary/40 transition-colors cursor-default">
            <div className="relative shrink-0">
              <img
                src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'U')}&background=2563eb&color=fff&bold=true&size=80`}
                alt={user?.displayName || 'User'}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-100 dark:ring-primary/20"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white dark:border-card rounded-full" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-slate-800 dark:text-foreground truncate leading-tight">{user?.displayName || 'User'}</p>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground truncate leading-tight mt-0.5">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 mt-2 px-3 py-2 text-sm font-medium text-slate-500 dark:text-muted-foreground rounded-lg hover:bg-red-50 dark:hover:bg-destructive/10 hover:text-red-600 dark:hover:text-destructive transition-all duration-150"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {t('nav.item.Sign Out', 'Sign Out')}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={toggle}
        />
      )}
    </>
  );
};

/* ════════════════════════════════════════════════
   HEADER
════════════════════════════════════════════════ */
const Header: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
  const { startTour, state } = useOnboarding();
  const { user } = useAuth();

  const firstName = user?.displayName?.split(' ')[0] || 'there';

  return (
    <header className="sticky top-0 z-30 flex items-center h-16 px-4 md:px-6 bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-slate-100 dark:border-border/50 shadow-[0_1px_8px_rgba(37,99,235,0.06)]">
      {/* Mobile menu + greeting (left) */}
      <div className="flex items-center gap-3 flex-1">
        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 text-slate-500" onClick={toggleSidebar} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-slate-800 dark:text-foreground leading-tight">
            {getGreeting()}, <span className="text-primary">{firstName}</span> 👋
          </p>
          <p className="text-xs text-slate-400 dark:text-muted-foreground leading-tight">{formatDate()}</p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {state.welcomeCompleted && (
          <button
            data-tour="tour-button"
            onClick={startTour}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-muted-foreground hover:text-primary hover:bg-blue-50 dark:hover:bg-primary/8 transition-all"
            title="Take a Tour"
          >
            <span>❓</span>
            <span className="hidden sm:inline">Tour</span>
          </button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
};

/* ════════════════════════════════════════════════
   LAYOUT ROOT
════════════════════════════════════════════════ */
const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const { user } = useAuth();
  const { startTour, completeWelcome, state } = useOnboarding();

  React.useEffect(() => {
    if (!user) return;

    const pendingDataStr = localStorage.getItem(PENDING_ONBOARDING_KEY);
    if (pendingDataStr) {
      try {
        const pendingData = JSON.parse(pendingDataStr);

        const saveData = async () => {
          try {
            if (pendingData.profile) {
              await saveProfile(user.uid, pendingData.profile);
            }
            if (pendingData.medications && Array.isArray(pendingData.medications)) {
              await Promise.all(
                pendingData.medications.map((med: string) => {
                  if (med === 'None') return Promise.resolve();
                  return addMedication(user.uid, { name: med, dosage: 'As prescribed', frequency: 'Daily' });
                })
              );
            }
            if (pendingData.vitals) {
              const { sugar, systolic, diastolic } = pendingData.vitals;
              if (sugar || systolic || diastolic) {
                await addVital(user.uid, { sugar, systolic, diastolic });
              }
            }
            if (pendingData.documents && Array.isArray(pendingData.documents)) {
              await Promise.all(
                pendingData.documents.map(async (doc: any) => {
                  try {
                    const arr = doc.data.split(',');
                    const bstr = atob(arr[1]);
                    let n = bstr.length;
                    const u8arr = new Uint8Array(n);
                    while (n--) { u8arr[n] = bstr.charCodeAt(n); }
                    const file = new File([u8arr], doc.name, { type: doc.type });
                    await addRecord(user.uid, { name: doc.name.split('.')[0] || doc.name, type: 'Lab Report', file });
                  } catch (err) {
                    console.error('Error uploading pending document:', err);
                  }
                })
              );
            }
          } finally {
            window.dispatchEvent(new Event('onboarding-data-saved'));
          }
        };
        saveData();
        localStorage.removeItem(PENDING_ONBOARDING_KEY);
        completeWelcome();
        setTimeout(() => { startTour(); }, 500);
      } catch (e) {
        console.error('Failed to process pending onboarding data:', e);
        localStorage.removeItem(PENDING_ONBOARDING_KEY);
      }
    } else if (!state.welcomeCompleted && !state.tourCompleted) {
      completeWelcome();
      setTimeout(() => startTour(), 500);
    }
  }, [user, completeWelcome, startTour, state.welcomeCompleted, state.tourCompleted]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <a href="#main-content" className="skip-to-content">Skip to main content</a>
      <Sidebar isOpen={sidebarOpen} toggle={toggleSidebar} />
      <div className="md:pl-64">
        <Header toggleSidebar={toggleSidebar} />
        <main id="main-content" className="p-4 sm:p-6 lg:p-8" role="main" tabIndex={-1}>
          <Breadcrumbs />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <SpotlightTour />
      <OnboardingChecklist />
      <FeatureHint />
    </div>
  );
};

export default Layout;