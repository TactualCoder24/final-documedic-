import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding, checklistTasks } from '../../hooks/useOnboarding';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// ONBOARDING CHECKLIST (Floating Widget)
// ============================================================================

const OnboardingChecklist: React.FC = () => {
    const {
        state,
        isTaskCompleted,
        toggleChecklist,
        dismissChecklist,
        getCompletionPercentage,
    } = useOnboarding();
    const navigate = useNavigate();

    const percentage = getCompletionPercentage();
    const coreTasks = checklistTasks.filter(t => !t.bonus);
    const bonusTasks = checklistTasks.filter(t => t.bonus);
    const remainingCount = coreTasks.filter(t => !isTaskCompleted(t.id)).length;

    // Hide conditions
    const shouldHide = useMemo(() => {
        if (state.checklistDismissed) return true;
        if (!state.welcomeCompleted) return true;
        if (state.tourActive) return true;
        // Hide after 7 days if 100%
        if (percentage === 100) {
            const firstLogin = state.firstLoginDate ? new Date(state.firstLoginDate) : new Date();
            const daysSince = (Date.now() - firstLogin.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSince > 7) return true;
        }
        return false;
    }, [state.checklistDismissed, state.welcomeCompleted, state.tourActive, state.firstLoginDate, percentage]);

    if (shouldHide) return null;

    // Find next incomplete task for CTA
    const nextTask = coreTasks.find(t => !isTaskCompleted(t.id));

    // Minimized state
    if (state.checklistMinimized) {
        return (
            <motion.button
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={toggleChecklist}
                className="fixed bottom-6 right-6 z-[100] glass-card rounded-2xl shadow-xl px-5 py-3 flex items-center gap-3 hover:shadow-2xl transition-shadow cursor-pointer border border-primary/20"
            >
                <div className="relative w-10 h-10">
                    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                        <circle
                            cx="18" cy="18" r="16" fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="3"
                            strokeDasharray={`${percentage} 100`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                        {percentage}%
                    </span>
                </div>
                <div className="text-left">
                    <p className="text-xs font-semibold">{remainingCount} tasks left</p>
                    <p className="text-[10px] text-muted-foreground">Click to expand</p>
                </div>
            </motion.button>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="fixed bottom-6 right-6 z-[100] glass-card rounded-2xl shadow-2xl w-80 overflow-hidden checklist-enter border border-border/60"
            >
                {/* Header */}
                <div className="px-5 pt-5 pb-3">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold font-heading flex items-center gap-2">
                            🚀 Get Started with DocuMedic
                        </h3>
                        <button
                            onClick={toggleChecklist}
                            className="text-muted-foreground hover:text-foreground transition-colors text-xs font-medium"
                        >
                            ▼
                        </button>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <motion.div
                                className="h-full rounded-full gradient-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                            />
                        </div>
                        <span className="text-xs font-bold text-primary">{percentage}%</span>
                    </div>
                </div>

                {/* Task List */}
                <div className="px-5 pb-2 max-h-[280px] overflow-y-auto custom-scrollbar">
                    <div className="space-y-1.5">
                        {coreTasks.map(task => {
                            const completed = isTaskCompleted(task.id);
                            return (
                                <button
                                    key={task.id}
                                    onClick={() => !completed && navigate(task.route)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-sm ${completed
                                            ? 'text-muted-foreground'
                                            : 'hover:bg-primary/5 cursor-pointer'
                                        }`}
                                    disabled={completed}
                                >
                                    <span className={`text-base ${completed ? 'check-bounce' : ''}`}>
                                        {completed ? '✅' : '☐'}
                                    </span>
                                    <span className={`font-medium ${completed ? 'line-through' : ''}`}>
                                        {task.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Bonus section */}
                    <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground font-semibold mb-2 px-3">── Bonus ──</p>
                        <div className="space-y-1.5">
                            {bonusTasks.map(task => {
                                const completed = isTaskCompleted(task.id);
                                return (
                                    <button
                                        key={task.id}
                                        onClick={() => !completed && navigate(task.route)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-sm ${completed
                                                ? 'text-muted-foreground'
                                                : 'hover:bg-primary/5 cursor-pointer'
                                            }`}
                                        disabled={completed}
                                    >
                                        <span className={`text-base ${completed ? 'check-bounce' : ''}`}>
                                            {completed ? '✅' : '☐'}
                                        </span>
                                        <span className={`font-medium ${completed ? 'line-through' : ''}`}>
                                            {task.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-border/50 flex items-center justify-between">
                    {nextTask ? (
                        <button
                            onClick={() => navigate(nextTask.route)}
                            className="px-4 py-2 rounded-xl gradient-primary text-white text-xs font-semibold hover:opacity-90 transition-all shadow-sm shadow-primary/25"
                        >
                            Continue Setup →
                        </button>
                    ) : (
                        <span className="text-xs font-semibold text-green-500">🎉 You're a DocuMedic Pro!</span>
                    )}
                    <button
                        onClick={dismissChecklist}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                    >
                        Dismiss
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OnboardingChecklist;
