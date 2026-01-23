import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as Icons from '../../components/icons/Icons';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// Features array with relative paths and explicit icons to avoid IDE import issues
const features = [
    {
        title: 'Sentiment Analysis',
        description: 'AI-powered understanding of your emotional state through conversation.',
        icon: Icons.Sparkles,
        path: 'chat',
        color: 'text-primary',
        bg: 'bg-primary/10'
    },
    {
        title: 'Personalized Support',
        description: 'Tailored mental health guidance based on your history and goals.',
        icon: Icons.HeartPulse,
        path: 'support',
        color: 'text-indigo-500',
        bg: 'bg-indigo-500/10'
    },
    {
        title: 'Crisis Detection',
        description: '24/7 monitoring for urgent situations with immediate professional alerts.',
        icon: Icons.Bell,
        path: 'emergency',
        color: 'text-destructive',
        bg: 'bg-destructive/10'
    },
    {
        title: 'Therapeutic Exercises',
        description: 'Evidence-based CBT and mindfulness activities for daily wellness.',
        icon: Icons.Brain,
        path: 'exercises',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10'
    },
    {
        title: 'Mood Tracker',
        description: 'Visualize your emotional journey with daily mood logging.',
        icon: Icons.Activity,
        path: 'mood',
        color: 'text-amber-500',
        bg: 'bg-amber-500/10'
    },
    {
        title: 'Mood-Based Music',
        description: 'Curated playlists that adapt to your current emotional needs.',
        icon: Icons.Music,
        path: 'music',
        color: 'text-pink-500',
        bg: 'bg-pink-500/10'
    },
    {
        title: 'AI Journaling',
        description: 'Reflect on your day with guided prompts and sentiment feedback.',
        icon: Icons.PenSquare,
        path: 'journal',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
    },
    {
        title: 'Resource Library',
        description: 'Expansive collection of mental health articles and workshops.',
        icon: Icons.BookOpen,
        path: 'search',
        color: 'text-teal-500',
        bg: 'bg-teal-500/10'
    }
];

const MentibotLanding: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isDashboard = location.pathname.startsWith('/dashboard');

    return (
        <div className="space-y-6 sm:space-y-8 pb-12 overflow-x-hidden font-sans">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-black border border-white/5 p-6 sm:p-10 md:p-16 lg:p-20">
                {/* Background Decoration */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 transform translate-x-1/4 opacity-20 pointer-events-none transition-opacity duration-1000">
                    <Icons.Brain className="h-[400px] w-[400px] sm:h-[600px] sm:w-[600px] text-primary" />
                </div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none animate-pulse" />

                {/* Atmospheric Light Rays */}
                <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent rotate-[30deg] blur-sm pointer-events-none" />
                <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent rotate-[30deg] blur-sm pointer-events-none translate-x-20" />

                <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 sm:space-y-8"
                    >
                        <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                                <Icons.Sparkles className="h-3.5 w-3.5 animate-pulse" />
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest font-sans">DocuMedic AI Companion</span>
                            </div>
                            {isDashboard && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate('/mentibot')}
                                    className="rounded-full bg-white/5 dark:bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 transition-colors text-[10px] sm:text-xs font-bold uppercase tracking-widest font-sans"
                                >
                                    <Icons.Smartphone className="h-3.5 w-3.5 mr-2" />
                                    Standalone Mode
                                </Button>
                            )}
                        </div>

                        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-heading leading-[0.9] sm:leading-tight tracking-tighter uppercase italic text-white flex flex-col">
                            <span>Better mental</span>
                            <span className="text-primary italic">Health with AI</span>
                        </h1>

                        <p className="text-sm sm:text-base md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 font-sans">
                            A comprehensive mental health companion designed to help you navigate your emotions, track your growth, and find the support you need, whenever you need it.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <Button size="lg" variant="gradient" className="rounded-full px-10 py-7 text-base sm:text-lg font-black uppercase italic tracking-tighter w-full sm:w-auto font-heading" asChild>
                                <Link to={isDashboard ? "/dashboard/mentibot/chat" : "/mentibot/chat"}>Talk to AI</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-full px-10 py-7 text-base sm:text-lg font-black uppercase italic tracking-tighter border-white/20 hover:bg-white/5 w-full sm:w-auto text-white font-heading" asChild>
                                <Link to={isDashboard ? "/dashboard/mentibot/exercises" : "/mentibot/exercises"}>Wellness Tools</Link>
                            </Button>
                        </div>
                    </motion.div>

                    {/* Status Badges Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="hidden lg:flex flex-col items-end space-y-6"
                    >
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl skew-x-[-6deg] hover:skew-x-0 transition-transform duration-500 w-64"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center ring-1 ring-emerald-500/30">
                                    <Icons.Activity className="h-6 w-6 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest font-sans">System Status</p>
                                    <p className="text-sm text-emerald-500 font-black font-heading">AI ONLINE</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 15, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            className="p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl skew-x-[-6deg] hover:skew-x-0 transition-transform duration-500 w-64 mr-12"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center ring-1 ring-primary/30">
                                    <Icons.Shield className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest font-sans">Privacy level</p>
                                    <p className="text-sm text-primary font-black font-heading">HIPAA READY</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="px-1 sm:px-0">
                <div className="flex flex-col mb-8 items-center lg:items-start text-center lg:text-left">
                    <h2 className="text-2xl sm:text-3xl font-black font-heading uppercase italic skew-x-[-10deg] tracking-tighter">
                        Platform <span className="text-primary">Ecosystem</span>
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-lg font-sans">Power tools for your emotional wellbeing journey</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link to={isDashboard ? `/dashboard/mentibot/${feature.path}` : `/mentibot/${feature.path}`}>
                                <Card variant="premium" hover className="h-full border border-white/5 hover:border-primary/40 bg-card/40 backdrop-blur-sm transition-all duration-500 group overflow-hidden">
                                    <CardContent className="p-6 flex flex-col h-full relative z-10">
                                        <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 ring-1 ring-white/10 group-hover:ring-primary/40 group-hover:scale-110 transition-all duration-500`}>
                                            <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                        </div>
                                        <CardTitle className="text-lg sm:text-xl font-black uppercase italic tracking-tighter mb-2 group-hover:text-primary transition-colors duration-300 font-heading">
                                            {feature.title}
                                        </CardTitle>
                                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-6 flex-grow font-sans">
                                            {feature.description}
                                        </p>
                                        <div className="flex items-center text-primary text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 font-sans">
                                            Initialize Module
                                            <Icons.ArrowRight className="w-3 h-3 ml-2" />
                                        </div>
                                    </CardContent>
                                    {/* Subtle background glow on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Crisis Banner */}
            <section className="bg-red-500/5 border border-red-500/20 rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Icons.AlertTriangle className="h-24 w-24 text-red-500" />
                </div>

                <div className="flex items-center gap-4 sm:gap-6 relative z-10 text-center md:text-left flex-col md:flex-row">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                        <Icons.Bell className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter text-red-500 font-heading">In immediate danger?</h3>
                        <p className="text-muted-foreground text-sm sm:text-base max-w-md mt-1 font-medium font-sans">
                            Mentibot provides support, but if you are in a life-threatening crisis, please reach out to emergency services immediately.
                        </p>
                    </div>
                </div>
                <Button variant="danger" className="w-full md:w-auto rounded-full px-8 py-6 font-black uppercase italic tracking-tighter relative z-10 font-heading" asChild>
                    <Link to={isDashboard ? "/dashboard/mentibot/emergency" : "/mentibot/emergency"}>Emergency Protocol</Link>
                </Button>
            </section>
        </div>
    );
};

export default MentibotLanding;
