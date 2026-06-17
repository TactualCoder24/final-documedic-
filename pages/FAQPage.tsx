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
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/security" className="hover:text-foreground transition-colors">Security</Link>
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
};

export default FAQPage;
