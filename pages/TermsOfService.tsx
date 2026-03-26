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
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default TermsOfService;
