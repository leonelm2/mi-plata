import { useState, useEffect } from 'react';

const STORAGE_KEY = 'miplata_auth';

interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
}

function getInitialAuth(): AuthState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.isAuthenticated === 'boolean') {
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  return { isAuthenticated: false, userEmail: null };
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(getInitialAuth);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  }, [auth]);

  const login = (email: string) => {
    setAuth({ isAuthenticated: true, userEmail: email });
  };

  const logout = () => {
    setAuth({ isAuthenticated: false, userEmail: null });
  };

  return {
    isAuthenticated: auth.isAuthenticated,
    userEmail: auth.userEmail,
    login,
    logout,
  };
}
