import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LegalLayout from '../components/LegalLayout';

const PrivacyPolicy: React.FC = () => {
  return (
    <LegalLayout>
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-heading">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>Welcome to DocuMedic. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>
            
            <h2>Information We Collect</h2>
            <p>We may collect personal information that you provide to us directly, such as:</p>
            <ul>
              <li>Personal and contact information (name, email) when you register via Google Sign-In.</li>
              <li>Health information that you voluntarily upload or enter, such as medical records, medication lists, and vital signs.</li>
              <li>Usage data, including how you interact with our application.</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, operate, and maintain our services.</li>
              <li>Improve, personalize, and expand our services.</li>
              <li>Understand and analyze how you use our application.</li>
              <li>Communicate with you, for customer service, to provide you with updates and other information relating to the app.</li>
              <li>For compliance purposes, including enforcing our Terms of Service, or other legal rights.</li>
            </ul>

            <h2>Data Security</h2>
            <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>
            
            <h2>Third-Party Services</h2>
            <p>We use Google Authentication for user sign-in. We are not responsible for the data collection and use practices of Google. We encourage you to review their privacy policy.</p>

            <h2>Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

            <h2>Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at support@documedic.example.com.</p>
          </CardContent>
        </Card>
      </div>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
