
import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2 } from './icons/Icons';
import { registerBetaUser } from '../services/mentibotSupabase';

interface BetaRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const BetaRegistrationModal: React.FC<BetaRegistrationModalProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            await registerBetaUser({
                full_name: name,
                email: email,
                platform: 'mobile'
            });
            setIsSuccess(true);
        } catch (error: any) {
            console.error('Registration failed:', error);
            setSubmitError(error.message || 'Registration failed. Please check your database settings.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                if (!isSubmitting) {
                    onClose();
                    // Reset after modal closes
                    setTimeout(() => {
                        setIsSuccess(false);
                        setName('');
                        setEmail('');
                    }, 300);
                }
            }}
            title=""
            variant="glass"
        >
            <div className="p-2 sm:p-4">
                <AnimatePresence mode="wait">
                    {!isSuccess ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-2">
                                    <Sparkles className="h-8 w-8" />
                                </div>
                                <h2 className="text-2xl font-bold font-heading tracking-tight">Shubh Aarambh</h2>
                                <p className="text-muted-foreground">
                                    Be the first to experience the future of health management.
                                    <br />
                                    <span className="text-xs font-semibold text-primary">Mobile App coming soon!</span>
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Full Name
                                    </label>
                                    <Input
                                        id="name"
                                        placeholder="Aarav Sharma"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                        className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Email Address
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="aarav@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                        className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all"
                                    />
                                </div>

                                {submitError && (
                                    <div className="text-xs text-destructive text-center p-2 rounded bg-destructive/10 animate-shake">
                                        {submitError}
                                    </div>
                                )}

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        variant="gradient"
                                        className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-primary/20 transition-all"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Aage Badh Rahe Hain...
                                            </div>
                                        ) : (
                                            "Join Now"
                                        )}
                                    </Button>
                                </div>
                            </form>

                            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-medium opacity-50">
                                Launching FEB 2026 • Mobile App
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8 space-y-4"
                        >
                            <div className="inline-flex items-center justify-center p-4 rounded-full bg-green-500/10 text-green-500 mb-2">
                                <CheckCircle2 className="h-12 w-12" />
                            </div>
                            <h2 className="text-2xl font-bold font-heading">You're on the list!</h2>
                            <p className="text-muted-foreground max-w-[280px] mx-auto">
                                Thanks for your interest, <span className="text-foreground font-semibold">{name}</span>! We'll reach out to <span className="text-foreground font-semibold">{email}</span> soon with next steps.
                            </p>
                            <div className="pt-4">
                                <Button variant="outline" onClick={onClose} className="w-full">
                                    Close
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Modal>
    );
};

export default BetaRegistrationModal;
