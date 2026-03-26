import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ShieldCheck, KeyRound, Lock, Info } from '../components/icons/Icons';
import Logo from '../components/icons/Logo';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy: React.FC = () => {
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
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-blue-900/10 dark:via-background dark:to-slate-900/10" />
        <motion.div
          className="container mx-auto px-4 max-w-3xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
              <FileText className="h-9 w-9 text-primary" />
            </div>
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary mb-6">
            Legal & Compliance
          </span>
          <h1 className="text-5xl sm:text-6xl font-black font-heading leading-tight">
             {t('privacy.title', 'Privacy Policy')}
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
              {t('privacy.intro', 'Welcome to DocuMedic. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.')}
            </p>

            <div className="space-y-10">
              <div>
                <h2 className="flex items-center gap-3 border-b border-border pb-2">
                  <span className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400"><Info className="w-5 h-5" /></span>
                  {t('privacy.collect_title', 'Information We Collect')}
                </h2>
                <p>{t('privacy.collect_intro', 'We may collect personal information that you provide to us directly, such as:')}</p>
                <ul className="list-disc pl-6 space-y-2 mt-4 text-muted-foreground">
                  <li>{t('privacy.collect_1', 'Personal and contact information (name, email) when you register via Google Sign-In.')}</li>
                  <li>{t('privacy.collect_2', 'Health information that you voluntarily upload or enter, such as medical records, medication lists, and vital signs.')}</li>
                  <li>{t('privacy.collect_3', 'Usage data, including how you interact with our application.')}</li>
                </ul>
              </div>

              <div>
                <h2 className="flex items-center gap-3 border-b border-border pb-2">
                  <span className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400"><ShieldCheck className="w-5 h-5" /></span>
                  {t('privacy.use_title', 'How We Use Your Information')}
                </h2>
                <p>{t('privacy.use_intro', 'We use the information we collect to:')}</p>
                <ul className="list-disc pl-6 space-y-2 mt-4 text-muted-foreground">
                  <li>{t('privacy.use_1', 'Provide, operate, and maintain our services.')}</li>
                  <li>{t('privacy.use_2', 'Improve, personalize, and expand our services.')}</li>
                  <li>{t('privacy.use_3', 'Understand and analyze how you use our application.')}</li>
                  <li>{t('privacy.use_4', 'Communicate with you, for customer service, to provide you with updates and other information relating to the app.')}</li>
                  <li>{t('privacy.use_5', 'For compliance purposes, including enforcing our Terms of Service, or other legal rights.')}</li>
                </ul>
              </div>

              <div>
                <h2 className="flex items-center gap-3 border-b border-border pb-2">
                  <span className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400"><Lock className="w-5 h-5" /></span>
                  {t('privacy.security_title', 'Data Security')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  {t('privacy.security_text', 'We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.')}
                </p>
                <div className="mt-4 p-4 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/30 text-sm">
                  <Link to="/security" className="text-primary font-semibold hover:underline">Read more about our Security Architecture →</Link>
                </div>
              </div>

              <div>
                <h2 className="flex items-center gap-3 border-b border-border pb-2">
                  <span className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400"><KeyRound className="w-5 h-5" /></span>
                  {t('privacy.third_party_title', 'Third-Party Services')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  {t('privacy.third_party_text', 'We use Google Authentication for user sign-in. We are not responsible for the data collection and use practices of Google. We encourage you to review their privacy policy.')}
                </p>
              </div>

              <div>
                <h2 className="border-b border-border pb-2">
                  {t('privacy.changes_title', 'Changes to This Privacy Policy')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  {t('privacy.changes_text', 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.')}
                </p>
              </div>

              <div>
                <h2 className="border-b border-border pb-2">
                  {t('legal.contact_title', 'Contact Us')}
                </h2>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  {t('privacy.contact_text', 'If you have any questions about this Privacy Policy, please contact us at support@documedic.example.com.')}
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
          <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/security" className="hover:text-foreground transition-colors">Security</Link>
            <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default PrivacyPolicy;
