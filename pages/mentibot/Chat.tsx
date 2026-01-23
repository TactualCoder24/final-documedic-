import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { chatWithMentibot, MentalHealthResponse } from '../../services/mentibotAI';
import { logInteraction } from '../../services/mentibotSupabase';
import {
    SendHorizonal, Brain, Sparkles, Bell,
    ArrowLeft, Bot, RefreshCw, AlertTriangle
} from '../../components/icons/Icons';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { Link } from 'react-router-dom';

interface Message {
    role: 'user' | 'model';
    parts: { text: string }[];
    timestamp: Date;
    sentiment?: string;
    isCrisis?: boolean;
}

const MentibotChat: React.FC = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading || !user) return;

        const userMessage: Message = {
            role: 'user',
            parts: [{ text: input }],
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const history = messages.map(m => ({
                role: m.role,
                parts: m.parts
            }));

            const aiResponse: MentalHealthResponse = await chatWithMentibot(input, history);

            const modelMessage: Message = {
                role: 'model',
                parts: [{ text: aiResponse.text }],
                timestamp: new Date(),
                sentiment: aiResponse.sentiment,
                isCrisis: aiResponse.isCrisis
            };

            setMessages(prev => [...prev, modelMessage]);

            // Log to Supabase
            await logInteraction({
                user_id: user.uid,
                timestamp: new Date().toISOString(),
                mood_score: undefined, // Could be derived from sentiment
                sentiment_summary: aiResponse.sentiment,
                feature_used: 'AI Chat',
                notes: aiResponse.isCrisis ? 'CRISIS DETECTED' : undefined
            });

        } catch (err) {
            console.error(err);
            setError('I encountered an error. Please try again or check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/mentibot">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black font-heading uppercase italic tracking-tighter flex items-center gap-2">
                            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                            AI Wellness Chat
                        </h1>
                        <p className="text-muted-foreground text-[10px] sm:text-sm uppercase tracking-widest font-bold opacity-70">Empathetic Mental Health Support</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">AI SECURE</span>
                </div>
            </div>

            {/* Chat Area */}
            <Card variant="premium" className="flex-1 overflow-hidden flex flex-col border-primary/10">
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin"
                >
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
                            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center animate-bounce">
                                <Brain className="h-10 w-10 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold font-heading">How are you feeling today?</h2>
                            <p className="text-muted-foreground text-sm">
                                I'm here to listen, support, and help you navigate your thoughts.
                                Everything shared here is secure and private.
                            </p>
                        </div>
                    )}

                    <AnimatePresence initial={false}>
                        {messages.map((message, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] md:max-w-[75%] space-y-2`}>
                                    <div className={`
                    p-4 rounded-2xl shadow-sm
                    ${message.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                                            : message.isCrisis
                                                ? 'bg-destructive/10 border-2 border-destructive text-foreground rounded-tl-none'
                                                : 'bg-muted rounded-tl-none border border-border/50'
                                        }
                   `}>
                                        {message.isCrisis && (
                                            <div className="flex items-center gap-2 text-destructive font-bold text-xs mb-2 uppercase">
                                                <AlertTriangle className="h-3 w-3" />
                                                Crisis Detected
                                            </div>
                                        )}
                                        <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                                            {message.parts[0].text}
                                        </p>
                                    </div>
                                    <div className={`text-[10px] text-muted-foreground ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                                        {message.role === 'model' ? 'DocuMedic AI' : 'You'} • {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-muted p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                                <span className="text-sm text-muted-foreground">AI is reflecting...</span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex justify-center">
                            <div className="bg-destructive/10 text-destructive text-sm px-4 py-2 rounded-full border border-destructive/20">
                                {error}
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-border/50 bg-card/50">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Tell me what's on your mind..."
                            className="flex-1 h-12 rounded-xl focus-visible:ring-primary/30"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            variant="gradient"
                            size="icon"
                            className="h-12 w-12 rounded-xl shadow-lg shadow-primary/20"
                            disabled={isLoading || !input.trim()}
                        >
                            <SendHorizonal className="h-5 w-5" />
                        </Button>
                    </form>
                    <p className="text-[10px] text-center text-muted-foreground mt-2 px-4">
                        DocuMedic AI is an AI companion, not a replacement for professional therapy.
                        If you are in danger, please contact emergency services.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default MentibotChat;
