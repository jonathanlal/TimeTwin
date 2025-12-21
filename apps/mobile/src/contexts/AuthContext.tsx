import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initSupabase, onAuthStateChange, getCurrentUser, signOut as apiSignOut } from '@timetwin/api-sdk';
import type { User, Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env } from '../config/env';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Supabase client
    try {
      initSupabase(env.supabase.url, env.supabase.anonKey, {
        storage: AsyncStorage,
        detectSessionInUrl: false,
      });
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
      setLoading(false);
      return;
    }

    // Get initial session
    getCurrentUser()
      .then(({ user: currentUser }) => {
        setUser(currentUser);
      })
      .catch((error) => {
        console.error('Failed to get current user:', error);
      })
      .finally(() => {
        setLoading(false);
      });

    // Listen to auth state changes
    const { unsubscribe } = onAuthStateChange((event, currentSession) => {
      console.log('Auth state changed:', event);
      setSession(currentSession);
      setUser(currentSession?.user || null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await apiSignOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Failed to sign out:', error);
      throw error;
    }
  };

  const value: AuthContextValue = {
    user,
    session,
    loading,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
