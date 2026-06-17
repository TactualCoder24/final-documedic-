import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Activity, HeartPulse, Stethoscope, Baby, BookOpen, ShieldCheck } from '../components/icons/Icons';
import Logo from '../components/icons/Logo';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';

const personas = [
  {
    icon: Users,
    tag: 'For Caregivers',
    title: 'The Devoted Caregiver',
    headline: 'One dashboard for your whole family',
    description: "Juggling appointments, prescriptions, and records for multiple family members is exhausting. DocuMedic's family access lets you manage everyone's health from a single account — with each profile neatly separated.",
    color: 'from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10',
    border: 'border-blue-200 dark:border-blue-800/50',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    bullets: ['Manage records for parents, children, and partners', 'Share emergency profiles with family members', 'Get medication reminders for everyone'],
  },
  {
    icon: Activity,
    tag: 'For Chronic Conditions',
    title: 'The Chronic Illness Warrior',
    headline: 'Precision tracking for complex conditions',
    description: 'Managing a chronic illness means constant monitoring, multiple medications, and frequent doctor visits. DocuMedic gives you a complete picture of your health — so you can walk into every appointment prepared.',
    color: 'from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10',
    border: 'border-rose-200 dark:border-rose-800/50',
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
    bullets: ['Log vitals daily and spot trends early', 'Share AI-powered summaries with your doctor', 'Track medication adherence and side effects'],
  },
  {
    icon: HeartPulse,
    tag: 'For Wellness',
    title: 'The Health-Conscious Individual',
    headline: 'Go beyond basic fitness tracking',
    description: "You already track your steps and sleep — now take it further. DocuMedic connects your fitness habits to your actual medical data, giving you insights that help you make genuinely smarter decisions about your lifestyle.",
    color: 'from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    bullets: ['Correlate sleep, diet, and vitals', 'Get personalised AI lifestyle recommendations', 'Store all your annual check-up results in one place'],
  },
  {
    icon: Stethoscope,
    tag: 'For Doctors & Providers',
    title: 'The Healthcare Professional',
    headline: 'Better-prepared patients, better outcomes',
    description: 'When patients arrive with their complete, organised health history — including AI-generated summaries — consultations become significantly more productive. DocuMedic helps patients come prepared.',
    color: 'from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10',
    border: 'border-violet-200 dark:border-violet-800/50',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
    bullets: ['Patients arrive with organised records', 'AI-generated summaries speed up context-gathering', 'Emergency profiles accessible via QR in critical care'],
  },
  {
    icon: Baby,
    tag: 'For Parents',
    title: 'The Proactive Parent',
    headline: "Keep your child's health history complete",
    description: "From vaccination records to growth charts, a child's health history is complex and easy to lose track of. DocuMedic keeps everything in one secure place, so you're always ready for the school nurse or paediatrician.",
    color: 'from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10',
    border: 'border-amber-200 dark:border-amber-800/50',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    bullets: ['Store vaccination records and growth charts', 'Set medication reminders for children', 'Share medical history with school and doctors'],
  },
  {
    icon: BookOpen,
    tag: 'For Students',
    title: 'The Independent Student',
    headline: 'Your first time managing your own health',
    description: "Moving away from home means managing your health independently for the first time. DocuMedic makes it easy to stay on top of prescriptions, maintain your health records, and access emergency info — even in a new city.",
    color: 'from-cyan-50 to-sky-50 dark:from-cyan-900/10 dark:to-sky-900/10',
    border: 'border-cyan-200 dark:border-cyan-800/50',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    bullets: ['Keep all your health documents in the cloud', 'Never lose track of prescriptions or doses', 'Emergency QR card if you need urgent care'],
  },
];

const WhoItsForPage: React.FC = () => (
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
          <Link to="/security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Security</Link>
          <ThemeToggle />
          <Button asChild size="sm">
            <Link to="/login">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>

    {/* Hero */}
    <section className="relative py-20 text-center overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-emerald-900/5 dark:via-background dark:to-blue-900/5" />
      <motion.div
        className="container mx-auto px-4 max-w-3xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-6">
          <Users className="h-4 w-4" /> Who It's For
        </span>
        <h1 className="text-5xl sm:text-6xl font-black font-heading leading-tight">
          Built for <span className="text-gradient">every health journey</span>
        </h1>
        <p className="mt-6 text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Whether you're managing a chronic condition, caring for a family, or simply staying proactive — DocuMedic has a place for you.
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <Button asChild variant="gradient" size="lg">
            <Link to="/login">Find Your Fit</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/">← Back to Home</Link>
          </Button>
        </div>
      </motion.div>
    </section>

    {/* Persona Cards */}
    <section className="py-12 pb-24">
      <div className="container mx-auto px-4 max-w-5xl space-y-8">
        {personas.map((p, i) => (
          <motion.div
            key={p.tag}
            className={`flex flex-col md:flex-row gap-6 p-8 rounded-2xl bg-gradient-to-br ${p.color} border ${p.border}`}
            initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            {/* Icon */}
            <div className={`w-16 h-16 rounded-2xl ${p.iconBg} flex items-center justify-center shrink-0`}>
              <p.icon className={`h-8 w-8 ${p.iconColor}`} />
            </div>
            {/* Content */}
            <div className="flex-1">
              <span className={`text-xs font-bold uppercase tracking-widest ${p.iconColor}`}>{p.tag}</span>
              <h2 className="text-xl font-bold font-heading mt-1">{p.title}</h2>
              <p className="font-semibold text-muted-foreground mt-0.5 text-sm">{p.headline}</p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.description}</p>
              <ul className="mt-4 space-y-1.5">
                {p.bullets.map(b => (
                  <li key={b} className="flex items-center gap-2 text-sm">
                    <ShieldCheck className={`h-4 w-4 shrink-0 ${p.iconColor}`} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}

        {/* CTA */}
        <motion.div
          className="mt-8 rounded-3xl p-12 text-center animated-gradient shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold font-heading text-white">Ready to get started?</h2>
          <p className="mt-3 text-white/80 max-w-lg mx-auto">It takes under 2 minutes to set up your health profile. No credit card required.</p>
          <Button asChild size="lg" variant="white" className="mt-8 font-bold shadow-xl">
            <Link to="/login">Create Free Account →</Link>
          </Button>
        </motion.div>
      </div>
    </section>

    {/* Footer */}
    <footer className="py-8 border-t border-border">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} DocuMedic. All rights reserved.</p>
        <div className="flex gap-4">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link to="/features" className="hover:text-foreground transition-colors">Features</Link>
          <Link to="/security" className="hover:text-foreground transition-colors">Security</Link>
          <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
          <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
          <a href="https://www.instagram.com/documedicindia/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-pink-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="https://www.linkedin.com/company/documedic-india/about/?viewAsMember=true" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-blue-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
        </div>
      </div>
    </footer>
  </motion.div>
);

export default WhoItsForPage;
