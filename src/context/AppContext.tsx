import { createContext, useContext, useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useProfile } from '../hooks/useProfile';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import type { Transaction, Profile } from '../types';

interface AppContextType {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'created_at'>) => Promise<Transaction>;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteAllTransactions: () => Promise<void>;
  profile: Profile;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isAuthenticated: boolean;
  userEmail: string | null;
  userId: string | null;
  login: (email: string, pass: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  register: (email: string, pass: string, nombre?: string, moneda?: string) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  isLoading: boolean;
  isAddModalOpen: boolean;
  setAddModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, userId, userEmail, login, loginWithGoogle, register, logout, resetPassword, isLoading: authLoading } = useAuth();
  const { transactions, addTransaction, updateTransaction, deleteTransaction, deleteAllTransactions, isLoading: txLoading } = useTransactions(userId);
  const { profile, updateProfile, isLoading: profileLoading } = useProfile(userId);
  const { theme, toggleTheme } = useTheme();

  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const isLoading = authLoading || txLoading || profileLoading;

  return (
    <AppContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        deleteAllTransactions,
        profile,
        updateProfile,
        theme,
        toggleTheme,
        isAuthenticated,
        userEmail,
        userId,
        login,
        loginWithGoogle,
        register,
        logout,
        resetPassword,
        isLoading,
        isAddModalOpen,
        setAddModalOpen,
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
