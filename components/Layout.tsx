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
import { saveProfile, addMedication, addVital } from '../services/dataSupabase';

const COLLAPSED_KEY = 'sidebar-collapsed-groups';

// Map nav paths to tour data attribute names for spotlight targeting
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

const Sidebar: React.FC<{ isOpen: boolean; toggle: () => void }> = ({ isOpen, toggle }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  const activeLinkClass = "bg-primary/10 text-primary dark:bg-primary/20";
  const inactiveLinkClass = "text-muted-foreground hover:text-foreground hover:bg-muted/50";

  return (
    <>
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-card border-r border-border/60 transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/60">
          <NavLink to="/dashboard" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-heading">DocuMedic</span>
          </NavLink>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggle} aria-label="Close menu">
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          <nav className="flex-1 px-2 py-3 overflow-y-auto custom-scrollbar space-y-1">
            {navGroups.map((group) => {
              const isActive = isGroupActive(group.items);
              const isCollapsed = collapsed[group.label] && !isActive;

              return (
                <div key={group.label}>
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors rounded-md"
                    aria-expanded={!isCollapsed}
                  >
                    {group.label}
                    <motion.svg
                      animate={{ rotate: isCollapsed ? -90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="h-3 w-3 opacity-40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
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
                        <div className="space-y-0.5 pb-2">
                          {group.items.map(({ path, label, icon: Icon }) => (
                            <NavLink
                              key={path}
                              to={path}
                              end={path === '/dashboard'}
                              className={({ isActive: linkActive }) => `flex items-center px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${linkActive ? activeLinkClass : inactiveLinkClass}`}
                              onClick={() => { if (isOpen) toggle() }}
                              {...(tourDataMap[path] ? { 'data-tour': tourDataMap[path] } : {})}
                            >
                              <Icon className="mr-3 h-4 w-4" />
                              {label}
                            </NavLink>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Settings — standalone at bottom of nav */}
            <div className="pt-1 border-t border-border/40">
              <NavLink
                to="/settings"
                className={({ isActive: linkActive }) => `flex items-center px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${linkActive ? activeLinkClass : inactiveLinkClass}`}
                onClick={() => { if (isOpen) toggle() }}
              >
                <Settings className="mr-3 h-4 w-4" />
                Settings
              </NavLink>
            </div>
          </nav>
          <div className="px-4 py-4 border-t border-border/60">
            <div className="flex items-center gap-3 px-3 py-2">
              <img src={user?.photoURL || "https://i.pravatar.cc/150?u=priya-sharma"} alt="User" className="w-10 h-10 rounded-full" />
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{user?.displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start mt-2 text-muted-foreground hover:text-destructive" onClick={handleSignOut}>
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={toggle}></div>}
    </>
  );
};

const Header: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
  const { startTour, state } = useOnboarding();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-background/80 backdrop-blur-sm border-b border-border/60 md:justify-end">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar} aria-label="Open menu">
        <Menu className="h-6 w-6" />
      </Button>
      <div className="flex items-center gap-3">
        {state.welcomeCompleted && (
          <button
            data-tour="tour-button"
            onClick={startTour}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
            title="Take a Tour"
          >
            <span>❓</span>
            <span className="hidden sm:inline">Take a Tour</span>
          </button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
};

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const { user } = useAuth();
  const { startTour, completeWelcome, state } = useOnboarding();

  // Process pending onboarding data from the Landing page wizard
  React.useEffect(() => {
    if (!user) return;

    const pendingDataStr = localStorage.getItem(PENDING_ONBOARDING_KEY);
    if (pendingDataStr) {
      try {
        const pendingData = JSON.parse(pendingDataStr);

        // 1. Save data async so we don't block the UI
        const saveData = async () => {
          if (pendingData.profile) {
            await saveProfile(user.uid, pendingData.profile);
          }
          if (pendingData.medications && Array.isArray(pendingData.medications)) {
            await Promise.all(
              pendingData.medications.map((med: string) =>
                addMedication(user.uid, { name: med, dosage: 'As prescribed', frequency: 'Daily' })
              )
            );
          }
          if (pendingData.vitals) {
            const { sugar, systolic, diastolic } = pendingData.vitals;
            if (sugar || systolic || diastolic) {
              await addVital(user.uid, { sugar, systolic, diastolic });
            }
          }
        };
        saveData();

        // 2. Clean up local storage
        localStorage.removeItem(PENDING_ONBOARDING_KEY);

        // 3. Mark welcome as complete and start the tour
        completeWelcome();
        // Slight delay to ensure dashboard is mounted before spotlight targets are pinged
        setTimeout(() => {
          startTour();
        }, 500);

      } catch (e) {
        console.error("Failed to process pending onboarding data:", e);
        localStorage.removeItem(PENDING_ONBOARDING_KEY);
      }
    } else if (!state.welcomeCompleted && !state.tourCompleted) {
      // Fallback: If they skipped landing page directly to login, just start tour
      completeWelcome();
      setTimeout(() => startTour(), 500);
    }
  }, [user, completeWelcome, startTour, state.welcomeCompleted, state.tourCompleted]);

  return (
    <div className="min-h-screen bg-secondary/30 dark:bg-background">
      <Sidebar isOpen={sidebarOpen} toggle={toggleSidebar} />
      <div className="md:pl-64">
        <Header toggleSidebar={toggleSidebar} />
        <main className="p-4 sm:p-6 lg:p-8">
          <Breadcrumbs />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Walkthrough System Layers */}
      <SpotlightTour />
      <OnboardingChecklist />
      <FeatureHint />
    </div>
  );
};

export default Layout;