import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './icons/Logo';
import ThemeToggle from './ui/ThemeToggle';
import Button from './ui/Button';

const LegalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-20 px-4">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
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
      <main className="flex-grow">
        {children}
      </main>
      <footer className="py-12 border-t border-primary-foreground/20 bg-gradient-to-r from-primary via-violet-600 to-purple-600 text-primary-foreground">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            {/* Column 1: About */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                <Logo className="h-8 w-8" />
                <span className="text-xl font-bold font-heading">DocuMedic</span>
                </div>
                <p className="text-sm text-primary-foreground/80">
                Empowering you to take control of your health journey with smart, secure, and simple tools.
                </p>
                <p className="text-sm font-semibold text-primary-foreground/90">
                Made with ❤️ in Delhi for Bharat
                </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
                <h3 className="font-bold font-heading mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                <li><Link to="/#features" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Features</Link></li>
                <li><Link to="/#personas" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Who It's For</Link></li>
                <li><Link to="/#security" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Security</Link></li>
                </ul>
            </div>

            {/* Column 3: Legal */}
            <div>
                <h3 className="font-bold font-heading mb-4">Legal</h3>
                <ul className="space-y-2 text-sm">
                <li><Link to="/privacy-policy" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Terms of Service</Link></li>
                </ul>
            </div>
            </div>
            <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/80">
            <p>&copy; {new Date().getFullYear()} DocuMedic. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LegalLayout;