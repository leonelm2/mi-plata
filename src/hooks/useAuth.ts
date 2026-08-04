import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/supabase/auth';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    AuthService.getSession().then((sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    // Listen to real-time auth changes (Sign In, Sign Out, Token Refresh)
    const { data: listener } = AuthService.onAuthStateChange((currUser, currSession) => {
      setUser(currUser);
      setSession(currSession);
      setIsLoading(false);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await AuthService.signIn(email, pass);
      setUser(data.user);
      setSession(data.session);
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, pass: string, nombre?: string) => {
    setIsLoading(true);
    try {
      const data = await AuthService.signUp(email, pass, nombre);
      setUser(data.user);
      setSession(data.session);
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await AuthService.signOut();
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    return await AuthService.resetPassword(email);
  }, []);

  return {
    isAuthenticated: !!user,
    userId: user?.id ?? null,
    userEmail: user?.email ?? null,
    user,
    session,
    isLoading,
    login,
    register,
    logout,
    resetPassword,
  };
}
