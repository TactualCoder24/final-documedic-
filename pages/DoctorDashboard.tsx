import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/ui/ThemeToggle';
import Logo from '../components/icons/Logo';

const DoctorDashboard: React.FC = () => {
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
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm">
            <Logo className="h-5 w-5 text-white" />
          </div>
          <span className="text-[1.05rem] font-bold font-heading text-slate-800 dark:text-foreground tracking-tight">DocuMedic</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <img
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'D')}&background=6366f1&color=fff&bold=true&size=80`}
            alt={user?.displayName || 'Doctor'}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-200 dark:ring-violet-900"
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
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          {/* Icon */}
          <div className="w-28 h-28 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center">
            <svg className="w-14 h-14 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>

          {/* Welcome message */}
          {user?.displayName && (
            <p className="text-sm text-muted-foreground mb-2">Welcome, <span className="font-semibold text-foreground">{user.displayName}</span></p>
          )}

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Coming Soon — June 2026
          </div>

          <h1 className="text-5xl font-black font-heading text-foreground mb-4">
            Doctor <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">Dashboard</span>
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg mx-auto">
            A powerful clinical workspace for doctors — view patient records, manage appointments, access AI-parsed lab results, and collaborate securely with your care team.
          </p>

          {/* Features preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
            {[
              { icon: '📋', title: 'Patient Records', desc: 'Access AI-parsed medical histories' },
              { icon: '🔬', title: 'Lab Insights', desc: 'Instant analysis of uploaded reports' },
              { icon: '📅', title: 'Appointment Hub', desc: 'Manage schedule and teleconsults' },
            ].map(f => (
              <div key={f.title} className="p-4 rounded-xl bg-card border border-border/60 hover:border-blue-400/40 transition-colors">
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
            <Link to="/clinic-dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              View Clinic Portal →
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
