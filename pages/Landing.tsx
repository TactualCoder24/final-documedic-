import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Skeleton from '../components/ui/Skeleton';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { FileText, Pill, BrainCircuit, Bell, Lightbulb, QrCode, HeartPulse, Users, Activity, ShieldCheck, KeyRound, Lock, Menu, X, CalendarDays } from '../components/icons/Icons';
import Logo from '../components/icons/Logo';
import ThemeToggle from '../components/ui/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import SwasthyaAssistant from '../components/SwasthyaAssistant';
import BetaRegistrationModal from '../components/BetaRegistrationModal';
import LandingOnboardingWizard from '../components/walkthrough/LandingOnboardingWizard';

const features = [
  {
    icon: FileText,
    title: 'Centralized Medical Records',
    description: 'Securely upload, store, and access all your health reports, prescriptions, and notes in one place.',
  },
  {
    icon: Pill,
    title: 'Medication Tracking',
    description: 'Log your medications, track adherence, and monitor effectiveness to stay on top of your treatment plan.',
  },
  {
    icon: BrainCircuit,
    title: 'Smart Health Summary',
    description: 'Get an AI-powered, easy-to-understand summary of your health profile, ready to share with doctors.',
  },
  {
    icon: QrCode,
    title: 'Secure Sharing',
    description: 'Instantly generate a secure QR code or link to share your emergency info with healthcare providers.',
  },
  {
    icon: Bell,
    title: 'Custom Reminders',
    description: 'Set personalized alerts for medications, appointments, and healthy habits so you never miss a beat.',
  },
  {
    icon: Lightbulb,
    title: 'AI-Powered Insights',
    description: 'Receive personalized lifestyle tips and insights to help you make smarter decisions for your health.',
  },
];

const personas = [
  {
    icon: Users,
    title: 'For the Caregiver',
    description: "Effortlessly manage your loved one's appointments and medications from one central dashboard.",
  },
  {
    icon: Activity,
    title: 'For the Chronically Ill',
    description: 'Track your vitals and symptoms with precision, and share AI-powered summaries with your doctor to improve your care.',
  },
  {
    icon: HeartPulse,
    title: 'For the Health-Conscious',
    description: 'Go beyond basic tracking with personalized lifestyle tips and a complete, long-term view of your health journey.',
  },
];

const securityFeatures = [
  {
    icon: ShieldCheck,
    title: "Secure Authentication",
    description: "Powered by Google's industry-leading security to protect your account.",
  },
  {
    icon: KeyRound,
    title: "You're In Control",
    description: "You own your data and decide what to share with your secure emergency link.",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "Your information is encrypted, ensuring your sensitive health data remains private.",
  },
];

const InteractiveDashboardMockup = () => {
  const featuresList = ['vitals', 'sugar', 'meds'];
  const [activeFeature, setActiveFeature] = useState<string>(featuresList[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prevFeature => {
        const currentIndex = featuresList.indexOf(prevFeature);
        const nextIndex = (currentIndex + 1) % featuresList.length;
        return featuresList[nextIndex];
      });
    }, 4000); // Cycle every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const featuresInfo: { [key: string]: { title: string; description: string; position: string } } = {
    vitals: { title: 'Live Vitals Chart', description: 'Track your key metrics like blood sugar over time with clear, intuitive charts.', position: 'top-1/2 -translate-y-1/2 right-full mr-4' },
    sugar: { title: 'Daily Log', description: 'Quickly log your daily numbers to maintain a consistent health record.', position: 'bottom-0 right-full mr-4' },
    meds: { title: 'Medication Reminders', description: 'Stay on track with timely reminders for your next dose.', position: 'bottom-0 right-full mr-4' },
  };

  const feature = featuresInfo[activeFeature];

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="absolute -top-8 -right-8 w-40 h-40 bg-primary/10 rounded-full blur-3xl dark:opacity-50"></div>
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl dark:opacity-50"></div>

      <div className="relative">
        <Card className="relative p-2 sm:p-4 shadow-2xl dark:shadow-black/40 border-border/60">
          <div className="flex items-center gap-1.5 mb-2" aria-hidden="true">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="bg-secondary/30 p-4 rounded-lg relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-sm sm:text-base">Vitals Overview</h3>
              <div className="w-20 h-2 bg-muted rounded-full"></div>
            </div>

            <div
              className="w-full h-24 sm:h-32 rounded-md bg-muted/50 flex items-end p-2 gap-1.5 overflow-hidden relative"
              aria-label="Animated vitals chart"
            >
              <AnimatePresence>
                {activeFeature === 'vitals' && (
                  <motion.div
                    className="absolute inset-0 bg-primary/10 rounded-md border-2 border-dashed border-primary/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>
              <div className="w-full h-1/2 bg-primary/40 rounded-t-sm"></div>
              <div className="w-full h-3/4 bg-primary/40 rounded-t-sm"></div>
              <div className="w-full h-1/3 bg-primary/40 rounded-t-sm"></div>
              <div className="w-full h-2/3 bg-primary/40 rounded-t-sm"></div>
              <div className="w-full h-1/2 bg-primary/40 rounded-t-sm"></div>
              <div className="w-full h-3/5 bg-primary/40 rounded-t-sm"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div
                className="bg-muted/50 p-2 rounded-md relative"
                aria-label="Animated blood sugar log"
              >
                <AnimatePresence>
                  {activeFeature === 'sugar' && (
                    <motion.div
                      className="absolute inset-0 bg-primary/10 rounded-md border-2 border-dashed border-primary/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </AnimatePresence>
                <p className="text-xs text-muted-foreground">Blood Sugar</p>
                <p className="font-bold text-sm sm:text-lg">108 <span className="text-xs font-normal">mg/dL</span></p>
              </div>
              <div
                className="bg-muted/50 p-2 rounded-md relative"
                aria-label="Animated medication reminder"
              >
                <AnimatePresence>
                  {activeFeature === 'meds' && (
                    <motion.div
                      className="absolute inset-0 bg-primary/10 rounded-md border-2 border-dashed border-primary/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </AnimatePresence>
                <p className="text-xs text-muted-foreground">Next Meds</p>
                <p className="font-bold text-sm sm:text-lg">Metformin</p>
              </div>
            </div>
          </div>
        </Card>

        <AnimatePresence>
          {feature && (
            <motion.div
              id="feature-tooltip"
              role="tooltip"
              key={activeFeature}
              initial={{ opacity: 0, scale: 0.9, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 10 }}
              transition={{ duration: 0.2 }}
              className={`absolute w-64 p-4 bg-card border border-border rounded-lg shadow-xl ${feature.position} z-20`}
            >
              <h4 className="font-bold text-sm text-primary">{feature.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};


const Landing: React.FC = () => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false);

  useEffect(() => {
    // This effect handles scrolling when a user navigates to this page
    // with a hash in the URL (e.g., from a link on the privacy policy page).
    if (location.hash) {
      const id = location.hash.substring(1); // remove #
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100); // A small delay ensures the page has rendered before scrolling.
    }
  }, [location.hash]);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    // This handler is for same-page navigation on the landing page.
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update URL hash without a full page reload for better UX.
        window.history.pushState(null, '', `/#${id}`);
      }
    }
    // If on another page, the <Link> component will handle navigation,
    // and the useEffect above will handle the scroll on the Landing page.
  };

  if (loading || user) {
    return (
      <div className="min-h-screen soft-aurora flex pt-20 justify-center">
         <Skeleton variant="dashboard" />
      </div>
    )
  }

  const GradientBackground: React.FC = () => (
    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-50/50 via-white to-white dark:from-primary/10 dark:via-background dark:to-background animate-background-pan bg-[length:200%_200%]"></div>
  );

  const howItWorksSteps = [
    {
      step: 1,
      title: 'Sign Up Securely',
      description: 'Create your account in seconds using secure Google authentication.',
    },
    {
      step: 2,
      title: 'Log Your Data',
      description: 'Easily upload records, track medications, and update your vitals.',
    },
    {
      step: 3,
      title: 'Gain Insights',
      description: 'Receive smart summaries, reminders, and tips to improve your health.',
    },
  ];

  return (
    <div className="bg-background text-foreground">
      <LandingOnboardingWizard />
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-20 px-4">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-heading">DocuMedic</span>
          </Link>
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/community">{t('nav.item.Community', 'Community')}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/mentibot">{t('nav.item.Mentibot', 'Mentibot')}</Link>
            </Button>
            <ThemeToggle />
            <Button asChild>
              <Link to="/login">{t('landing.get_started', 'Get Started')}</Link>
            </Button>
          </div>
          {/* Mobile Nav Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Button variant="ghost" asChild>
                <Link to="/community" onClick={() => setIsMenuOpen(false)}>{t('nav.item.Community', 'Community')}</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/mentibot" onClick={() => setIsMenuOpen(false)}>{t('nav.item.Mentibot', 'Mentibot')}</Link>
              </Button>
              <Button asChild size="lg" className="w-full">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>{t('landing.get_started', 'Get Started')}</Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* ================================================================
            HERO SECTION — Aurora Glassmorphism (production-grade rewrite)
            Root cause fixes:
            1. mix-blend-multiply on dark bg renders blobs invisible → pure CSS aurora blobs
            2. Zero font hierarchy contrast → Manrope 900 display + shimmer gradient text
            3. Flat bento cards → true glassmorphism with backdrop-filter + inner glow
            4. No orchestrated entrance → staggered CSS animation-delay reveals
            5. Generic CTA buttons → luminous glow-pulse gradient buttons
            6. Missing live status dots → pulsing ring indicator on status badges
        ================================================================ */}
        <section className="hero-aurora-bg min-h-screen flex flex-col justify-center pt-20 pb-16">
          {/* Aurora blob orbs — CSS-only, no JS needed */}
          <div className="hero-blob-1" aria-hidden="true" />
          <div className="hero-blob-2" aria-hidden="true" />
          <div className="hero-blob-3" aria-hidden="true" />
          {/* Dot grid texture */}
          <div className="hero-grid-texture" aria-hidden="true" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">

              {/* ── LEFT COLUMN ── */}
              <div className="space-y-8">

                {/* Trust badges — pop-in stagger */}
                <div className="flex flex-col gap-3 hero-reveal-1">
                  {/* Badge 1: Trusted */}
                  <div className="hero-badge-1 flex items-center gap-2.5 px-4 py-2 rounded-full w-fit"
                    style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}>
                    <span className="hero-pulse-ring relative flex-shrink-0" style={{ color: '#a78bfa' }}>
                      <span className="block w-2 h-2 rounded-full bg-current" />
                    </span>
                    <span className="text-xs sm:text-sm font-semibold" style={{ color: '#c4b5fd' }}>
                      {t('landing.trusted_badge', 'Trusted by many across India')}
                    </span>
                  </div>

                  {/* Badge 2: Grant award */}
                  <div className="hero-badge-2 flex items-center gap-2.5 px-4 py-2 rounded-full w-fit max-w-full"
                    style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(245,158,11,0.12) 100%)', border: '1px solid rgba(251,191,36,0.28)' }}>
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="#fbbf24" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-semibold leading-tight" style={{ color: '#fcd34d' }}>
                      <span className="hidden sm:inline">{t('landing.grant_badge_long', '₹1 Lakh Grant — Delhi Startup Yuva Festival × Govt. of NCT Delhi')}</span>
                      <span className="sm:hidden">{t('landing.grant_badge_short', '₹1L Grant — Delhi Startup Festival')}</span>
                    </span>
                  </div>
                </div>

                {/* Headline — stagger reveal 2 */}
                <div className="hero-reveal-2">
                  <h1 className="font-black leading-[0.88] tracking-tight"
                    style={{ fontSize: 'clamp(2.75rem, 6vw, 5.5rem)', fontFamily: 'Manrope, var(--font-heading), sans-serif', color: '#f0e6ff' }}>
                    {t('landing.title_start', 'Your Health,')}
                    <br />
                    <span className="relative inline-block mt-2">
                      {/* Animated shimmer gradient text — fixes the static gradient bug */}
                      <span className="hero-gradient-text">
                        {t('landing.title_end', 'Reimagined')}
                      </span>
                      {/* Decorative underline */}
                      <svg className="absolute -bottom-3 left-0 w-full" height="10" viewBox="0 0 300 10" fill="none" aria-hidden="true">
                        <path d="M2 8C60 3 120 1 150 4C180 7 240 9 298 4"
                          stroke="url(#hero-ul-grad)" strokeWidth="2.5" strokeLinecap="round" />
                        <defs>
                          <linearGradient id="hero-ul-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </span>
                  </h1>
                </div>

                {/* Subtitle — stagger reveal 3 */}
                <p className="hero-reveal-3 leading-relaxed max-w-lg"
                  style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: 'rgba(192,170,232,0.85)' }}>
                  {t('landing.subtitle_start', 'The')}{' '}
                  <span style={{ color: '#e2d9f3', fontWeight: 700 }}>{t('landing.subtitle_bold', 'all-in-one platform')}</span>{' '}
                  {t('landing.subtitle_rest', 'that makes managing your health simple, secure, and intelligent.')}
                </p>

                {/* CTA buttons — stagger reveal 4 + luminous glow */}
                <div className="hero-reveal-4 flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/login"
                    id="hero-cta-primary"
                    className="hero-cta-primary inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold group"
                  >
                    {t('landing.get_started_free', 'Get Started Free')}
                    <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => setIsBetaModalOpen(true)}
                    id="hero-cta-beta"
                    className="hero-cta-secondary inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base"
                  >
                    {t('landing.register_beta', 'Register for Beta')}
                  </button>
                </div>

              </div>

              {/* ── RIGHT COLUMN — Glassmorphic Bento Grid ── */}
              <div className="hidden lg:block hero-reveal-right">
                <div className="grid grid-cols-2 gap-4">

                  {/* Card 1 — Blood Pressure (full width) */}
                  <div className="col-span-2 hero-glass-card hero-float-a p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(139,92,246,0.2)' }}>
                          <HeartPulse className="h-5 w-5" style={{ color: '#c084fc' }} />
                        </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: 'rgba(192,170,232,0.7)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Blood Pressure</p>
                          <p className="text-2xl font-black" style={{ color: '#f0e6ff', fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.02em' }}>120/80 <span className="text-xs font-medium" style={{ color: 'rgba(192,170,232,0.6)' }}>mmHg</span></p>
                        </div>
                      </div>
                      <span className="hero-status-normal">Normal</span>
                    </div>
                    {/* Animated sparkline */}
                    <div className="flex items-end gap-1.5 h-16 px-1" aria-label="Blood pressure trend chart" role="img">
                      {[45, 65, 48, 72, 58, 80, 62].map((h, i) => (
                        <div key={i} className="hero-bar flex-1 rounded-t-sm"
                          style={{ height: `${h}%`, background: `linear-gradient(to top, rgba(99,102,241,0.8), rgba(139,92,246,0.5))` }} />
                      ))}
                    </div>
                  </div>

                  {/* Card 2 — Medication */}
                  <div className="hero-glass-card hero-float-b p-5">
                    <div className="p-2.5 rounded-xl w-fit mb-3" style={{ background: 'rgba(16,185,129,0.18)' }}>
                      <Pill className="h-5 w-5" style={{ color: '#6ee7b7' }} />
                    </div>
                    <p className="text-xs font-medium mb-1" style={{ color: 'rgba(192,170,232,0.65)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Next Dose</p>
                    <p className="font-bold text-lg" style={{ color: '#f0e6ff', fontFamily: 'Manrope, sans-serif' }}>Aspirin</p>
                    <p className="text-xs mt-1.5" style={{ color: 'rgba(192,170,232,0.6)' }}>100mg · 2:00 PM</p>
                    {/* Progress ring */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full" style={{ width: '68%', background: 'linear-gradient(90deg, #6ee7b7, #34d399)' }} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: '#6ee7b7' }}>68%</span>
                    </div>
                  </div>

                  {/* Card 3 — Appointment */}
                  <div className="hero-glass-card hero-float-a p-5" style={{ animationDelay: '2s' }}>
                    <div className="p-2.5 rounded-xl w-fit mb-3" style={{ background: 'rgba(6,182,212,0.18)' }}>
                      <CalendarDays className="h-5 w-5" style={{ color: '#67e8f9' }} />
                    </div>
                    <p className="text-xs font-medium mb-1" style={{ color: 'rgba(192,170,232,0.65)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Upcoming</p>
                    <p className="font-bold text-lg" style={{ color: '#f0e6ff', fontFamily: 'Manrope, sans-serif' }}>Dr. Gupta</p>
                    <p className="text-xs mt-1.5" style={{ color: 'rgba(192,170,232,0.6)' }}>Tomorrow · 10 AM</p>
                    {/* Avatar row */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>G</div>
                      <span className="text-xs" style={{ color: 'rgba(192,170,232,0.5)' }}>Confirmed</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-auto" />
                    </div>
                  </div>

                  {/* Card 4 — Swasthya AI (full width) */}
                  <div className="col-span-2 hero-glass-card p-5 relative overflow-hidden">
                    {/* decorative amber glow */}
                    <div className="absolute -top-4 -right-4 w-28 h-28 rounded-full"
                      style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)', filter: 'blur(16px)' }}
                      aria-hidden="true" />
                    <div className="flex items-start gap-3 relative">
                      <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: 'rgba(251,191,36,0.18)' }}>
                        <BrainCircuit className="h-5 w-5" style={{ color: '#fcd34d' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold mb-2" style={{ color: '#fcd34d', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Swasthya AI</p>
                        {/* Chat bubble */}
                        <div className="rounded-xl px-4 py-3 text-sm leading-relaxed"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(240,230,255,0.9)' }}>
                          "Your vitals look great! Keep up the consistent routine 🎯"
                        </div>
                        {/* Typing indicator */}
                        <div className="flex items-center gap-1.5 mt-2 px-1">
                          <span className="hero-typing-dot" />
                          <span className="hero-typing-dot" />
                          <span className="hero-typing-dot" />
                          <span className="text-xs ml-1" style={{ color: 'rgba(192,170,232,0.4)' }}>Swasthya is thinking…</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Principles Section */}
        <section className="py-20 sm:py-24 bg-secondary/30 dark:bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold font-heading">{t('landing.principles.title_start', 'Your Health,')} <span className="text-gradient">{t('landing.principles.title_end', 'Your Data')}</span>.</h2>
              <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
                {t('landing.principles.subtitle', 'We believe your sensitive health information deserves the highest level of privacy and control. Our platform is built on these core principles.')}
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                className="group p-8 bg-gradient-to-br from-card via-card to-primary/5 border border-border/60 rounded-2xl text-center hover:shadow-2xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex items-center justify-center h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Lock className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold font-heading mb-3">{t('landing.principles.privacy.title', 'Complete Privacy')}</h3>
                <p className="text-muted-foreground leading-relaxed">{t('landing.principles.privacy.desc', 'Your health data is yours alone. We use state-of-the-art encryption and will never share your information without your explicit consent.')}</p>
              </motion.div>
              <motion.div
                className="group p-8 bg-gradient-to-br from-card via-card to-accent/5 border border-border/60 rounded-2xl text-center hover:shadow-2xl hover:border-accent/50 transition-all duration-300 hover:-translate-y-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center justify-center h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-accent/20 to-success/20 text-accent mb-6 group-hover:scale-110 transition-transform duration-300">
                  <KeyRound className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold font-heading mb-3">{t('landing.principles.control.title', "You're In Control")}</h3>
                <p className="text-muted-foreground leading-relaxed">{t('landing.principles.control.desc', 'Manage what you share and with whom. Your emergency profile is only accessible via your unique, secure link that you control.')}</p>
              </motion.div>
              <motion.div
                className="group p-8 bg-gradient-to-br from-card via-card to-success/5 border border-border/60 rounded-2xl text-center hover:shadow-2xl hover:border-success/50 transition-all duration-300 hover:-translate-y-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center justify-center h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-success/20 to-primary/20 text-success mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold font-heading mb-3">{t('landing.principles.ai.title', 'AI with Integrity')}</h3>
                <p className="text-muted-foreground leading-relaxed">{t('landing.principles.ai.desc', "Our AI provides insights based on *your* data, for *your* benefit. It's designed for personalization, not for monetization.")}</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 sm:py-24 relative overflow-hidden">
          <GradientBackground />
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold font-heading">{t('landing.how_it_works.title_start', 'A ')}<span className="text-gradient">{t('landing.how_it_works.title_gradient', 'Simpler Path')}</span> {t('landing.how_it_works.title_end', 'to Health Management')}</h2>
              <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">{t('landing.how_it_works.subtitle', 'In three simple steps, take full control of your health journey.')}</p>
            </motion.div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {howItWorksSteps.map((item, i) => (
                <motion.div
                  key={item.step}
                  className="h-full relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card variant="premium" className="p-10 text-center h-full relative overflow-hidden group border-2 border-transparent hover:border-primary transition-all duration-500">
                    {/* Animated border effect */}
                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 rounded-lg border-4 border-primary animate-pulse" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                        <span className="font-black text-3xl font-heading">{item.step}</span>
                      </div>
                      <h3 className="text-2xl font-bold font-heading mb-3">{t(`landing.how_it_works.steps.${item.title}.title`, item.title)}</h3>
                      <p className="text-muted-foreground leading-relaxed">{t(`landing.how_it_works.steps.${item.title}.desc`, item.description)}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-24 relative overflow-hidden">
          <GradientBackground />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-4xl sm:text-5xl font-bold font-heading">{t('landing.features_section.title_start', 'Everything You Need for')} <span className="text-gradient">{t('landing.features_section.title_gradient', 'Better Health')}</span></h2>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                  {t('landing.features_section.subtitle', 'From secure record-keeping to intelligent reminders, DocuMedic empowers you to take control of your health journey.')}
                </p>
              </motion.div>
            </div>
            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  className="group p-8 bg-gradient-to-br from-card via-card to-primary/5 border border-border/60 rounded-2xl shadow-md h-full hover:shadow-2xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{t(`landing.features.${feature.title}.title`, feature.title)}</h3>
                  <p className="text-muted-foreground leading-relaxed">{t(`landing.features.${feature.title}.desc`, feature.description)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Who is this for? Section */}
        <section id="personas" className="py-20 sm:py-24 bg-secondary/30 dark:bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-heading">{t('landing.personas.title', 'Built For Every Health Journey')}</h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                {t('landing.personas.subtitle', "Whether you're managing a condition, caring for a loved one, or simply staying proactive about your health.")}
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {personas.map((persona, i) => (
                <motion.div
                  key={persona.title}
                  className="p-6 text-center bg-card border border-border/60 rounded-xl shadow-md h-full"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="flex items-center justify-center h-16 w-16 mx-auto rounded-lg bg-gradient-to-br from-primary/10 to-violet-500/10 text-primary mb-4">
                    <persona.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold">{t(`landing.personas.${persona.title}.title`, persona.title)}</h3>
                  <p className="mt-2 text-muted-foreground">{t(`landing.personas.${persona.title}.desc`, persona.description)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* QR Code Section */}
        <section className="py-20 sm:py-24 relative overflow-hidden">
          <GradientBackground />
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                className="flex justify-center items-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary">
                  <QrCode className="w-48 h-48 text-primary" />
                  <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 bg-card p-3 rounded-full shadow-lg">
                    <HeartPulse className="w-8 h-8 text-destructive" />
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold font-heading">{t('landing.qr.title', 'Emergency Access, Instantly')}</h2>
                <p className="mt-4 text-muted-foreground">{t('landing.qr.subtitle', 'In a critical situation, every second counts. Our secure QR code provides first responders with the vital information they need, right when they need it.')}</p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start"><HeartPulse className="h-5 w-5 text-primary mr-3 mt-1 shrink-0" /><span>{t('landing.qr.bullet_1', 'Generate a unique, scannable code for your emergency profile.')}</span></li>
                  <li className="flex items-start"><HeartPulse className="h-5 w-5 text-primary mr-3 mt-1 shrink-0" /><span>{t('landing.qr.bullet_2', 'Share need-to-know details like allergies, conditions, and contacts.')}</span></li>
                  <li className="flex items-start"><HeartPulse className="h-5 w-5 text-primary mr-3 mt-1 shrink-0" /><span>{t('landing.qr.bullet_3', 'You control what information is shared for your privacy and peace of mind.')}</span></li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section Hidden 
        <section className="py-20 sm:py-24 relative overflow-hidden">
        ...
        </section>
        */}

        {/* Security Section */}
        <section id="security" className="py-20 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-heading">{t('landing.security.title', 'Your Privacy is Our Priority')}</h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                {t('landing.security.subtitle', "We're committed to the highest standards of security and data protection, so you can manage your health with confidence.")}
              </p>
            </div>
            <div className="mt-16 max-w-4xl mx-auto grid gap-8 md:grid-cols-3">
              {securityFeatures.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  className="p-6 text-center bg-card border border-border/60 rounded-xl shadow-md h-full"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-primary/10 to-violet-500/10 text-primary mb-4 mx-auto">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold">{t(`landing.security.features.${feature.title}.title`, feature.title)}</h3>
                  <p className="mt-2 text-muted-foreground">{t(`landing.security.features.${feature.title}.desc`, feature.description)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="relative rounded-3xl p-16 text-center overflow-hidden animated-gradient shadow-2xl">
              <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
              <motion.div
                className="relative z-10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-4xl sm:text-5xl font-bold font-heading text-white mb-6">{t('landing.cta.title', 'Ready to Take Control of Your Health?')}</h2>
                <p className="mt-6 max-w-2xl mx-auto text-xl text-white/90 leading-relaxed">
                  {t('landing.cta.subtitle', "Join thousands of others who are managing their health smarter and safer with DocuMedic. It's free to get started.")}
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" variant="ghost" className="bg-white text-primary hover:bg-gray-100 dark:bg-white dark:text-violet-700 dark:hover:bg-gray-100 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-10 py-6 h-auto">
                    <Link to="/login">{t('landing.cta.button', 'Get Started for Free →')}</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-12 bg-secondary border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            {/* Column 1: About */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Logo className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold font-heading">DocuMedic</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('landing.footer.mission', 'Empowering you to take control of your health journey with smart, secure, and simple tools.')}
              </p>
              <p className="text-sm font-semibold text-foreground/90">
                {t('landing.footer.made_with_love', 'Made with ❤️ in Delhi for Bharat')}
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="font-bold font-heading mb-4">{t('landing.footer.quick_links', 'Quick Links')}</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">{t('landing.footer.features', 'Features')}</Link></li>
                <li><Link to="/who-its-for" className="text-muted-foreground hover:text-foreground transition-colors">{t('landing.footer.who_its_for', "Who It's For")}</Link></li>
                <li><Link to="/security" className="text-muted-foreground hover:text-foreground transition-colors">{t('landing.footer.security', 'Security')}</Link></li>
                <li><Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">{t('landing.footer.faq', 'FAQ')}</Link></li>
              </ul>
            </div>

            {/* Column 3: Legal */}
            <div>
              <h3 className="font-bold font-heading mb-4">{t('landing.footer.legal', 'Legal')}</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">{t('landing.footer.privacy', 'Privacy Policy')}</Link></li>
                <li><Link to="/terms-of-service" className="text-muted-foreground hover:text-foreground transition-colors">{t('landing.footer.terms', 'Terms of Service')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} DocuMedic. {t('landing.footer.rights_reserved', 'All rights reserved.')}</p>
          </div>
        </div>
      </footer>

      <SwasthyaAssistant />
      <BetaRegistrationModal isOpen={isBetaModalOpen} onClose={() => setIsBetaModalOpen(false)} />
    </div>
  );
};

export default Landing;