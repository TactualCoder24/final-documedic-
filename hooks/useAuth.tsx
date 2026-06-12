import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { auth } from '../services/auth';
import { getProfile, saveProfile } from '../services/dataSupabase';
import { getAppLanguage, setAppLanguage } from '../components/AutoTranslator';

type UserRole = 'patient' | 'doctor' | 'clinic' | null;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: UserRole;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmailPassword: (email: string, password: string) => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUserRole: (role: 'patient' | 'doctor' | 'clinic') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRoleState] = useState<UserRole>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const profile = await getProfile(firebaseUser.uid);
          let updated = false;
          const updates = { ...profile };

          // Apply a role selected during login/signup before the user object was available
          const pendingRole = sessionStorage.getItem('pendingRole') as UserRole;
          if (pendingRole && pendingRole !== profile?.role) {
            updates.role = pendingRole;
            updated = true;
          }
          sessionStorage.removeItem('pendingRole');

          // Set role from profile (or the pending role just applied above)
          if (updates.role) {
            setUserRoleState(updates.role as UserRole);
          }

          // Sync Language on Login
          const storedLang = getAppLanguage();
          if (profile?.language && profile.language !== storedLang) {
            setAppLanguage(profile.language);
          } else if (storedLang !== 'English' && !profile?.language) {
            updates.language = storedLang;
            updated = true;
          }

          if (!profile?.name && firebaseUser.displayName) {
            updates.name = firebaseUser.displayName;
            updated = true;
          }

          if (updated) {
            await saveProfile(firebaseUser.uid, updates);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setUserRoleState(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const setUserRole = useCallback(async (role: 'patient' | 'doctor' | 'clinic') => {
    if (!user) return;
    try {
      const profile = await getProfile(user.uid);
      await saveProfile(user.uid, { ...profile, role });
      setUserRoleState(role);
    } catch (err) {
      console.error('Error saving role:', err);
      throw err;
    }
  }, [user]);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      await auth.signInWithGoogle();
    } catch (error) {
      console.error("Error signing in with Google", error);
      setLoading(false);
      throw error; // Re-throw to be caught in UI
    }
  }, []);

  const signUpWithEmailPassword = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      await auth.signUpWithEmailPassword(email, password);
    } catch (error) {
      console.error("Error signing up with email", error);
      setLoading(false);
      throw error;
    }
  }, []);

  const signInWithEmailPassword = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      await auth.signInWithEmailPassword(email, password);
    } catch (error) {
      console.error("Error signing in with email", error);
      setLoading(false);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await auth.signOut();
      sessionStorage.removeItem('pendingRole');
      setUserRoleState(null);
    } catch (error) {
      console.error("Error signing out", error);
    }
  }, []);

  const value = { user, loading, userRole, signInWithGoogle, signUpWithEmailPassword, signInWithEmailPassword, signOut, setUserRole };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
