import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, KeyRound, Lock, Shield, ShieldAlert, FileText, AlertTriangle, CheckCircle2 } from '../components/icons/Icons';
import Logo from '../components/icons/Logo';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';

const pillars = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: 'All your health data is encrypted in transit and at rest using AES-256 encryption — the same standard used by banks and governments worldwide. No one, including our team, can read your records.',
    color: 'from-blue-500/15 to-indigo-500/10',
    border: 'border-blue-200 dark:border-blue-800/40',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: ShieldCheck,
    title: 'Google-Powered Authentication',
    description: "DocuMedic uses Google's industry-leading OAuth 2.0 for authentication. No passwords stored, no weak login vectors. Your account is protected by the same security infrastructure that guards billions of Google accounts.",
    color: 'from-emerald-500/15 to-green-500/10',
    border: 'border-emerald-200 dark:border-emerald-800/40',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: KeyRound,
    title: 'You Own Your Data',
    description: "We will never sell, rent, or share your health data with third parties, advertisers, or insurers. Your data is yours alone. You decide what to share and with whom — always via your own secure, revocable emergency link.",
    color: 'from-violet-500/15 to-purple-500/10',
    border: 'border-violet-200 dark:border-violet-800/40',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    icon: Shield,
    title: 'Secure Cloud Infrastructure',
    description: 'Powered by Supabase and hosted on ISO 27001-certified infrastructure with automatic backups, failover protection, and geo-redundant data storage. Your records are safe even in worst-case scenarios.',
    color: 'from-amber-500/15 to-orange-500/10',
    border: 'border-amber-200 dark:border-amber-800/40',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    icon: ShieldAlert,
    title: 'Row-Level Security (RLS)',
    description: "Every Supabase table uses PostgreSQL's Row Level Security policies. Even at the database level, queries are filtered so that users can only ever access their own records — completely isolated from others.",
    color: 'from-rose-500/15 to-pink-500/10',
    border: 'border-rose-200 dark:border-rose-800/40',
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    icon: FileText,
    title: 'Transparent Privacy Policy',
    description: 'No hidden clauses or fine print. Our Privacy Policy is written in plain language and explains exactly what data we collect, why, and how it is used. You can delete your account and all data at any time.',
    color: 'from-cyan-500/15 to-sky-500/10',
    border: 'border-cyan-200 dark:border-cyan-800/40',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
];

const commitments = [
  'We will never sell your health data',
  'We will never share data with insurance companies',
  'We will never show health-targeted ads',
  'We will always let you export your data',
  'We will always let you delete your account instantly',
  'We will always be transparent about any security incidents',
];

const SecurityPage: React.FC = () => {
  return (
    <motion.div 
      className="min-h-screen bg-background text-foreground"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {/* Nav */}
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
            <Logo className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold font-heading">DocuMedic</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link to="/who-its-for" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Who It's For</Link>
          <ThemeToggle />
          <Button asChild size="sm">
            <Link to="/login">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>

    {/* Hero */}
    <section className="relative py-20 text-center overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900/30 dark:via-background dark:to-blue-900/5" />
      <motion.div
        className="container mx-auto px-4 max-w-3xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
            <ShieldCheck className="h-9 w-9 text-primary" />
          </div>
        </div>
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary mb-6">
          Security & Privacy
        </span>
        <h1 className="text-5xl sm:text-6xl font-black font-heading leading-tight">
          Your health data is <span className="text-gradient">nobody else's business</span>
        </h1>
        <p className="mt-6 text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          We're committed to the highest standards of data security and privacy. Here's exactly how we protect you — in plain language, no jargon.
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <Button asChild variant="gradient" size="lg">
            <Link to="/login">Start Securely</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/">← Back to Home</Link>
          </Button>
        </div>
      </motion.div>
    </section>

    {/* Security Pillars */}
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-2xl font-bold font-heading text-center mb-10">Our Security Architecture</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              className={`p-7 rounded-2xl bg-gradient-to-br ${p.color} border ${p.border}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.1 }}
            >
              <div className={`w-12 h-12 rounded-xl ${p.iconBg} flex items-center justify-center mb-5`}>
                <p.icon className={`h-6 w-6 ${p.iconColor}`} />
              </div>
              <h3 className="font-bold font-heading mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Our Commitments */}
    <section className="py-12 pb-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          className="p-10 rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-900/30 dark:to-blue-900/10 border border-slate-200 dark:border-slate-800/50"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />
            <h2 className="text-xl font-bold font-heading">Our Commitments to You</h2>
          </div>
          <div className="space-y-3">
            {commitments.map(c => (
              <div key={c} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <p className="text-sm font-medium text-foreground">{c}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>

    {/* Legal links */}
    <section className="py-8 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to="/privacy-policy"
            className="flex items-center gap-4 p-5 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-semibold group-hover:text-primary transition-colors">Privacy Policy</p>
              <p className="text-xs text-muted-foreground mt-0.5">What data we collect and why</p>
            </div>
            <span className="ml-auto text-muted-foreground group-hover:text-primary">→</span>
          </Link>
          <Link
            to="/terms-of-service"
            className="flex items-center gap-4 p-5 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
              <KeyRound className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="font-semibold group-hover:text-primary transition-colors">Terms of Service</p>
              <p className="text-xs text-muted-foreground mt-0.5">Your rights and responsibilities</p>
            </div>
            <span className="ml-auto text-muted-foreground group-hover:text-primary">→</span>
          </Link>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="py-8 border-t border-border">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} DocuMedic. All rights reserved.</p>
        <div className="flex gap-4">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link to="/features" className="hover:text-foreground transition-colors">Features</Link>
          <Link to="/who-its-for" className="hover:text-foreground transition-colors">Who It's For</Link>
          <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
        </div>
      </div>
    </footer>
    </motion.div>
  );
};

export default SecurityPage;
