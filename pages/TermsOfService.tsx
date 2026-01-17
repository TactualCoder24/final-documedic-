import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import LegalLayout from '../components/LegalLayout';

const TermsOfService: React.FC = () => {
  return (
    <LegalLayout>
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-heading">Terms of Service</CardTitle>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the DocuMedic application (the "Service") operated by us.</p>
            
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using our Service, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services. Any participation in this service will constitute acceptance of this agreement.</p>
            
            <h2>2. Description of Service</h2>
            <p>DocuMedic is a personal health record management tool. Our service is provided "as is" and we are not responsible for the accuracy, timeliness, or completeness of any user-provided information. The Service is not a substitute for professional medical advice, diagnosis, or treatment.</p>

            <h2>3. User Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account and are fully responsible for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account or any other breach of security.</p>
            
            <h2>4. Disclaimer of Warranties</h2>
            <p>The Service is provided on an "as is" and "as available" basis. We expressly disclaim all warranties of any kind, whether express or implied, including, but not limited to, the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>

            <h2>5. Limitation of Liability</h2>
            <p>In no event shall DocuMedic be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

            <h2>6. Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms of Service on this page.</p>

            <h2>Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at support@documedic.example.com.</p>
          </CardContent>
        </Card>
      </div>
    </LegalLayout>
  );
};

export default TermsOfService;
