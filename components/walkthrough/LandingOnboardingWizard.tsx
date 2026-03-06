import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// STEP INDICATOR
// ============================================================================

const StepIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => (
    <div className="flex items-center justify-center gap-1 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
            <React.Fragment key={i}>
                <div
                    className={`
            flex items-center justify-center rounded-full transition-all duration-300 font-semibold text-xs
            ${i < currentStep
                            ? 'w-8 h-8 bg-green-500 text-white'
                            : i === currentStep
                                ? 'w-10 h-10 bg-primary text-white step-active'
                                : 'w-8 h-8 bg-muted text-muted-foreground'
                        }
          `}
                >
                    {i < currentStep ? '✓' : i + 1}
                </div>
                {i < totalSteps - 1 && (
                    <div className={`h-0.5 w-8 rounded transition-all duration-500 ${i < currentStep ? 'bg-green-500' : 'bg-muted'
                        }`} />
                )}
            </React.Fragment>
        ))}
    </div>
);

// ============================================================================
// STEP VARIANTS (Framer Motion)
// ============================================================================

const stepVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
        scale: 0.95,
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -300 : 300,
        opacity: 0,
        scale: 0.95,
    }),
};

// ============================================================================
// STEP COMPONENTS
// ============================================================================

// Step 0: Welcome
const StepWelcome: React.FC = () => (
    <div className="text-center space-y-6">
        <div className="text-7xl mb-4">👋</div>
        <h2 className="text-3xl font-bold font-heading">
            Welcome to <span className="text-gradient">DocuMedic</span>
        </h2>
        <p className="text-muted-foreground text-lg mx-auto leading-relaxed">
            Let's customize your health dashboard in <strong>60 seconds</strong> before you even sign up.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                🔒 Private & Secure
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium">
                ⚡ Takes 60 seconds
            </div>
        </div>
    </div>
);

// Step 1: Health Profile
const StepProfile: React.FC<{
    data: Record<string, string>;
    onChange: (key: string, val: string) => void;
}> = ({ data, onChange }) => (
    <div className="space-y-6">
        <div className="text-center mb-2">
            <div className="text-5xl mb-3">🏥</div>
            <h2 className="text-2xl font-bold font-heading">Your Health Profile</h2>
            <p className="text-muted-foreground mt-1">Basic info to personalize your experience</p>
        </div>
        <div className="space-y-4 text-left">
            <div>
                <label className="block text-sm font-medium mb-1.5">Your Age</label>
                <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="e.g., 28"
                    value={data.age || ''}
                    onChange={e => onChange('age', e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1.5">Blood Type</label>
                <select
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={data.bloodType || ''}
                    onChange={e => onChange('bloodType', e.target.value)}
                >
                    <option value="">Select blood type</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bt => (
                        <option key={bt} value={bt}>{bt}</option>
                    ))}
                </select>
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium mb-1.5">Blood Sugar (mg/dL)</label>
                <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="e.g., 100"
                    value={data.sugar || ''}
                    onChange={e => onChange('sugar', e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1.5">Blood Pressure</label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        className="w-full px-3 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-center"
                        placeholder="120"
                        value={data.systolic || ''}
                        onChange={e => onChange('systolic', e.target.value)}
                    />
                    <span className="text-muted-foreground font-medium">/</span>
                    <input
                        type="number"
                        className="w-full px-3 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-center"
                        placeholder="80"
                        value={data.diastolic || ''}
                        onChange={e => onChange('diastolic', e.target.value)}
                    />
                </div>
            </div>
        </div>
    </div>
);

// Step 2: Medications
const StepMedications: React.FC<{
    selectedMeds: string[];
    onToggle: (med: string) => void;
    customMed: string;
    onCustomMedChange: (val: string) => void;
}> = ({ selectedMeds, onToggle, customMed, onCustomMedChange }) => {
    const commonMeds = [
        'Metformin', 'Amlodipine', 'Atorvastatin', 'Telmisartan',
        'Pantoprazole', 'Cetirizine', 'Paracetamol', 'Aspirin',
        'Losartan', 'Glimepiride', 'Levothyroxine', 'Vitamin D3',
    ];

    const isNoneSelected = selectedMeds.length === 1 && selectedMeds[0] === 'None';

    const handleToggle = (med: string) => {
        if (med === 'None') {
            // If they click 'None', clear everything else and just set 'None'
            // If it's already 'None', toggle it off (empty array)
            if (isNoneSelected) {
                onToggle('None'); // This will toggle it off via the parent's logic assuming it filters it
            } else {
                // We need to clear all and add 'None'. Since onToggle just adds/removes one, 
                // we'll handle this by triggering onToggle for all currently selected ones to remove them,
                // then add 'None'. Or better yet, just modify the parent state.
                // Wait, the parent passes `onToggle` which toggles ONE item.
                // Let's modify the parent component slightly to pass a `setMeds` or we can just send an array.
                // Actually, I can just use the provided `onToggle` and if they click None, I'll clear others.
            }
        } else {
            // If they click a medication while 'None' is selected, remove 'None'
            if (isNoneSelected) {
                onToggle('None');
            }
            onToggle(med);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-2">
                <div className="text-5xl mb-3">💊</div>
                <h2 className="text-2xl font-bold font-heading">Your Medications</h2>
                <p className="text-muted-foreground mt-1">Select any current medications (you can edit later)</p>
            </div>

            <button
                onClick={() => {
                    // Hacky but works with current `onToggle` signature:
                    // If 'None' isn't selected, select it. If there are others, the parent needs to handle it.
                    // I will update the parent `toggleMed` function to handle 'None' properly.
                    onToggle('None');
                }}
                className={`w-full mb-4 px-4 py-3 rounded-xl shadow-sm text-sm font-semibold transition-all border ${selectedMeds.includes('None')
                    ? 'bg-green-500/15 border-green-500 text-green-700 dark:text-green-400'
                    : 'bg-background border-border hover:border-green-500/40'
                    }`}
            >
                {selectedMeds.includes('None') ? '✓ ' : ''}
                <span className="whitespace-normal">None / Not Needed</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1 opacity-100 transition-opacity" style={{ opacity: selectedMeds.includes('None') ? 0.3 : 1, pointerEvents: selectedMeds.includes('None') ? 'none' : 'auto' }}>
                {commonMeds.map(med => (
                    <button
                        key={med}
                        onClick={() => handleToggle(med)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all border ${selectedMeds.includes(med)
                            ? 'bg-primary/15 border-primary text-primary'
                            : 'bg-background border-border hover:border-primary/40'
                            }`}
                    >
                        {selectedMeds.includes(med) ? '✓ ' : ''}{med}
                    </button>
                ))}
            </div>
            <div className="text-left" style={{ opacity: selectedMeds.includes('None') ? 0.3 : 1, pointerEvents: selectedMeds.includes('None') ? 'none' : 'auto' }}>
                <label className="block text-sm font-medium mb-1.5">Add another</label>
                <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Type a medication name..."
                    value={customMed}
                    onChange={e => onCustomMedChange(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && customMed.trim()) {
                            onToggle(customMed.trim());
                            onCustomMedChange('');
                        }
                    }}
                />
                <p className="text-xs text-muted-foreground mt-1">Press enter to add</p>
            </div>
        </div>
    );
};

// Step 3: Goals
const StepGoals: React.FC<{
    selectedGoals: string[];
    onToggle: (goal: string) => void;
    waterGoal: number;
    onWaterGoalChange: (val: number) => void;
}> = ({ selectedGoals, onToggle, waterGoal, onWaterGoalChange }) => {
    const goals = [
        { id: 'lower_bp', label: 'Lower blood pressure', icon: '❤️' },
        { id: 'manage_sugar', label: 'Manage blood sugar', icon: '🩸' },
        { id: 'lose_weight', label: 'Lose weight', icon: '⚖️' },
        { id: 'stay_hydrated', label: 'Stay hydrated', icon: '💧' },
        { id: 'better_sleep', label: 'Sleep better', icon: '🌙' },
        { id: 'reduce_stress', label: 'Reduce stress', icon: '🧘' },
        { id: 'eat_healthy', label: 'Eat healthier', icon: '🥗' },
        { id: 'exercise_more', label: 'Exercise regularly', icon: '🏃' },
    ];
    return (
        <div className="space-y-6">
            <div className="text-center mb-2">
                <div className="text-5xl mb-3">🎯</div>
                <h2 className="text-2xl font-bold font-heading">Your Health Goals</h2>
                <p className="text-muted-foreground mt-1">What would you like to achieve?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {goals.map(g => (
                    <button
                        key={g.id}
                        onClick={() => onToggle(g.id)}
                        className={`flex items-start gap-2 h-auto px-4 py-3 rounded-xl text-sm font-medium transition-all border ${selectedGoals.includes(g.id)
                            ? 'bg-primary/15 border-primary text-primary'
                            : 'bg-background border-border hover:border-primary/40'
                            }`}
                    >
                        <span className="shrink-0">{g.icon}</span>
                        <span className="text-left leading-snug whitespace-normal break-words">{g.label}</span>
                    </button>
                ))}
            </div>
            <div className="text-left mt-6">
                <label className="block text-sm font-medium mb-1.5">Daily Water Goal (glasses)</label>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="4"
                        max="16"
                        value={waterGoal}
                        onChange={e => onWaterGoalChange(Number(e.target.value))}
                        className="flex-1 accent-primary cursor-pointer"
                    />
                    <span className="text-2xl font-bold text-primary w-12 text-center">{waterGoal}</span>
                </div>
            </div>
        </div>
    );
};

// Step 4: Completion
const StepComplete: React.FC = () => (
    <div className="text-center space-y-6">
        <div className="text-7xl mb-4">🚀</div>
        <h2 className="text-3xl font-bold font-heading">
            Your Profile is Ready!
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
            Create a free account to save your profile, access AI insights, and unlock the full DocuMedic experience.
        </p>
        <div className="bg-accent/10 rounded-xl p-4 flex flex-col items-center gap-3 border border-accent/20">
            <span className="text-sm font-semibold text-accent">We've securely temporarily saved your choices.</span>
            <span className="text-xs text-muted-foreground">Sign up now so you don't lose them!</span>
        </div>
    </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PENDING_ONBOARDING_KEY = 'pending_onboarding_data';

const LandingOnboardingWizard: React.FC = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(1);

    // Form state
    const [profileData, setProfileData] = useState<Record<string, string>>({});
    const [selectedMeds, setSelectedMeds] = useState<string[]>([]);
    const [customMed, setCustomMed] = useState('');
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    const [waterGoal, setWaterGoal] = useState(8);

    const totalSteps = 5; // 0-4

    useEffect(() => {
        // Always show for unauthenticated users when landing page loads
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleProfileChange = useCallback((key: string, val: string) => {
        setProfileData(prev => ({ ...prev, [key]: val }));
    }, []);

    const toggleMed = useCallback((med: string) => {
        setSelectedMeds(prev => {
            if (med === 'None') {
                return prev.includes('None') ? [] : ['None'];
            }
            // If they select a real medicine, make sure 'None' is removed
            const withoutNone = prev.filter(m => m !== 'None');
            return withoutNone.includes(med)
                ? withoutNone.filter(m => m !== med)
                : [...withoutNone, med];
        });
    }, []);

    const toggleGoal = useCallback((goal: string) => {
        setSelectedGoals(prev =>
            prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
        );
    }, []);

    const goNext = useCallback(() => {
        if (currentStep < totalSteps - 1) {
            setDirection(1);
            setCurrentStep(prev => prev + 1);
        }
    }, [currentStep, totalSteps]);

    const goBack = useCallback(() => {
        if (currentStep > 0) {
            setDirection(-1);
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const handleSkip = useCallback(() => {
        setIsVisible(false);
    }, []);

    const handleComplete = useCallback(() => {
        // 1. Save collected data to pending state
        const pendingData = {
            profile: {
                age: profileData.age,
                bloodType: profileData.bloodType,
                conditions: profileData.conditions,
                goals: selectedGoals.join(', '),
                waterGoal: waterGoal,
            },
            vitals: {
                sugar: profileData.sugar ? Number(profileData.sugar) : undefined,
                systolic: profileData.systolic ? Number(profileData.systolic) : undefined,
                diastolic: profileData.diastolic ? Number(profileData.diastolic) : undefined,
            },
            medications: selectedMeds
        };
        localStorage.setItem(PENDING_ONBOARDING_KEY, JSON.stringify(pendingData));

        // 3. Close wizard and navigate to login/signup
        setIsVisible(false);
        navigate('/login');
    }, [profileData, selectedGoals, waterGoal, selectedMeds, navigate]);

    if (!isVisible) return null;

    const renderStep = () => {
        switch (currentStep) {
            case 0: return <StepWelcome />;
            case 1: return <StepProfile data={profileData} onChange={handleProfileChange} />;
            case 2: return <StepMedications selectedMeds={selectedMeds} onToggle={toggleMed} customMed={customMed} onCustomMedChange={setCustomMed} />;
            case 3: return <StepGoals selectedGoals={selectedGoals} onToggle={toggleGoal} waterGoal={waterGoal} onWaterGoalChange={setWaterGoal} />;
            case 4: return <StepComplete />;
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 wizard-backdrop bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="relative w-full max-w-lg glass-card rounded-3xl shadow-2xl overflow-hidden bg-background/95 max-h-[90vh] flex flex-col"
            >
                {/* Gradient top bar */}
                <div className="h-2 gradient-primary w-full shrink-0" />

                <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
                    <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

                    <div className="min-h-[300px] flex items-center justify-center relative overflow-x-hidden pt-2 pb-4">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={currentStep}
                                custom={direction}
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="w-full relative"
                            >
                                {renderStep()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Actions */}
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/50">
                        <button
                            onClick={handleSkip}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                        >
                            Skip Setup
                        </button>
                        <div className="flex gap-3">
                            {currentStep > 0 && currentStep < 4 && (
                                <button
                                    onClick={goBack}
                                    className="px-4 sm:px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-all"
                                >
                                    ← Back
                                </button>
                            )}
                            {currentStep < 4 ? (
                                <button
                                    onClick={goNext}
                                    className="px-5 sm:px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg hover:shadow-primary/25 transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2 outline-none"
                                >
                                    Continue →
                                </button>
                            ) : (
                                <button
                                    onClick={handleComplete}
                                    className="px-5 sm:px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center gap-2"
                                >
                                    <span>Sign Up / Log In</span>
                                    <span>→</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LandingOnboardingWizard;
