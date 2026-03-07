import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, ArrowLeft, Wind, Sparkles, Activity,
    CheckCircle2, Clock, Star, PlayCircle
} from '../../components/icons/Icons';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Exercise {
    id: string;
    title: string;
    category: 'CBT' | 'Mindfulness' | 'Stress' | 'Anxiety';
    description: string;
    duration: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    icon: any;
    steps: string[];
    audioUrl?: string;
}

const MentibotExercises: React.FC = () => {
    const { t } = useTranslation();
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

    const exercises: Exercise[] = [
        {
            id: 'box-breathing',
            title: t('exercises.box_breathing.title', 'Box Breathing'),
            category: 'Stress',
            description: t('exercises.box_breathing.desc', 'A simple yet powerful technique to calm the nervous system and regain focus.'),
            duration: '5 min',
            difficulty: 'Easy',
            icon: Wind,
            // Audio removed — Pixabay download URLs require auth and often fail in production
            steps: [
                t('exercises.box_breathing.step1', 'Inhale slowly through your nose for 4 seconds.'),
                t('exercises.box_breathing.step2', 'Hold your breath for 4 seconds.'),
                t('exercises.box_breathing.step3', 'Exhale slowly through your mouth for 4 seconds.'),
                t('exercises.box_breathing.step4', 'Hold empty for 4 seconds.'),
                t('exercises.box_breathing.step5', 'Repeat the cycle 4 times.')
            ]
        },
        {
            id: 'thought-challenging',
            title: t('exercises.thought_challenging.title', 'Thought Challenging'),
            category: 'CBT',
            description: t('exercises.thought_challenging.desc', 'Identify and reframe negative thought patterns into more realistic ones.'),
            duration: '10 min',
            difficulty: 'Medium',
            icon: Brain,
            steps: [
                t('exercises.thought_challenging.step1', 'Write down a negative thought you had recently.'),
                t('exercises.thought_challenging.step2', 'Identify the cognitive distortion (e.g., Catastrophizing).'),
                t('exercises.thought_challenging.step3', 'List evidence supporting this thought.'),
                t('exercises.thought_challenging.step4', 'List evidence contradicting this thought.'),
                t('exercises.thought_challenging.step5', 'Create a more balanced, realistic perspective.')
            ]
        },
        {
            id: 'body-scan',
            title: t('exercises.body_scan.title', 'Body Scan Meditation'),
            category: 'Mindfulness',
            description: t('exercises.body_scan.desc', 'Progressively focus on and relax each part of your body to reduce tension.'),
            duration: '15 min',
            difficulty: 'Easy',
            icon: Activity,
            // Audio removed — Pixabay download URLs require auth and often fail in production
            steps: [
                t('exercises.body_scan.step1', 'Lie down or sit comfortably in a quiet space.'),
                t('exercises.body_scan.step2', 'Bring awareness to your feet and toes, noticing any sensations.'),
                t('exercises.body_scan.step3', 'Slowly move your attention up to your calves, knees, and thighs.'),
                t('exercises.body_scan.step4', 'Continue through your torso, arms, neck, and head.'),
                t('exercises.body_scan.step5', 'Consciously release tension as you move from section to section.')
            ]
        },
        {
            id: '54321-grounding',
            title: t('exercises.grounding.title', '5-4-3-2-1 Grounding'),
            category: 'Anxiety',
            description: t('exercises.grounding.desc', 'A sensory technique to pull you out of anxiety and back into the present moment.'),
            duration: '3 min',
            difficulty: 'Easy',
            icon: Sparkles,
            steps: [
                t('exercises.grounding.step1', 'Acknowledge 5 things you can see around you.'),
                t('exercises.grounding.step2', 'Acknowledge 4 things you can touch.'),
                t('exercises.grounding.step3', 'Acknowledge 3 things you can hear.'),
                t('exercises.grounding.step4', 'Acknowledge 2 things you can smell.'),
                t('exercises.grounding.step5', 'Acknowledge 1 thing you can taste.')
            ]
        }
    ];

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
                        <Brain className="h-8 w-8 text-primary" />
                        {t('exercises.title', 'Therapeutic Exercises')}
                    </h1>
                    <p className="text-muted-foreground">{t('exercises.subtitle', 'Evidence-based activities for your mental wellness.')}</p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {!selectedExercise ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {exercises.map((ex) => (
                            <Card
                                key={ex.id}
                                variant="premium"
                                hover
                                onClick={() => setSelectedExercise(ex)}
                                className="group border-primary/10"
                            >
                                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{ex.title}</CardTitle>
                                        <CardDescription>{ex.category} • {ex.duration}</CardDescription>
                                    </div>
                                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                        <ex.icon className="h-6 w-6" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                                        {ex.description}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {ex.duration}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                            <Star className="h-3 w-3 text-amber-500" />
                                            {ex.difficulty}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-2xl mx-auto"
                    >
                        <Card variant="premium" className="border-primary/20 bg-gradient-to-b from-card to-primary/5">
                            <CardHeader className="text-center border-b border-border/50 pb-8">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-4 left-4"
                                    onClick={() => setSelectedExercise(null)}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    {t('common.back', 'Back')}
                                </Button>
                                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                    <selectedExercise.icon className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-bold font-heading">{selectedExercise.title}</CardTitle>
                                <CardDescription className="text-lg mt-2">{selectedExercise.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <PlayCircle className="h-5 w-5 text-primary" />
                                    {t('exercises.step_guide', 'Step-by-Step Guide')}
                                </h3>

                                {selectedExercise.audioUrl && (
                                    <div className="mb-8 p-4 bg-primary/10 rounded-2xl border border-primary/20">
                                        <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                                            <Wind className="h-4 w-4" />
                                            {t('exercises.guided_audio', 'Guided Audio')}
                                        </h4>
                                        <audio
                                            controls
                                            className="w-full focus:outline-none"
                                            controlsList="nodownload"
                                            src={selectedExercise.audioUrl}
                                        >
                                            {t('exercises.audio_notsupported', 'Your browser does not support the audio element.')}
                                        </audio>
                                        <p className="text-xs text-muted-foreground mt-2 italic">{t('exercises.audio_hint', 'Listen to the guided meditation while following the steps below.')}</p>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    {selectedExercise.steps.map((step, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                                                {idx + 1}
                                            </div>
                                            <p className="text-foreground leading-relaxed pt-1">
                                                {step}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-12 flex justify-center">
                                    <Button
                                        size="lg"
                                        variant="gradient"
                                        className="px-12"
                                        onClick={() => setSelectedExercise(null)}
                                    >
                                        <CheckCircle2 className="h-5 w-5 mr-2" />
                                        {t('exercises.complete', 'Complete Exercise')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MentibotExercises;
