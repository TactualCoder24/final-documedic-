import React from 'react';
import { NavLink, useNavigate, Outlet, Link } from 'react-router-dom';
import ThemeToggle from './ui/ThemeToggle';
import Button from './ui/Button';
import { ArrowLeft, Brain } from './icons/Icons';
import Logo from './icons/Logo';
import { motion, AnimatePresence } from 'framer-motion';

const MentibotStandaloneLayout: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Immersive Header */}
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
                <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-6">
                        <Link to="/mentibot" className="flex items-center gap-2 group">
                            <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                            </div>
                            <span className="text-xl sm:text-2xl font-black italic tracking-tighter uppercase font-heading text-white">
                                Menti<span className="text-primary italic">Bot</span>
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <ThemeToggle />
                        <div className="h-6 w-px bg-white/10 mx-1 sm:mx-2" />
                        <Button
                            variant="outline"
                            size="sm"
                            className="hidden md:flex rounded-full border-white/10 hover:bg-white/5 gap-2 text-xs font-bold uppercase tracking-widest text-white"
                            onClick={() => navigate('/dashboard')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Exit to Dashboard
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden rounded-full text-white"
                            onClick={() => navigate('/dashboard')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <div className="container flex-1 py-6 sm:py-8 px-4 sm:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="h-full"
                    >
                        <Outlet />
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 border-t border-white/5">
                <div className="container px-8 flex justify-center text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black opacity-30">
                    Powered by DocuMedic AI Intelligence
                </div>
            </footer>
        </div>
    );
};

export default MentibotStandaloneLayout;
