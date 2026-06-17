import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, FileText } from '../components/icons/Icons';
import Logo from '../components/icons/Logo';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useTranslation } from 'react-i18next';

const TermsOfService: React.FC = () => {
  const { t } = useTranslation();

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
            <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
            <ThemeToggle />
            <Button asChild size="sm">
              <Link to="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900/10 dark:via-background dark:to-indigo-900/10" />
        <motion.div
          className="container mx-auto px-4 max-w-3xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
              <FileText className="h-9 w-9 text-primary" />
            </div>
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary mb-6">
            Rules & Agreements
          </span>
          <h1 className="text-5xl sm:text-6xl font-black font-heading leading-tight">
             {t('tos.title', 'Terms of Service')}
          </h1>
          <p className="mt-6 text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
             {t('legal.last_updated', 'Last updated: {{date}}', { date: new Date().toLocaleDateString() })}
          </p>
        </motion.div>
      </section>

      {/* Content */}
      <section className="py-12 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            className="p-8 sm:p-12 rounded-3xl bg-card border border-border shadow-xl prose dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-bold prose-h2:text-2xl prose-a:text-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="lead text-lg text-muted-foreground mb-8">
              {t('tos.intro', 'Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the DocuMedic application (the "Service") operated by us.')}
            </p>

            <div className="space-y-10">
              <div>
                <h2 className="border-b border-border pb-2">
                  {t('tos.acceptance_title', '1. Acceptance of Terms')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  {t('tos.acceptance_text', 'By accessing and using our Service, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services. Any participation in this service will constitute acceptance of this agreement.')}
                </p>
              </div>

              <div>
                <h2 className="flex items-center gap-3 border-b border-border pb-2">
                  <span className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400"><FileText className="w-5 h-5" /></span>
                  {t('tos.desc_title', '2. Description of Service')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  {t('tos.desc_text', 'DocuMedic is a personal health record management tool. Our service is provided "as is" and we are not responsible for the accuracy, timeliness, or completeness of any user-provided information. The Service is not a substitute for professional medical advice, diagnosis, or treatment.')}
                </p>
              </div>

              <div>
                <h2 className="border-b border-border pb-2">
                  {t('tos.resp_title', '3. User Responsibilities')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  {t('tos.resp_text', 'You are responsible for maintaining the confidentiality of your account and are fully responsible for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account or any other breach of security.')}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
                <h2 className="flex items-center gap-3 mt-0 mb-4 text-amber-900 dark:text-amber-500">
                  <span className="p-2 bg-amber-200/50 dark:bg-amber-900/30 rounded-lg"><AlertTriangle className="w-5 h-5" /></span>
                  {t('tos.disclaimer_title', '4. Disclaimer of Warranties')}
                </h2>
                <p className="text-amber-800/80 dark:text-amber-200/70 leading-relaxed mb-0">
                  {t('tos.disclaimer_text', 'The Service is provided on an "as is" and "as available" basis. We expressly disclaim all warranties of any kind, whether express or implied, including, but not limited to, the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.')}
                </p>
              </div>

              <div>
                <h2 className="flex items-center gap-3 border-b border-border pb-2">
                  <span className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400"><ShieldAlert className="w-5 h-5" /></span>
                  {t('tos.liability_title', '5. Limitation of Liability')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  {t('tos.liability_text', 'In no event shall DocuMedic be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.')}
                </p>
              </div>

              <div>
                <h2 className="border-b border-border pb-2">
                  {t('tos.changes_title', '6. Changes to Terms')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  {t('tos.changes_text', 'We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms of Service on this page.')}
                </p>
              </div>

              <div>
                <h2 className="border-b border-border pb-2">
                  {t('legal.contact_title', 'Contact Us')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  {t('tos.contact_text', 'If you have any questions about these Terms, please contact us at support@documedic.example.com.')}
                </p>
              </div>
            </div>
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
};

export default TermsOfService;
