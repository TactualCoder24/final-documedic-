/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// These values should be set in your .env.local file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.'
    );
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
    return Boolean(supabaseUrl && supabaseAnonKey);
};

// Export types for TypeScript
export type { User, Session } from '@supabase/supabase-js';
