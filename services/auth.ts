import { User } from '../types';
import { supabase } from './supabase';

let currentUser: User | null = null;
const listeners: ((user: User | null) => void)[] = [];

// Initialize auth state from Supabase session
const initializeAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
        currentUser = {
            uid: session.user.id,
            email: session.user.email || null,
            displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || null,
            photoURL: session.user.user_metadata?.avatar_url || null,
        };
    }
    notifyListeners();
};

// Listen for auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
        currentUser = {
            uid: session.user.id,
            email: session.user.email || null,
            displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || null,
            photoURL: session.user.user_metadata?.avatar_url || null,
        };
    } else {
        currentUser = null;
    }
    notifyListeners();
});

// Initialize on module load
initializeAuth();

const notifyListeners = () => {
    listeners.forEach(listener => listener(currentUser));
};

// --- Main Auth Service ---
export const auth = {
    onAuthStateChanged: (listener: (user: User | null) => void) => {
        listeners.push(listener);
        // Immediately call with current state
        setTimeout(() => listener(currentUser), 0);

        return () => {
            const index = listeners.indexOf(listener);
            if (index > -1) listeners.splice(index, 1);
        };
    },

    signInWithGoogle: async (): Promise<User> => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/`,
            },
        });

        if (error) {
            throw new Error(error.message);
        }

        // OAuth redirects to Google, then back to our app
        // The user will be set via onAuthStateChange after redirect
        // Return a placeholder - actual user will be set by auth state listener
        return currentUser || {
            uid: '',
            email: null,
            displayName: null,
            photoURL: null,
        };
    },

    signUpWithEmailPassword: async (email: string, password: string): Promise<User> => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: email.split('@')[0],
                },
            },
        });

        if (error) {
            throw new Error(error.message);
        }

        if (!data.user) {
            throw new Error('Failed to create user account.');
        }

        // Check if email confirmation is required
        if (data.user && !data.session) {
            throw new Error('Account created! Please check your email to confirm your account before signing in.');
        }

        // If we have a session, user is auto-logged in (email confirmation disabled)
        const user: User = {
            uid: data.user.id,
            email: data.user.email || null,
            displayName: data.user.user_metadata?.full_name || email.split('@')[0],
            photoURL: null,
        };

        return user;
    },

    signInWithEmailPassword: async (email: string, password: string): Promise<User> => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw new Error(error.message);
        }

        if (!data.user) {
            throw new Error('Invalid email or password.');
        }

        const user: User = {
            uid: data.user.id,
            email: data.user.email || null,
            displayName: data.user.user_metadata?.full_name || email.split('@')[0],
            photoURL: data.user.user_metadata?.avatar_url || null,
        };

        return user;
    },

    signOut: async (): Promise<void> => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw new Error(error.message);
        }
        currentUser = null;
        notifyListeners();
    },
};
