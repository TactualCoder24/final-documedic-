import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Pill, BrainCircuit, Bell, Lightbulb, QrCode, HeartPulse, Activity, ClipboardList, Moon, Utensils, Users, CalendarDays, ShieldCheck } from '../components/icons/Icons';
import Logo from '../components/icons/Logo';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';

const allFeatures = [
  {
    icon: FileText,
    title: 'Medical Records',
    tag: 'Records',
    color: 'from-blue-500/20 to-blue-600/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    description: 'Securely upload, organise, and access all your health reports, prescriptions, and consultation notes in one place. Works with photos, PDFs, and scanned documents.',
  },
  {
    icon: Pill,
    title: 'Medication Tracking',
    tag: 'Medications',
    color: 'from-emerald-500/20 to-emerald-600/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    description: 'Log your medications, set dosage schedules, track daily adherence, and get reminders so you never miss a dose again.',
  },
  {
    icon: BrainCircuit,
    title: 'AI Health Summary',
    tag: 'AI-Powered',
    color: 'from-violet-500/20 to-violet-600/10',
    iconColor: 'text-violet-600 dark:text-violet-400',
    description: 'Get an AI-powered, plain-language summary of your entire health profile — lab results, vitals, medications — ready to share with any doctor in seconds.',
  },
  {
    icon: HeartPulse,
    title: 'Vitals Tracking',
    tag: 'Monitoring',
    color: 'from-rose-500/20 to-rose-600/10',
    iconColor: 'text-rose-600 dark:text-rose-400',
    description: 'Track blood pressure, blood sugar, heart rate, and more. See trends over time with beautiful charts and get instant alerts for out-of-range readings.',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    tag: 'Reminders',
    color: 'from-amber-500/20 to-amber-600/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    description: 'Set personalised reminders for medications, appointments, and wellness habits. DocuMedic nudges you at the right time so you stay on track effortlessly.',
  },
  {
    icon: QrCode,
    title: 'Emergency QR Card',
    tag: 'Safety',
    color: 'from-cyan-500/20 to-cyan-600/10',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    description: 'Generate a secure, scannable QR code linking to your emergency health profile. Share critical info like allergies and blood type with first responders instantly.',
  },
  {
    icon: Lightbulb,
    title: 'AI Lifestyle Tips',
    tag: 'Wellness',
    color: 'from-orange-500/20 to-orange-600/10',
    iconColor: 'text-orange-600 dark:text-orange-400',
    description: 'Receive personalised wellness suggestions powered by your actual health data — not generic advice. Better sleep, diet, and activity guidance tailored to you.',
  },
  {
    icon: Activity,
    title: 'Symptom Tracker',
    tag: 'Tracking',
    color: 'from-pink-500/20 to-pink-600/10',
    iconColor: 'text-pink-600 dark:text-pink-400',
    description: 'Log symptoms with severity scores and timestamps. Spot patterns over time and share a complete symptom history with your doctor before your next visit.',
  },
  {
    icon: Moon,
    title: 'Sleep Tracker',
    tag: 'Wellness',
    color: 'from-indigo-500/20 to-indigo-600/10',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    description: 'Log sleep duration and quality each night. Understand how rest affects your vitals and mood with weekly trend visualisations.',
  },
  {
    icon: Utensils,
    title: 'Food Journal',
    tag: 'Nutrition',
    color: 'from-green-500/20 to-green-600/10',
    iconColor: 'text-green-600 dark:text-green-400',
    description: 'Log meals by type and track your nutritional habits over time. See how your diet correlates with energy levels, blood sugar, and weight.',
  },
  {
    icon: Users,
    title: 'Family Access',
    tag: 'Caregiving',
    color: 'from-teal-500/20 to-teal-600/10',
    iconColor: 'text-teal-600 dark:text-teal-400',
    description: 'Manage health records for your entire family from a single account. Perfect for parents looking after children or caregivers supporting elderly relatives.',
  },
  {
    icon: CalendarDays,
    title: 'Appointment Manager',
    tag: 'Scheduling',
    color: 'from-sky-500/20 to-sky-600/10',
    iconColor: 'text-sky-600 dark:text-sky-400',
    description: 'Schedule, track, and prepare for medical appointments. Get pre-visit summaries and post-visit notes to make every doctor interaction more productive.',
  },
];

const FeaturesPage: React.FC = () => (
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
          <Link to="/who-its-for" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Who It's For</Link>
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
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-primary/5 dark:via-background dark:to-background" />
      <motion.div
        className="container mx-auto px-4 max-w-3xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary mb-6">
          <ShieldCheck className="h-4 w-4" /> All Features
        </span>
        <h1 className="text-5xl sm:text-6xl font-black font-heading leading-tight">
          Everything you need for <span className="text-gradient">smarter health</span>
        </h1>
        <p className="mt-6 text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          DocuMedic brings together 12+ powerful features to give you complete visibility and control over your health — from day-to-day tracking to emergency preparedness.
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <Button asChild variant="gradient" size="lg">
            <Link to="/login">Start for Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/">← Back to Home</Link>
          </Button>
        </div>
      </motion.div>
    </section>

    {/* Features Grid */}
    <section className="py-16 pb-24">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              className={`group p-7 rounded-2xl bg-gradient-to-br ${feature.color} border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: (i % 6) * 0.06 }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-white dark:bg-card flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-base font-heading">{feature.title}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-muted-foreground">{feature.tag}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Banner */}
        <motion.div
          className="mt-16 rounded-3xl p-12 text-center animated-gradient shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold font-heading text-white">Ready to get started?</h2>
          <p className="mt-3 text-white/80 max-w-lg mx-auto">Join DocuMedic today and take control of your health journey.</p>
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
          <Link to="/who-its-for" className="hover:text-foreground transition-colors">Who It's For</Link>
          <Link to="/security" className="hover:text-foreground transition-colors">Security</Link>
          <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
        </div>
      </div>
    </footer>
  </motion.div>
);

export default FeaturesPage;
