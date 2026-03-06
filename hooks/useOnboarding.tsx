import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { getOnboardingState, saveOnboardingState } from '../services/onboardingService';

// ============================================================================
// TYPES
// ============================================================================

export interface OnboardingState {
    walkthroughVersion: number;
    welcomeCompleted: boolean;
    welcomeStep: number;
    tourCompleted: boolean;
    tourActive: boolean;
    tourStep: number;
    discoveredFeatures: string[];
    dismissedHints: string[];
    completedTasks: string[];
    checklistMinimized: boolean;
    checklistDismissed: boolean;
    showHints: boolean;
    firstLoginDate: string | null;
}

interface OnboardingContextType {
    state: OnboardingState;
    // Welcome Flow
    setWelcomeStep: (step: number) => void;
    completeWelcome: () => void;
    // Spotlight Tour
    startTour: () => void;
    nextTourStep: () => void;
    prevTourStep: () => void;
    endTour: () => void;
    setTourStep: (step: number) => void;
    // Feature Discovery
    discoverFeature: (featureId: string) => void;
    dismissHint: (hintId: string) => void;
    isFeatureDiscovered: (featureId: string) => boolean;
    isHintDismissed: (hintId: string) => boolean;
    // Checklist
    completeTask: (taskId: string) => void;
    isTaskCompleted: (taskId: string) => boolean;
    toggleChecklist: () => void;
    dismissChecklist: () => void;
    // General
    resetOnboarding: () => void;
    getCompletionPercentage: () => number;
}

const STORAGE_KEY = 'documedic_onboarding';

// Bump this version to force ALL users (new + existing) to see the walkthrough again
const WALKTHROUGH_VERSION = 1;

const defaultState: OnboardingState = {
    walkthroughVersion: WALKTHROUGH_VERSION,
    welcomeCompleted: false,
    welcomeStep: 0,
    tourCompleted: false,
    tourActive: false,
    tourStep: 0,
    discoveredFeatures: [],
    dismissedHints: [],
    completedTasks: ['create_account'], // Auto-completed since they're logged in
    checklistMinimized: false,
    checklistDismissed: false,
    showHints: true,
    firstLoginDate: null,
};

// ============================================================================
// CHECKLIST TASKS
// ============================================================================

export interface ChecklistTask {
    id: string;
    label: string;
    icon: string;
    route: string;
    bonus?: boolean;
}

export const checklistTasks: ChecklistTask[] = [
    { id: 'create_account', label: 'Create your account', icon: '✅', route: '/dashboard' },
    { id: 'setup_profile', label: 'Set up health profile', icon: '🏥', route: '/dashboard' },
    { id: 'upload_document', label: 'Upload first document', icon: '📄', route: '/documents' },
    { id: 'add_medication', label: 'Add your medications', icon: '💊', route: '/medications' },
    { id: 'log_vitals', label: 'Log your first vital signs', icon: '❤️', route: '/dashboard' },
    { id: 'emergency_contact', label: 'Set up emergency contacts', icon: '🆘', route: '/dashboard' },
    { id: 'ask_shakti', label: 'Try asking Shakti a question', icon: '🤖', route: '/dashboard' },
    { id: 'enable_reminders', label: 'Create a reminder', icon: '🔔', route: '/reminders' },
    // Bonus
    { id: 'invite_family', label: 'Invite a family member', icon: '👨‍👩‍👧', route: '/family-access', bonus: true },
    { id: 'community_post', label: 'Post in the community', icon: '💬', route: '/community', bonus: true },
];

// ============================================================================
// CONTEXT
// ============================================================================

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

function loadState(): OnboardingState {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // If version doesn't match, reset to force walkthrough for all users
            if (parsed.walkthroughVersion !== WALKTHROUGH_VERSION) {
                localStorage.removeItem(STORAGE_KEY);
                return { ...defaultState, firstLoginDate: new Date().toISOString() };
            }
            return { ...defaultState, ...parsed };
        }
    } catch (e) {
        console.warn('Failed to load onboarding state:', e);
    }
    return { ...defaultState, firstLoginDate: new Date().toISOString() };
}

function persistState(state: OnboardingState) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('Failed to persist onboarding state:', e);
    }
}

// ============================================================================
// PROVIDER
// ============================================================================

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<OnboardingState>(loadState);
    const { user } = useAuth();
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasLoadedFromSupabase = useRef(false);

    // On mount (or when user changes), try to load from Supabase
    useEffect(() => {
        if (!user?.uid || hasLoadedFromSupabase.current) return;

        const syncFromSupabase = async () => {
            try {
                const remoteState = await getOnboardingState(user.uid);
                if (remoteState) {
                    if (remoteState.walkthroughVersion !== WALKTHROUGH_VERSION) {
                        // The remote state is outdated. We must force a reset for existing users.
                        setState(prev => ({
                            ...defaultState,
                            firstLoginDate: new Date().toISOString(),
                            tourActive: prev.tourActive,
                            tourStep: prev.tourStep,
                        }));
                    } else {
                        // Merge: prefer remote data but keep local tourActive/tourStep as transient
                        setState(prev => ({
                            ...defaultState,
                            ...remoteState,
                            tourActive: prev.tourActive,
                            tourStep: prev.tourStep,
                        }));
                    }
                }
            } catch (e) {
                console.warn('Failed to sync onboarding from Supabase:', e);
            }
            hasLoadedFromSupabase.current = true;
        };

        syncFromSupabase();
    }, [user?.uid]);

    // Persist to localStorage immediately, and debounced save to Supabase
    useEffect(() => {
        persistState(state);

        // Debounced Supabase save (500ms)
        if (user?.uid) {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(() => {
                // Don't persist transient tour state to Supabase
                const persistableState = { ...state, tourActive: false };
                saveOnboardingState(user.uid, persistableState);
            }, 500);
        }

        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, [state, user?.uid]);

    const updateState = useCallback((updater: Partial<OnboardingState> | ((prev: OnboardingState) => Partial<OnboardingState>)) => {
        setState(prev => {
            const updates = typeof updater === 'function' ? updater(prev) : updater;
            return { ...prev, ...updates };
        });
    }, []);

    // Welcome Flow
    const setWelcomeStep = useCallback((step: number) => {
        updateState({ welcomeStep: step });
    }, [updateState]);

    const completeWelcome = useCallback(() => {
        updateState({ welcomeCompleted: true, welcomeStep: 5 });
    }, [updateState]);

    // Spotlight Tour
    const startTour = useCallback(() => {
        updateState({ tourActive: true, tourStep: 0 });
    }, [updateState]);

    const nextTourStep = useCallback(() => {
        updateState(prev => ({ tourStep: prev.tourStep + 1 }));
    }, [updateState]);

    const prevTourStep = useCallback(() => {
        updateState(prev => ({ tourStep: Math.max(0, prev.tourStep - 1) }));
    }, [updateState]);

    const endTour = useCallback(() => {
        updateState({ tourActive: false, tourCompleted: true });
    }, [updateState]);

    const setTourStep = useCallback((step: number) => {
        updateState({ tourStep: step });
    }, [updateState]);

    // Feature Discovery
    const discoverFeature = useCallback((featureId: string) => {
        updateState(prev => ({
            discoveredFeatures: prev.discoveredFeatures.includes(featureId)
                ? prev.discoveredFeatures
                : [...prev.discoveredFeatures, featureId],
        }));
    }, [updateState]);

    const dismissHint = useCallback((hintId: string) => {
        updateState(prev => ({
            dismissedHints: prev.dismissedHints.includes(hintId)
                ? prev.dismissedHints
                : [...prev.dismissedHints, hintId],
        }));
    }, [updateState]);

    const isFeatureDiscovered = useCallback((featureId: string) => {
        return state.discoveredFeatures.includes(featureId);
    }, [state.discoveredFeatures]);

    const isHintDismissed = useCallback((hintId: string) => {
        return state.dismissedHints.includes(hintId);
    }, [state.dismissedHints]);

    // Checklist
    const completeTask = useCallback((taskId: string) => {
        updateState(prev => ({
            completedTasks: prev.completedTasks.includes(taskId)
                ? prev.completedTasks
                : [...prev.completedTasks, taskId],
        }));
    }, [updateState]);

    const isTaskCompleted = useCallback((taskId: string) => {
        return state.completedTasks.includes(taskId);
    }, [state.completedTasks]);

    const toggleChecklist = useCallback(() => {
        updateState(prev => ({ checklistMinimized: !prev.checklistMinimized }));
    }, [updateState]);

    const dismissChecklist = useCallback(() => {
        updateState({ checklistDismissed: true });
    }, [updateState]);

    const getCompletionPercentage = useCallback(() => {
        const coreTasks = checklistTasks.filter(t => !t.bonus);
        const completed = coreTasks.filter(t => state.completedTasks.includes(t.id));
        return Math.round((completed.length / coreTasks.length) * 100);
    }, [state.completedTasks]);

    // Reset
    const resetOnboarding = useCallback(() => {
        const fresh = { ...defaultState, firstLoginDate: new Date().toISOString() };
        setState(fresh);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const value: OnboardingContextType = {
        state,
        setWelcomeStep,
        completeWelcome,
        startTour,
        nextTourStep,
        prevTourStep,
        endTour,
        setTourStep,
        discoverFeature,
        dismissHint,
        isFeatureDiscovered,
        isHintDismissed,
        completeTask,
        isTaskCompleted,
        toggleChecklist,
        dismissChecklist,
        resetOnboarding,
        getCompletionPercentage,
    };

    return (
        <OnboardingContext.Provider value={value}>
            {children}
        </OnboardingContext.Provider>
    );
};

// ============================================================================
// HOOK
// ============================================================================

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
};
