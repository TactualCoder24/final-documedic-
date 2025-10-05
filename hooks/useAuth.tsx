
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { auth } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
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

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      await auth.signInWithGoogle();
      // onAuthStateChanged will set the user and set loading to false on success.
    } catch (error) {
      console.error("Error signing in with Google", error);
      // If sign-in fails, we need to ensure loading is set to false.
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await auth.signOut();
      // onAuthStateChanged will set user to null.
    } catch (error) {
      console.error("Error signing out", error);
    }
  }, []);

  const value = { user, loading, signInWithGoogle, signOut };

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
