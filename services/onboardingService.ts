import { supabase } from './supabase';
import { OnboardingState } from '../hooks/useOnboarding';

// ============================================================================
// ONBOARDING STATE — SUPABASE PERSISTENCE
// ============================================================================

/**
 * Fetches the user's onboarding state from Supabase.
 * Returns null if no state exists yet (first login on this device).
 */
export const getOnboardingState = async (userId: string): Promise<OnboardingState | null> => {
    const { data, error } = await supabase
        .from('onboarding_state')
        .select('state')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching onboarding state:', error);
        return null;
    }

    return data?.state || null;
};

/**
 * Saves (upserts) the user's onboarding state to Supabase.
 * Called on every state change to keep Supabase in sync.
 */
export const saveOnboardingState = async (userId: string, state: OnboardingState): Promise<void> => {
    const { error } = await supabase
        .from('onboarding_state')
        .upsert(
            {
                user_id: userId,
                state: state,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
        );

    if (error) {
        console.error('Error saving onboarding state:', error);
        // Don't throw — onboarding should work even if Supabase save fails
    }
};
