import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ClinicDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-2xl"
      >
        {/* Icon */}
        <div className="w-28 h-28 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/20 flex items-center justify-center">
          <svg className="w-14 h-14 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
        </div>

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
            <div key={f.title} className="p-4 rounded-xl bg-card border border-border/60">
              <div className="text-2xl mb-2">{f.icon}</div>
              <p className="font-semibold text-sm">{f.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>

        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default ClinicDashboard;
