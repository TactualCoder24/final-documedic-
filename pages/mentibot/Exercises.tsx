import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, ArrowLeft, Wind, Sparkles, Activity,
    CheckCircle2, Clock, Star, PlayCircle
} from '../../components/icons/Icons';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Link } from 'react-router-dom';

interface Exercise {
    id: string;
    title: string;
    category: 'CBT' | 'Mindfulness' | 'Stress' | 'Anxiety';
    description: string;
    duration: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    icon: any;
    steps: string[];
}

const exercises: Exercise[] = [
    {
        id: 'box-breathing',
        title: 'Box Breathing',
        category: 'Stress',
        description: 'A simple yet powerful technique to calm the nervous system and regain focus.',
        duration: '5 min',
        difficulty: 'Easy',
        icon: Wind,
        steps: [
            'Inhale slowly through your nose for 4 seconds.',
            'Hold your breath for 4 seconds.',
            'Exhale slowly through your mouth for 4 seconds.',
            'Hold empty for 4 seconds.',
            'Repeat the cycle 4 times.'
        ]
    },
    {
        id: 'thought-challenging',
        title: 'Thought Challenging',
        category: 'CBT',
        description: 'Identify and reframe negative thought patterns into more realistic ones.',
        duration: '10 min',
        difficulty: 'Medium',
        icon: Brain,
        steps: [
            'Write down a negative thought you had recently.',
            'Identify the cognitive distortion (e.g., Catastrophizing).',
            'List evidence supporting this thought.',
            'List evidence contradicting this thought.',
            'Create a more balanced, realistic perspective.'
        ]
    },
    {
        id: 'body-scan',
        title: 'Body Scan Meditation',
        category: 'Mindfulness',
        description: 'Progressively focus on and relax each part of your body to reduce tension.',
        duration: '15 min',
        difficulty: 'Easy',
        icon: Activity,
        steps: [
            'Lie down or sit comfortably in a quiet space.',
            'Bring awareness to your feet and toes, noticing any sensations.',
            'Slowly move your attention up to your calves, knees, and thighs.',
            'Continue through your torso, arms, neck, and head.',
            'Consciously release tension as you move from section to section.'
        ]
    },
    {
        id: '54321-grounding',
        title: '5-4-3-2-1 Grounding',
        category: 'Anxiety',
        description: 'A sensory technique to pull you out of anxiety and back into the present moment.',
        duration: '3 min',
        difficulty: 'Easy',
        icon: Sparkles,
        steps: [
            'Acknowledge 5 things you can see around you.',
            'Acknowledge 4 things you can touch.',
            'Acknowledge 3 things you can hear.',
            'Acknowledge 2 things you can smell.',
            'Acknowledge 1 thing you can taste.'
        ]
    }
];

const MentibotExercises: React.FC = () => {
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

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
                        Therapeutic Exercises
                    </h1>
                    <p className="text-muted-foreground">Evidence-based activities for your mental wellness.</p>
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
                                    Back
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
                                    Step-by-Step Guide
                                </h3>
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
                                        Complete Exercise
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
