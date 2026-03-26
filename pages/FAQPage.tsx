import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, Lock, Smartphone } from '../components/icons/Icons';
import Logo from '../components/icons/Logo';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';

const faqs = [
  {
    category: "General",
    icon: HelpCircle,
    questions: [
      {
        q: "What is DocuMedic?",
        a: "DocuMedic is a secure, all-in-one personal health record management platform. It allows you to store medical records, track vitals and medications, and generate smart AI summaries of your health history to share with doctors."
      },
      {
        q: "Is DocuMedic free to use?",
        a: "Yes! The core features of DocuMedic — including unlimited document storage, basic medication tracking, and the emergency QR profile — are completely free. We also offer a premium tier for advanced AI insights and family account management."
      },
       {
        q: "Can I use DocuMedic for my whole family?",
        a: "Absolutely. With our Family Access feature, you can create and manage separate health profiles for your children, elderly parents, or partner, all from a single primary account."
      }
    ]
  },
  {
    category: "Security & Privacy",
    icon: Lock,
    questions: [
      {
        q: "Is my medical data secure?",
        a: "Security is our highest priority. All your health data is secured with AES-256 end-to-end encryption. Your information is stored on ISO 27001-certified infrastructure with Row-Level Security (RLS) ensuring strict isolation."
      },
      {
        q: "Do you sell my data to insurance companies?",
        a: "Never. We have a strict policy against selling, renting, or sharing your personal health information with third parties, advertisers, or insurance providers. You are the sole owner of your data."
      },
      {
        q: "How does the Emergency QR code work?",
        a: "You can generate a unique QR code that links to a read-only, emergency-specific profile containing vital information like allergies, blood type, and emergency contacts. You control exactly what data is visible when the code is scanned."
      }
    ]
  },
  {
    category: "Features & Usage",
    icon: Smartphone,
    questions: [
      {
        q: "How does the AI Health Summary work?",
        a: "DocuMedic uses advanced AI models to read your uploaded lab reports, doctor's notes, and logged vitals. It then synthesizes this into a plain-language summary so you (and any new doctors) can understand your current health status at a glance."
      },
      {
        q: "Will this remind me to take my medications?",
        a: "Yes! You can set up custom schedules for your prescriptions. DocuMedic will send you timely reminders via email or push notifications (if enabled) so you never miss a dose."
      },
      {
        q: "Can I share my records with my doctor?",
        a: "Yes, you can securely share specific documents or your entire AI-generated health summary via a secure, temporary link. The link automatically expires after a set period that you define."
      }
    ]
  }
];

const FAQAccordionItem: React.FC<{ question: string, answer: string, isOpen: boolean, onClick: () => void }> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border border-border/60 rounded-2xl bg-card overflow-hidden hover:border-primary/30 transition-colors">
      <button 
        onClick={onClick}
        className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
      >
        <h3 className="font-semibold pr-8 text-foreground">{question}</h3>
        <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-6 pb-6 pt-0 text-muted-foreground leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<string | null>("0-0");

  const toggleAccordion = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

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
            <Link to="/features" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link to="/security" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors">Security</Link>
            <ThemeToggle />
            <Button asChild size="sm">
              <Link to="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-50 via-white to-blue-50 dark:from-violet-900/10 dark:via-background dark:to-blue-900/10" />
        <motion.div
          className="container mx-auto px-4 max-w-3xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
              <HelpCircle className="h-9 w-9 text-primary" />
            </div>
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary mb-6">
            Support & Resources
          </span>
          <h1 className="text-5xl sm:text-6xl font-black font-heading leading-tight">
             Frequently <span className="text-gradient">Asked Questions</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
             Got questions? We've got answers. Learn more about how DocuMedic keeps your health data secure, organized, and accessible.
          </p>
        </motion.div>
      </section>

      {/* Content */}
      <section className="py-12 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-16">
            {faqs.map((section, sIndex) => (
              <motion.div 
                key={section.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-primary" />
                   </div>
                   <h2 className="text-2xl font-bold font-heading">{section.category}</h2>
                </div>
                <div className="space-y-4">
                  {section.questions.map((item, qIndex) => {
                    const id = `${sIndex}-${qIndex}`;
                    return (
                      <FAQAccordionItem 
                        key={id}
                        question={item.q}
                        answer={item.a}
                        isOpen={openIndex === id}
                        onClick={() => toggleAccordion(id)}
                      />
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Still have questions? */}
          <motion.div
            className="mt-20 rounded-3xl p-10 sm:p-12 text-center bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <h2 className="text-3xl font-bold font-heading relative z-10">Still have questions?</h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto relative z-10">
              Can't find the answer you're looking for? Our support team is here to help you get the most out of your DocuMedic experience.
            </p>
            <Button asChild size="lg" className="mt-8 font-bold shadow-lg relative z-10">
              <a href="mailto:support@documedic.example.com">Contact Support</a>
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
          <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/security" className="hover:text-foreground transition-colors">Security</Link>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default FAQPage;
