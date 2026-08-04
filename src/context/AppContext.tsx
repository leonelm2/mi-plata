import { createContext, useContext } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useProfile } from '../hooks/useProfile';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import type { Transaction, Profile } from '../types';

interface AppContextType {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'created_at'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at'>>) => void;
  deleteTransaction: (id: string) => void;
  profile: Profile;
  updateProfile: (updates: Partial<Profile>) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (email: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, isLoading } = useTransactions();
  const { profile, updateProfile } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, userEmail, login, logout } = useAuth();

  return (
    <AppContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        profile,
        updateProfile,
        theme,
        toggleTheme,
        isAuthenticated,
        userEmail,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
