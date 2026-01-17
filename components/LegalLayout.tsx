import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './icons/Logo';
import ThemeToggle from './ui/ThemeToggle';
import Button from './ui/Button';
import { Menu, X } from './icons/Icons';
import { motion, AnimatePresence } from 'framer-motion';

const LegalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-20 px-4">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-heading">DocuMedic</span>
          </Link>
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Button asChild>
              <Link to="/login">Get Started</Link>
            </Button>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-background border-b border-border overflow-hidden"
            >
                <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
                    <Button asChild size="lg" className="w-full">
                        <Link to="/login" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                    </Button>
                </nav>
            </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        {children}
      </main>
      <footer className="py-12 bg-secondary border-t border-border">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            {/* Column 1: About */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                <Logo className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold font-heading">DocuMedic</span>
                </div>
                <p className="text-sm text-muted-foreground">
                Empowering you to take control of your health journey with smart, secure, and simple tools.
                </p>
                <p className="text-sm font-semibold text-foreground/90">
                Made with ❤️ in Delhi for Bharat
                </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
                <h3 className="font-bold font-heading mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                <li><Link to="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><Link to="/#personas" className="text-muted-foreground hover:text-foreground transition-colors">Who It's For</Link></li>
                <li><Link to="/#security" className="text-muted-foreground hover:text-foreground transition-colors">Security</Link></li>
                </ul>
            </div>

            {/* Column 3: Legal */}
            <div>
                <h3 className="font-bold font-heading mb-4">Legal</h3>
                <ul className="space-y-2 text-sm">
                <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
                </ul>
            </div>
            </div>
            <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} DocuMedic. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LegalLayout;