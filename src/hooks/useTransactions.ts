import { useState, useCallback, useEffect } from 'react';
import type { Transaction } from '../types';
import { SEED_TRANSACTIONS } from '../lib/seed';
import { StorageEngine } from '../lib/db';

const STORAGE_KEY = 'miplata_transactions';

function loadInitialSync(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Transaction[];
  } catch {
    // Ignore
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TRANSACTIONS));
  return SEED_TRANSACTIONS;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(loadInitialSync);
  const [isLoading, setIsLoading] = useState(true);

  // Sync with IndexedDB on mount
  useEffect(() => {
    let isMounted = true;
    StorageEngine.getAll().then((data) => {
      if (isMounted && data && data.length > 0) {
        setTransactions(data);
      }
      if (isMounted) setIsLoading(false);
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const addTransaction = useCallback(
    (tx: Omit<Transaction, 'id' | 'created_at'>): Transaction => {
      const newTx: Transaction = {
        ...tx,
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        created_at: new Date().toISOString(),
      };

      setTransactions((prev) => {
        const updated = [newTx, ...prev];
        StorageEngine.saveAll(updated);
        return updated;
      });

      return newTx;
    },
    []
  );

  const updateTransaction = useCallback(
    (id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at'>>) => {
      setTransactions((prev) => {
        const updated = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
        StorageEngine.saveAll(updated);
        return updated;
      });
    },
    []
  );

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      StorageEngine.saveAll(updated);
      return updated;
    });
  }, []);

  return { transactions, addTransaction, updateTransaction, deleteTransaction, isLoading };
}
