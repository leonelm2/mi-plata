import { useState, useCallback } from 'react';
import type { Transaction } from '../types';
import { SEED_TRANSACTIONS } from '../lib/seed';

const STORAGE_KEY = 'miplata_transactions';

function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Transaction[];
  } catch {
    // ignore
  }
  // First load: seed with demo data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TRANSACTIONS));
  return SEED_TRANSACTIONS;
}

function saveTransactions(transactions: Transaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);

  const persist = useCallback((updated: Transaction[]) => {
    saveTransactions(updated);
    setTransactions(updated);
  }, []);

  const addTransaction = useCallback(
    (tx: Omit<Transaction, 'id' | 'created_at'>) => {
      const newTx: Transaction = {
        ...tx,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      persist([newTx, ...transactions]);
      return newTx;
    },
    [transactions, persist]
  );

  const updateTransaction = useCallback(
    (id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at'>>) => {
      persist(transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    },
    [transactions, persist]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      persist(transactions.filter((t) => t.id !== id));
    },
    [transactions, persist]
  );

  return { transactions, addTransaction, updateTransaction, deleteTransaction };
}
