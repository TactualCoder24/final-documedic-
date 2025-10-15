import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { FileText, Pill, BrainCircuit, Bell, Lightbulb, QrCode, HeartPulse, Users, Activity, ShieldCheck, KeyRound, Lock } from '../components/icons/Icons';
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
        if(user) {
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
          <div className="flex items-center gap-2">
             <Button variant="ghost" asChild>
                <Link to="/community">Community</Link>
            </Button>
            <ThemeToggle />
            <Button asChild>
                <Link to="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-24 sm:py-32 overflow-hidden">
         <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50 dark:opacity-25 animate-blob" style={{ animationDelay: '2s' }}></div>
         <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-pink-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50 dark:opacity-25 animate-blob" style={{ animationDelay: '4s' }}></div>
         <GradientBackground />
          <div className="container mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-12 items-center">
             <div className="text-center md:text-left">
                <motion.h1 
                    className="text-5xl sm:text-6xl md:text-7xl font-extrabold font-heading tracking-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                Your Health.
                <br />
                <span className="text-primary">Smarter. Safer.</span>
                </motion.h1>
                <motion.p 
                    className="mt-6 max-w-xl mx-auto md:mx-0 text-xl text-muted-foreground"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                DocuMedic is your personal health assistant, helping you manage records, track medications, and gain intelligent insights into your well-being.
                </motion.p>
                <motion.div 
                    className="mt-8 flex justify-center md:justify-start gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Button asChild size="lg">
                        <Link to="/login">Create Your Free Account</Link>
                    </Button>
                </motion.div>
             </div>
             <div className="hidden md:block">
                <InteractiveDashboardMockup />
             </div>
          </div>
        </section>
        
        {/* Animated Statistics Bar */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 bg-card border border-border/60 rounded-xl">
                <h3 className="text-4xl font-bold font-heading text-primary">
                  <AnimatedCounter value={10000} />+
                </h3>
                <p className="mt-2 text-muted-foreground">Trusted Users</p>
              </div>
              <div className="p-6 bg-card border border-border/60 rounded-xl">
                <h3 className="text-4xl font-bold font-heading text-primary">
                  <AnimatedCounter value={500000} />+
                </h3>
                <p className="mt-2 text-muted-foreground">Records Secured</p>
              </div>
              <div className="p-6 bg-card border border-border/60 rounded-xl">
                <h3 className="text-4xl font-bold font-heading text-primary">
                  <AnimatedCounter value={98} />%
                </h3>
                <p className="mt-2 text-muted-foreground">User Satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 sm:py-24 relative overflow-hidden">
             <GradientBackground />
             <div className="container mx-auto px-4 text-center relative z-10">
                <h2 className="text-3xl font-bold font-heading">A Simpler Path to Health Management</h2>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">In three simple steps, take full control of your health journey.</p>
                <div className="mt-16 grid gap-8 md:grid-cols-3">
                    {howItWorksSteps.map((item, i) => (
                        <motion.div
                            key={item.step}
                            className="h-full"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <Card className="p-8 text-center h-full bg-card/80 backdrop-blur-sm">
                                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-primary/10 to-violet-500/10 text-primary mb-4 mx-auto">
                                    <span className="font-bold text-2xl font-heading">{item.step}</span>
                                </div>
                                <h3 className="text-lg font-semibold">{item.title}</h3>
                                <p className="mt-2 text-muted-foreground">{item.description}</p>
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
              <h2 className="text-3xl font-bold font-heading">Everything You Need for Better Health Management</h2>
              <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                From secure record-keeping to intelligent reminders, DocuMedic empowers you to take control of your health journey.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <motion.div
                    key={feature.title} 
                    className="p-6 bg-gradient-to-br from-card to-primary/5 border border-border/60 rounded-xl shadow-md h-full"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-primary/10 to-violet-500/10 text-primary mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
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
                                <img src="https://i.pravatar.cc/150?u=ananya" alt="user" className="w-10 h-10 rounded-full"/>
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
                                <img src="https://i.pravatar.cc/150?u=vikram" alt="user" className="w-10 h-10 rounded-full"/>
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
                                <img src="https://i.pravatar.cc/150?u=meera" alt="user" className="w-10 h-10 rounded-full"/>
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
                                <img src="https://i.pravatar.cc/150?u=rajesh" alt="user" className="w-10 h-10 rounded-full"/>
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
                                <img src="https://i.pravatar.cc/150?u=priya" alt="user" className="w-10 h-10 rounded-full"/>
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
                                <img src="https://i.pravatar.cc/150?u=sunita" alt="user" className="w-10 h-10 rounded-full"/>
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
                <div className="relative rounded-2xl p-12 text-center overflow-hidden bg-gradient-to-r from-primary via-violet-600 to-purple-600 dark:from-primary/80 dark:via-violet-800 dark:to-purple-900">
                    <motion.div 
                        className="relative z-10"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold font-heading text-white">Ready to Take Control of Your Health?</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-white/80">
                            Join thousands of others who are managing their health smarter and safer with DocuMedic. It's free to get started.
                        </p>
                        <div className="mt-8">
                            <Button asChild size="lg" variant="ghost" className="bg-white text-primary hover:bg-gray-200 dark:bg-white dark:text-violet-700 dark:hover:bg-gray-200 font-bold shadow-lg transform hover:scale-105 transition-all duration-300">
                                <Link to="/login">Get Started for Free</Link>
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
