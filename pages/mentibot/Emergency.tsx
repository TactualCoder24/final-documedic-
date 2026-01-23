import React from 'react';
import { motion } from 'framer-motion';
import {
    Bell, ArrowLeft, Phone, Globe, ShieldAlert,
    MapPin, HeartPulse, ExternalLink, HelpCircle
} from '../../components/icons/Icons';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Link } from 'react-router-dom';

const contacts = [
    {
        name: 'National Suicide Prevention Lifeline',
        number: '988',
        description: '24/7, free and confidential support for people in distress.',
        type: 'Primary'
    },
    {
        name: 'Crisis Text Line',
        number: 'Text HOME to 741741',
        description: 'Free, 24/7 crisis counseling via text message.',
        type: 'Text'
    },
    {
        name: 'Emergency Services',
        number: '911',
        description: 'For immediate danger or medical emergencies.',
        type: 'Emergency'
    },
    {
        name: 'Disaster Distress Helpline',
        number: '1-800-985-5990',
        description: 'Crisis counseling for people experiencing emotional distress related to natural or human-caused disasters.',
        type: 'Specialized'
    }
];

const MentibotEmergency: React.FC = () => {
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
                    <h1 className="text-3xl font-bold font-heading flex items-center gap-2 text-destructive">
                        <Bell className="h-8 w-8" />
                        Crisis & Emergency Support
                    </h1>
                    <p className="text-muted-foreground font-medium">You are not alone. Immediate help is available.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contact List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {contacts.map((contact) => (
                            <Card key={contact.name} variant="premium" className="border-destructive/20 bg-destructive/5">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-destructive/10 text-destructive border border-destructive/20">
                                            {contact.type}
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg mt-4">{contact.name}</CardTitle>
                                    <CardDescription className="text-destructive/80 font-bold text-xl">{contact.number}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-6">{contact.description}</p>
                                    <Button variant="danger" className="w-full h-12 rounded-xl gap-2 font-bold shadow-lg shadow-destructive/20">
                                        <Phone className="h-4 w-4" />
                                        Call Now
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card variant="premium" className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-primary" />
                                Wait, before you act...
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                If you're feeling overwhelmed, please try these small steps first while waiting for professional help:
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                                    Take 10 deep, slow breaths.
                                </li>
                                <li className="flex items-start gap-3 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                                    Drinking a glass of cold water can ground your nervous system.
                                </li>
                                <li className="flex items-start gap-3 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                                    Reach out to one person you trust—even if it's just a text.
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Resources Sidebar */}
                <div className="space-y-6">
                    <Card variant="premium">
                        <CardHeader>
                            <CardTitle className="text-xl">International Resources</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">Find support outside the United States.</p>
                            <div className="space-y-2">
                                <Button variant="outline" className="w-full justify-between gap-2" asChild>
                                    <a href="https://www.befrienders.org/" target="_blank" rel="noopener noreferrer">
                                        Befrienders Worldwide
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </Button>
                                <Button variant="outline" className="w-full justify-between gap-2" asChild>
                                    <a href="https://www.iasp.info/resources/Crisis_Centres/" target="_blank" rel="noopener noreferrer">
                                        IASP Crisis Centres
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </Button>
                                <Button variant="outline" className="w-full justify-between gap-2" asChild>
                                    <a href="https://www.who.int/news-room/fact-sheets/detail/suicide" target="_blank" rel="noopener noreferrer">
                                        WHO Mental Health
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card variant="premium" className="bg-emerald-500/5 border-emerald-500/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500">
                                    <HelpCircle className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold">Need a conversation?</h3>
                            </div>
                            <p className="text-xs text-muted-foreground mb-6">
                                If you're not in immediate danger but need someone to talk to, Mentibot is here to listen.
                            </p>
                            <Button variant="outline" className="w-full border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10" asChild>
                                <Link to="/mentibot/chat">Speak to Wellness AI</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MentibotEmergency;
