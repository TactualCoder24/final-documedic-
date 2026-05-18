import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/ui/ThemeToggle';
import Logo from '../components/icons/Logo';

const ClinicDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 shadow-sm">
            <Logo className="h-5 w-5 text-white" />
          </div>
          <span className="text-[1.05rem] font-bold font-heading text-slate-800 dark:text-foreground tracking-tight">DocuMedic</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <img
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'C')}&background=10b981&color=fff&bold=true&size=80`}
            alt={user?.displayName || 'Clinic'}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-200 dark:ring-emerald-900"
          />
          <button
            onClick={handleSignOut}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Background blobs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          {/* Icon */}
          <div className="w-28 h-28 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/20 flex items-center justify-center">
            <svg className="w-14 h-14 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          </div>

          {/* Welcome message */}
          {user?.displayName && (
            <p className="text-sm text-muted-foreground mb-2">Welcome, <span className="font-semibold text-foreground">{user.displayName}</span></p>
          )}

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Coming Soon — June 2026
          </div>

          <h1 className="text-5xl font-black font-heading text-foreground mb-4">
            Clinic & Hospital <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Portal</span>
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg mx-auto">
            An enterprise-grade operational hub for clinics and hospitals — manage your entire patient population, automate billing workflows, track OPD/IPD queues, and gain real-time analytics across departments.
          </p>

          {/* Features preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
            {[
              { icon: '🏥', title: 'Patient Population', desc: 'Manage all registered patients at scale' },
              { icon: '📊', title: 'OPD Analytics', desc: 'Live queue management and reporting' },
              { icon: '💳', title: 'Billing & Insurance', desc: 'Automated claims and invoice tracking' },
            ].map(f => (
              <div key={f.title} className="p-4 rounded-xl bg-card border border-border/60 hover:border-emerald-400/40 transition-colors">
                <div className="text-2xl mb-2">{f.icon}</div>
                <p className="font-semibold text-sm">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors">
              ← Go to Patient Dashboard
            </Link>
            <Link to="/doctor-dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              View Doctor Dashboard →
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ClinicDashboard;
