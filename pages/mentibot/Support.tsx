import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import {
    Sparkles, ArrowLeft, Heart, Shield, Book,
    Lightbulb, CheckCircle2, RefreshCw
} from '../../components/icons/Icons';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Link } from 'react-router-dom';

const MentibotSupport: React.FC = () => {
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Mock recommendations for now
        setRecommendations([
            {
                id: '1',
                title: 'Mindfulness Break',
                description: 'Your mood has been slightly low today. A 5-minute breathing exercise could help.',
                type: 'Exercise',
                icon: Sparkles,
                link: '/mentibot/exercises'
            },
            {
                id: '2',
                title: 'Calming Soundscape',
                description: 'You mentioned feeling stressed. We recommend the "Peaceful Piano" playlist.',
                type: 'Music',
                icon: Heart,
                link: '/mentibot/music'
            },
            {
                id: '3',
                title: 'Journaling Prompt',
                description: 'Reflect on one thing that went well today, no matter how small.',
                type: 'Journal',
                icon: Book,
                link: '/mentibot/journal'
            }
        ]);
    }, []);

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/mentibot">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold font-heading flex items-center gap-2">
                        <Shield className="h-8 w-8 text-primary" />
                        Personalized Support
                    </h1>
                    <p className="text-muted-foreground">AI-curated recommendations based on your unique wellness journey.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="premium" className="bg-primary/5 md:col-span-3 border-primary/20">
                    <CardContent className="flex flex-col md:flex-row items-center gap-8 p-8">
                        <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                        </div>
                        <div className="text-center md:text-left space-y-2">
                            <h2 className="text-2xl font-bold font-heading">Mental Wellness Insight</h2>
                            <p className="text-muted-foreground max-w-2xl leading-relaxed">
                                Based on your recent interactions and mood logs, AI has identified that you're showing great resilience this week. Keep up the consistent self-care!
                            </p>
                        </div>
                        <Button variant="outline" className="shrink-0 gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Update Analysis
                        </Button>
                    </CardContent>
                </Card>

                {recommendations.map((rec, idx) => (
                    <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card variant="premium" hover className="h-full border-border/50">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="p-3 rounded-xl bg-muted text-primary">
                                        <rec.icon className="h-6 w-6" />
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">
                                        {rec.type}
                                    </span>
                                </div>
                                <CardTitle className="mt-4">{rec.title}</CardTitle>
                                <CardDescription>{rec.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto">
                                <Button variant="ghost" className="w-full justify-between group" asChild>
                                    <Link to={rec.link}>
                                        Explore Now
                                        <CheckCircle2 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Card variant="premium" className="border-border/50 overflow-hidden">
                <div className="p-1 bg-gradient-to-r from-primary via-accent to-primary" />
                <CardContent className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold font-heading flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-amber-500" />
                            Daily Wellness Tip
                        </h3>
                        <p className="text-muted-foreground italic">"Practice the 5-4-3-2-1 technique if you feel a surge of anxiety during your workday."</p>
                    </div>
                    <Button variant="gradient" className="rounded-full px-8 shrink-0">
                        View All Tips
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default MentibotSupport;
