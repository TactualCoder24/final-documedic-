import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    PenSquare, ArrowLeft, Sparkles, BookOpen,
    Trash2, Send, Calendar, Star, Info, RefreshCw
} from '../../components/icons/Icons';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Link } from 'react-router-dom';

const prompts = [
    "What made you smile today?",
    "Describe a challenge you faced and how you handled it.",
    "What are you grateful for in this moment?",
    "How did you take care of yourself today?",
    "What's one thing you'd like to improve tomorrow?"
];

const MentibotJournal: React.FC = () => {
    const [entry, setEntry] = useState('');
    const [selectedPrompt, setSelectedPrompt] = useState(prompts[0]);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!entry.trim()) return;
        setIsSaving(true);
        // Simulate save
        setTimeout(() => {
            setIsSaving(false);
            setEntry('');
            alert('Journal entry saved successfully!');
        }, 1500);
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
                        <PenSquare className="h-8 w-8 text-primary" />
                        AI Journaling
                    </h1>
                    <p className="text-muted-foreground">Release your thoughts and reflect on your inner world.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Editor Area */}
                <div className="lg:col-span-2 space-y-6">
                    <Card variant="premium" className="border-primary/20 overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b border-primary/10">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    Guided Reflection
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedPrompt(prompts[Math.floor(Math.random() * prompts.length)])}
                                    className="text-primary hover:bg-primary/10"
                                >
                                    <RefreshCw className="h-3 w-3 mr-2" />
                                    New Prompt
                                </Button>
                            </div>
                            <p className="mt-2 text-foreground font-medium italic">"{selectedPrompt}"</p>
                        </CardHeader>
                        <CardContent className="p-0">
                            <textarea
                                value={entry}
                                onChange={(e) => setEntry(e.target.value)}
                                placeholder="Start writing here..."
                                className="w-full h-80 p-8 bg-transparent border-none focus:ring-0 resize-none text-lg leading-relaxed placeholder:text-muted-foreground/30"
                            />
                            <div className="p-4 bg-muted/30 border-t border-border/50 flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">{entry.trim().split(/\s+/).filter(x => x).length} words</span>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setEntry('')} disabled={!entry.trim() || isSaving}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Clear
                                    </Button>
                                    <Button variant="gradient" onClick={handleSave} disabled={!entry.trim() || isSaving}>
                                        {isSaving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                                        Save Entry
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-2 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm">
                        <Info className="h-5 w-5 shrink-0" />
                        AI analysis is used to understand your journal sentiment privately to provide better wellness tips in your dashboard.
                    </div>
                </div>

                {/* Previous Entries Sidebar */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold font-heading flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Recent Entries
                        </h2>
                        <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                    </div>

                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} variant="premium" hover className="border-border/50 transition-all group">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            <Calendar className="h-3 w-3" />
                                            Oct {20 - i}, 2023
                                        </div>
                                        <div className="flex gap-1 text-amber-500">
                                            <Star className="h-3 w-3 fill-current" />
                                            <Star className="h-3 w-3 fill-current" />
                                            <Star className="h-3 w-3 fill-current" />
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-sm group-hover:text-primary transition-colors">A productive day...</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">Today I managed to complete the project ahead of schedule and...</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card variant="premium" className="bg-indigo-500/5 border-indigo-500/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Sentiment Report</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs font-bold">
                                    <span>POSIVITY</span>
                                    <span className="text-emerald-500">85%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[85%]" />
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Your journals show a steady increase in positive sentiment over the last 3 entries. Great progress!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MentibotJournal;
