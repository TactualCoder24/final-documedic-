import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { FileText, Pill, BrainCircuit, Bell, Lightbulb, QrCode, HeartPulse, Users, Activity, ShieldCheck, KeyRound, Lock, Menu, X, CalendarDays } from '../components/icons/Icons';
import Logo from '../components/icons/Logo';
import ThemeToggle from '../components/ui/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import ShaktiAssistant from '../components/ShaktiAssistant';

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
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-20 px-4">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-heading">DocuMedic</span>
          </Link>
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/community">Community</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/mentibot">Mentibot</Link>
            </Button>
            <ThemeToggle />
            <Button asChild>
              <Link to="/login">Get Started</Link>
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
                <Link to="/community" onClick={() => setIsMenuOpen(false)}>Community</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/mentibot" onClick={() => setIsMenuOpen(false)}>Mentibot</Link>
              </Button>
              <Button asChild size="lg" className="w-full">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Hero Section - Completely Redesigned */}
        <section className="relative pt-20 pb-12 overflow-hidden">
          {/* Animated Mesh Gradient Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-success/5" />
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob" />
              <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-accent/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob" style={{ animationDelay: '2s' }} />
              <div className="absolute bottom-1/4 left-1/2 w-[500px] h-[500px] bg-success/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob" style={{ animationDelay: '4s' }} />
            </div>
          </div>

          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Content */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="flex flex-col gap-3 mb-6">
                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 border border-primary/20 w-fit max-w-full">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-primary">Trusted by many across India</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 w-fit max-w-full">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300 leading-tight">
                        <span className="hidden sm:inline">₹1 Lakh Grant - Delhi Startup Yuva Festival by Govt. of Delhi NCT</span>
                        <span className="sm:hidden">₹1L Grant - Delhi Startup Festival</span>
                      </span>
                    </div>
                  </div>

                  <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-heading leading-[0.9] tracking-tight">
                    Your Health,
                    <br />
                    <span className="relative inline-block mt-2">
                      <span className="text-gradient">Reimagined</span>
                      <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12" fill="none">
                        <path d="M2 10C50 5 100 2 150 5C200 8 250 10 298 5" stroke="url(#hero-underline-gradient)" strokeWidth="3" strokeLinecap="round" />
                        <defs>
                          <linearGradient id="hero-underline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="hsl(var(--primary))" />
                            <stop offset="100%" stopColor="hsl(var(--accent))" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </span>
                  </h1>
                </motion.div>

                <motion.p
                  className="text-base sm:text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-xl"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  The <span className="font-bold text-foreground">all-in-one platform</span> that makes managing your health simple, secure, and intelligent.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <Button asChild size="lg" variant="gradient" className="text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 h-auto shadow-2xl hover:shadow-primary/50 group w-full sm:w-auto">
                    <Link to="/login" className="flex items-center justify-center gap-2">
                      Get Started Free
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 h-auto border-2 hover:border-primary hover:bg-primary/5 w-full sm:w-auto">
                    <Link to="#features">Watch Demo</Link>
                  </Button>
                </motion.div>
              </div>

              {/* Right Column - 3D Bento Grid */}
              <div className="hidden lg:block">
                <motion.div
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  {/* Card 1 - Health Metrics */}
                  <motion.div
                    className="col-span-2 p-6 rounded-2xl bg-gradient-to-br from-card to-primary/10 border border-border/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-primary/20">
                        <HeartPulse className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Blood Pressure</div>
                        <div className="text-2xl font-bold">120/80</div>
                      </div>
                    </div>
                    <div className="h-20 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg flex items-end gap-1 p-2">
                      {[40, 60, 45, 70, 55, 75, 60].map((height, i) => (
                        <div key={i} className="flex-1 bg-primary/60 rounded-sm" style={{ height: `${height}%` }} />
                      ))}
                    </div>
                  </motion.div>

                  {/* Card 2 - Medication */}
                  <motion.div
                    className="p-6 rounded-2xl bg-gradient-to-br from-card to-success/10 border border-border/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="p-3 rounded-xl bg-success/20 w-fit mb-3">
                      <Pill className="h-6 w-6 text-success" />
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">Next Dose</div>
                    <div className="text-lg font-bold">Aspirin</div>
                    <div className="text-xs text-muted-foreground mt-2">100mg • 2:00 PM</div>
                  </motion.div>

                  {/* Card 3 - Appointments */}
                  <motion.div
                    className="p-6 rounded-2xl bg-gradient-to-br from-card to-accent/10 border border-border/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="p-3 rounded-xl bg-accent/20 w-fit mb-3">
                      <CalendarDays className="h-6 w-6 text-accent" />
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">Upcoming</div>
                    <div className="text-lg font-bold">Dr. Smith</div>
                    <div className="text-xs text-muted-foreground mt-2">Tomorrow • 10 AM</div>
                  </motion.div>

                  {/* Card 4 - AI Assistant */}
                  <motion.div
                    className="col-span-2 p-6 rounded-2xl bg-gradient-to-br from-card to-warning/10 border border-border/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 rounded-full blur-2xl" />
                    <div className="flex items-center gap-3 relative">
                      <div className="p-3 rounded-xl bg-warning/20">
                        <BrainCircuit className="h-6 w-6 text-warning" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">AI Health Assistant</div>
                        <div className="text-sm">"Your vitals look great! Keep up the good work."</div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
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
              <h2 className="text-4xl sm:text-5xl font-bold font-heading">Your Health, <span className="text-gradient">Your Data</span>.</h2>
              <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
                We believe your sensitive health information deserves the highest level of privacy and control. Our platform is built on these core principles.
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
                <h3 className="text-2xl font-bold font-heading mb-3">Complete Privacy</h3>
                <p className="text-muted-foreground leading-relaxed">Your health data is yours alone. We use state-of-the-art encryption and will never share your information without your explicit consent.</p>
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
                <h3 className="text-2xl font-bold font-heading mb-3">You're In Control</h3>
                <p className="text-muted-foreground leading-relaxed">Manage what you share and with whom. Your emergency profile is only accessible via your unique, secure link that you control.</p>
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
                <h3 className="text-2xl font-bold font-heading mb-3">AI with Integrity</h3>
                <p className="text-muted-foreground leading-relaxed">Our AI provides insights based on *your* data, for *your* benefit. It's designed for personalization, not for monetization.</p>
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
              <h2 className="text-4xl sm:text-5xl font-bold font-heading">A <span className="text-gradient">Simpler Path</span> to Health Management</h2>
              <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">In three simple steps, take full control of your health journey.</p>
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
                      <h3 className="text-2xl font-bold font-heading mb-3">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{item.description}</p>
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
                <h2 className="text-4xl sm:text-5xl font-bold font-heading">Everything You Need for <span className="text-gradient">Better Health</span></h2>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                  From secure record-keeping to intelligent reminders, DocuMedic empowers you to take control of your health journey.
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
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Who is this for? Section */}
        <section id="personas" className="py-20 sm:py-24 bg-secondary/30 dark:bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-heading">Built For Every Health Journey</h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                Whether you're managing a condition, caring for a loved one, or simply staying proactive about your health.
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
                  <h3 className="text-lg font-semibold">{persona.title}</h3>
                  <p className="mt-2 text-muted-foreground">{persona.description}</p>
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
                <h2 className="text-3xl font-bold font-heading">Emergency Access, Instantly</h2>
                <p className="mt-4 text-muted-foreground">In a critical situation, every second counts. Our secure QR code provides first responders with the vital information they need, right when they need it.</p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-start"><HeartPulse className="h-5 w-5 text-primary mr-3 mt-1 shrink-0" /><span>Generate a unique, scannable code for your emergency profile.</span></li>
                  <li className="flex items-start"><HeartPulse className="h-5 w-5 text-primary mr-3 mt-1 shrink-0" /><span>Share need-to-know details like allergies, conditions, and contacts.</span></li>
                  <li className="flex items-start"><HeartPulse className="h-5 w-5 text-primary mr-3 mt-1 shrink-0" /><span>You control what information is shared for your privacy and peace of mind.</span></li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 sm:py-24 relative overflow-hidden">
          <GradientBackground />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-heading">Trusted by Users Like You</h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                Hear what our users have to say about managing their health with DocuMedic.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-gradient-to-br from-card to-primary/5 h-full">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">"DocuMedic has been a game-changer for managing my family's medical records. Everything is organized and accessible. I feel so much more in control."</p>
                  <div className="mt-4 flex items-center gap-3">
                    <img src="https://i.pravatar.cc/150?u=ananya" alt="user" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-semibold">Ananya K.</p>
                      <p className="text-sm text-muted-foreground">Parent & Caregiver</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-card to-primary/5 h-full">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">"As someone with a chronic condition, the medication tracker and smart summaries are invaluable. My doctor was impressed with the detailed logs I could share."</p>
                  <div className="mt-4 flex items-center gap-3">
                    <img src="https://i.pravatar.cc/150?u=vikram" alt="user" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-semibold">Vikram S.</p>
                      <p className="text-sm text-muted-foreground">Fitness Enthusiast</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-card to-primary/5 h-full">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">"The secure QR code for emergencies gives me peace of mind. It's a brilliant feature that makes critical information available when it matters most."</p>
                  <div className="mt-4 flex items-center gap-3">
                    <img src="https://i.pravatar.cc/150?u=meera" alt="user" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-semibold">Meera N.</p>
                      <p className="text-sm text-muted-foreground">Frequent Traveler</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-card to-primary/5 h-full">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">"Managing my diabetes used to be a chore, but DocuMedic's vitals tracking and reminders have made it so much easier. The AI tips are surprisingly helpful too."</p>
                  <div className="mt-4 flex items-center gap-3">
                    <img src="https://i.pravatar.cc/150?u=rajesh" alt="user" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-semibold">Rajesh P.</p>
                      <p className="text-sm text-muted-foreground">Retiree</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-card to-primary/5 h-full">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">"I'm proactive about my health, and this app is perfect. Having a centralized place for all my check-ups and lab results helps me see the bigger picture of my wellness journey."</p>
                  <div className="mt-4 flex items-center gap-3">
                    <img src="https://i.pravatar.cc/150?u=priya" alt="user" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-semibold">Priya S.</p>
                      <p className="text-sm text-muted-foreground">Software Developer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-card to-primary/5 h-full">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">"The Smart Summary feature is incredible. It puts complex lab reports into simple terms I can actually understand. It's like having a doctor explain things to you anytime."</p>
                  <div className="mt-4 flex items-center gap-3">
                    <img src="https://i.pravatar.cc/150?u=sunita" alt="user" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-semibold">Sunita D.</p>
                      <p className="text-sm text-muted-foreground">Teacher</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="py-20 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-heading">Your Privacy is Our Priority</h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                We're committed to the highest standards of security and data protection, so you can manage your health with confidence.
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
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
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
                <h2 className="text-4xl sm:text-5xl font-bold font-heading text-white mb-6">Ready to Take Control of Your Health?</h2>
                <p className="mt-6 max-w-2xl mx-auto text-xl text-white/90 leading-relaxed">
                  Join thousands of others who are managing their health smarter and safer with DocuMedic. It's free to get started.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" variant="ghost" className="bg-white text-primary hover:bg-gray-100 dark:bg-white dark:text-violet-700 dark:hover:bg-gray-100 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg px-10 py-6 h-auto">
                    <Link to="/login">Get Started for Free →</Link>
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
                Empowering you to take control of your health journey with smart, secure, and simple tools.
              </p>
              <p className="text-sm font-semibold text-foreground/90">
                Made with ❤️ in Delhi for Bharat
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="font-bold font-heading mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/#features" onClick={(e) => handleSmoothScroll(e, 'features')} className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><Link to="/#personas" onClick={(e) => handleSmoothScroll(e, 'personas')} className="text-muted-foreground hover:text-foreground transition-colors">Who It's For</Link></li>
                <li><Link to="/#security" onClick={(e) => handleSmoothScroll(e, 'security')} className="text-muted-foreground hover:text-foreground transition-colors">Security</Link></li>
              </ul>
            </div>

            {/* Column 3: Legal */}
            <div>
              <h3 className="font-bold font-heading mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} DocuMedic. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <ShaktiAssistant />
    </div>
  );
};

export default Landing;