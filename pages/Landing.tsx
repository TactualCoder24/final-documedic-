import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { HeartPulse, FileText, Pill, BrainCircuit, Bell, Lightbulb, QrCode } from '../components/icons/Icons';
import ThemeToggle from '../components/ui/ThemeToggle';
import { motion } from 'framer-motion';

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


const Landing: React.FC = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if(user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    if (loading || user) {
        return (
             <div className="flex items-center justify-center h-screen bg-background">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

  return (
    <div className="bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-20 px-4">
          <Link to="/" className="flex items-center gap-2">
            <HeartPulse className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-heading">DocuMedic</span>
          </Link>
          <div className="flex items-center gap-2">
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
         <div className="absolute inset-0 bg-gradient-to-br from-sky-100/50 via-white to-white dark:from-sky-900/10 dark:via-background dark:to-background animate-background-pan bg-[length:200%_200%]"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-heading tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
              Your Health.
              <br />
              <span className="text-primary">Smarter. Safer.</span>
            </motion.h1>
            <motion.p 
                className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
              DocuMedic is your personal health assistant, helping you manage records, track medications, and gain intelligent insights into your well-being.
            </motion.p>
            <motion.div 
                className="mt-8 flex justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Button asChild size="lg">
                    <Link to="/login">Create Your Free Account</Link>
                </Button>
            </motion.div>
          </div>
        </section>
        
        {/* How It Works */}
        <section className="py-20 sm:py-24">
             <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold font-heading">A Simpler Path to Health Management</h2>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">In three simple steps, take full control of your health journey.</p>
                <div className="mt-16 grid gap-8 md:grid-cols-3">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
                           <span className="font-bold text-2xl font-heading">1</span>
                        </div>
                        <h3 className="text-lg font-semibold">Sign Up Securely</h3>
                        <p className="mt-2 text-muted-foreground">Create your account in seconds using secure Google authentication.</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
                           <span className="font-bold text-2xl font-heading">2</span>
                        </div>
                        <h3 className="text-lg font-semibold">Log Your Data</h3>
                        <p className="mt-2 text-muted-foreground">Easily upload records, track medications, and update your vitals.</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
                           <span className="font-bold text-2xl font-heading">3</span>
                        </div>
                        <h3 className="text-lg font-semibold">Gain Insights</h3>
                        <p className="mt-2 text-muted-foreground">Receive smart summaries, reminders, and tips to improve your health.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-24 bg-secondary/50">
          <div className="container mx-auto px-4">
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
                    className="p-6 bg-card border border-border/60 rounded-xl shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

         {/* Testimonials Section */}
        <section className="py-20 sm:py-24">
            <div className="container mx-auto px-4">
                 <div className="text-center">
                    <h2 className="text-3xl font-bold font-heading">Trusted by Users Like You</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                        Hear what our users have to say about managing their health with DocuMedic.
                    </p>
                </div>
                <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
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
                    <Card>
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
                    <Card>
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
                </div>
            </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-secondary/50">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} DocuMedic. All rights reserved.</p>
          </div>
      </footer>
    </div>
  );
};

export default Landing;
