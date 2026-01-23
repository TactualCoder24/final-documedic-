import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { logMood, getMoodHistory, MoodEntry } from '../../services/mentibotSupabase';
import {
    ArrowLeft, Activity, Calendar, TrendingUp,
    Smile, Frown, Meh, Laugh, Angry, CloudRain
} from '../../components/icons/Icons';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Link } from 'react-router-dom';

const moods = [
    { score: 5, label: 'Excellent', icon: Laugh, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { score: 4, label: 'Good', icon: Smile, color: 'text-primary', bg: 'bg-primary/10' },
    { score: 3, label: 'Neutral', icon: Meh, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { score: 2, label: 'Down', icon: Frown, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { score: 1, label: 'Stressed', icon: Angry, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { score: 0, label: 'Depressed', icon: CloudRain, color: 'text-slate-500', bg: 'bg-slate-500/10' }
];

const MentibotMood: React.FC = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<MoodEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (user) fetchHistory();
    }, [user]);

    const fetchHistory = async () => {
        try {
            const data = await getMoodHistory(user!.uid);
            setHistory(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogMood = async () => {
        if (selectedMood === null || !user) return;
        setIsLoading(true);
        try {
            const moodObj = moods.find(m => m.score === selectedMood);
            await logMood({
                user_id: user.uid,
                date: new Date().toISOString().split('T')[0],
                mood_score: selectedMood,
                mood_label: moodObj?.label,
                notes: notes
            });
            fetchHistory();
            setNotes('');
            setSelectedMood(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

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
                        <Activity className="h-8 w-8 text-primary" />
                        Mood Tracker
                    </h1>
                    <p className="text-muted-foreground">Log your daily mood and track your emotional trends.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Mood Logging */}
                <Card variant="premium" className="border-primary/20">
                    <CardHeader>
                        <CardTitle>How are you feeling right now?</CardTitle>
                        <CardDescription>Select the emoji that best matches your state.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                            {moods.map((m) => (
                                <button
                                    key={m.score}
                                    onClick={() => setSelectedMood(m.score)}
                                    className={`
                    flex flex-col items-center gap-2 p-4 rounded-2xl transition-all
                    ${selectedMood === m.score ? `${m.bg} ring-2 ring-primary scale-110` : 'hover:bg-muted'}
                  `}
                                >
                                    <m.icon className={`h-8 w-8 ${selectedMood === m.score ? m.color : 'text-muted-foreground'}`} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{m.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-muted-foreground ml-1">Optional Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="What's contributing to this feeling?"
                                className="w-full h-32 p-4 rounded-2xl bg-muted border-none focus:ring-2 focus:ring-primary/30 resize-none text-sm"
                            />
                        </div>

                        <Button
                            className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/20"
                            variant="gradient"
                            disabled={selectedMood === null || isLoading}
                            onClick={handleLogMood}
                        >
                            Log Mood Entry
                        </Button>
                    </CardContent>
                </Card>

                {/* Mood History */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Recent Trends
                        </h2>
                        <Button variant="ghost" size="sm" className="gap-2">
                            <Calendar className="h-4 w-4" />
                            Full History
                        </Button>
                    </div>

                    {history.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl text-muted-foreground">
                            <Activity className="h-12 w-12 mb-4 opacity-20" />
                            <p>No mood data yet. Start logging today!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.slice(0, 5).map((entry, idx) => {
                                const moodObj = moods.find(m => m.score === entry.mood_score);
                                const Icon = moodObj?.icon || Meh;
                                return (
                                    <motion.div
                                        key={entry.id || idx}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl ${moodObj?.bg || 'bg-muted'} flex items-center justify-center`}>
                                                <Icon className={`h-6 w-6 ${moodObj?.color || 'text-muted-foreground'}`} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm">{entry.mood_label}</h4>
                                                <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        {entry.notes && (
                                            <div className="max-w-[40%] text-right">
                                                <p className="text-[10px] text-muted-foreground line-clamp-1 italic">"{entry.notes}"</p>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* Mini Chart Mockup */}
                    <Card variant="premium" className="bg-primary/5 border-primary/10">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-primary">7-DAY SUMMARY</span>
                                <span className="text-xs text-muted-foreground">Average: Good</span>
                            </div>
                            <div className="flex items-end justify-between h-20 gap-2">
                                {[40, 60, 45, 80, 55, 70, 90].map((h, i) => (
                                    <div key={i} className="flex-1 bg-primary/20 rounded-t-lg transition-all hover:bg-primary/40" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MentibotMood;
