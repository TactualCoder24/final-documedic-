import { supabase } from './supabase';

export interface MentibotInteraction {
    id?: string;
    user_id: string;
    timestamp: string;
    mood_score?: number;
    sentiment_summary?: string;
    feature_used: string;
    notes?: string;
}

export interface MoodEntry {
    id?: string;
    user_id: string;
    date: string;
    mood_score: number;
    mood_label?: string;
    notes?: string;
}

export interface ExerciseProgress {
    id?: string;
    user_id: string;
    exercise_id: string;
    exercise_name: string;
    completed_at: string;
    duration_minutes?: number;
    effectiveness_rating?: number;
}

// Interactions
export const logInteraction = async (interaction: MentibotInteraction) => {
    const { data, error } = await supabase
        .from('mentibot_interactions')
        .insert([interaction])
        .select();

    if (error) throw error;
    return data?.[0];
};

export const getInteractions = async (userId: string) => {
    const { data, error } = await supabase
        .from('mentibot_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
};

// Mood History
export const logMood = async (entry: MoodEntry) => {
    const { data, error } = await supabase
        .from('mood_history')
        .upsert([entry], { onConflict: 'user_id,date' })
        .select();

    if (error) throw error;
    return data?.[0];
};

export const getMoodHistory = async (userId: string) => {
    const { data, error } = await supabase
        .from('mood_history')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) throw error;
    return data;
};

export const getLatestMood = async (userId: string) => {
    const { data, error } = await supabase
        .from('mood_history')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(1);

    if (error) throw error;
    return data?.[0];
};

// Exercise Progress
export const logExerciseProgress = async (progress: ExerciseProgress) => {
    const { data, error } = await supabase
        .from('exercise_progress')
        .insert([progress])
        .select();

    if (error) throw error;
    return data?.[0];
};

export const getExerciseHistory = async (userId: string) => {
    const { data, error } = await supabase
        .from('exercise_progress')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

    if (error) throw error;
    return data;
};
