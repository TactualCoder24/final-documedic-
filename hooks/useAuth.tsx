import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { auth } from '../services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmailPassword: (email: string, password: string) => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
    } catch (error) {
      console.error("Error signing out", error);
    }
  }, []);

  const value = { user, loading, signInWithGoogle, signUpWithEmailPassword, signInWithEmailPassword, signOut };

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
