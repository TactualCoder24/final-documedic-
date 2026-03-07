import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LegalLayout from '../components/LegalLayout';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();
  return (
    <LegalLayout>
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-heading">{t('privacy.title', 'Privacy Policy')}</CardTitle>
            <p className="text-muted-foreground">{t('legal.last_updated', 'Last updated: {{date}}', { date: new Date().toLocaleDateString() })}</p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>{t('privacy.intro', 'Welcome to DocuMedic. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.')}</p>

            <h2>{t('privacy.collect_title', 'Information We Collect')}</h2>
            <p>{t('privacy.collect_intro', 'We may collect personal information that you provide to us directly, such as:')}</p>
            <ul>
              <li>{t('privacy.collect_1', 'Personal and contact information (name, email) when you register via Google Sign-In.')}</li>
              <li>{t('privacy.collect_2', 'Health information that you voluntarily upload or enter, such as medical records, medication lists, and vital signs.')}</li>
              <li>{t('privacy.collect_3', 'Usage data, including how you interact with our application.')}</li>
            </ul>

            <h2>{t('privacy.use_title', 'How We Use Your Information')}</h2>
            <p>{t('privacy.use_intro', 'We use the information we collect to:')}</p>
            <ul>
              <li>{t('privacy.use_1', 'Provide, operate, and maintain our services.')}</li>
              <li>{t('privacy.use_2', 'Improve, personalize, and expand our services.')}</li>
              <li>{t('privacy.use_3', 'Understand and analyze how you use our application.')}</li>
              <li>{t('privacy.use_4', 'Communicate with you, for customer service, to provide you with updates and other information relating to the app.')}</li>
              <li>{t('privacy.use_5', 'For compliance purposes, including enforcing our Terms of Service, or other legal rights.')}</li>
            </ul>

            <h2>{t('privacy.security_title', 'Data Security')}</h2>
            <p>{t('privacy.security_text', 'We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.')}</p>

            <h2>{t('privacy.third_party_title', 'Third-Party Services')}</h2>
            <p>{t('privacy.third_party_text', 'We use Google Authentication for user sign-in. We are not responsible for the data collection and use practices of Google. We encourage you to review their privacy policy.')}</p>

            <h2>{t('privacy.changes_title', 'Changes to This Privacy Policy')}</h2>
            <p>{t('privacy.changes_text', 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.')}</p>

            <h2>{t('legal.contact_title', 'Contact Us')}</h2>
            <p>{t('privacy.contact_text', 'If you have any questions about this Privacy Policy, please contact us at support@documedic.example.com.')}</p>
          </CardContent>
        </Card>
      </div>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
