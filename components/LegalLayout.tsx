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
                <li><Link to="/support" className="text-muted-foreground hover:text-foreground transition-colors">Support</Link></li>
                </ul>
                <div className="flex items-center gap-3 justify-center md:justify-start mt-4">
                  <a href="https://www.instagram.com/documedicindia/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-pink-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                  <a href="https://www.linkedin.com/company/documedic-india/about/?viewAsMember=true" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-blue-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                </div>
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