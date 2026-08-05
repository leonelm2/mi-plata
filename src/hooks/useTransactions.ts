import { useState, useCallback, useEffect } from 'react';
import type { Transaction } from '../types';
import { TransactionService } from '../services/supabase/transactions';
import { MigrationService } from '../services/supabase/migration';

export function useTransactions(userId: string | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync with Supabase on userId change & run initial migration from IndexedDB
  useEffect(() => {
    if (!userId) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    (async () => {
      try {
        // Run migration from legacy local DB if first login
        await MigrationService.migrateIfNeeded(userId);
        const data = await TransactionService.getAll(userId);
        if (isMounted) {
          setTransactions(data);
        }
      } catch (err) {
        console.error('Error fetching transactions from Supabase:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const addTransaction = useCallback(
    async (tx: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> => {
      // Optimistic UI update
      const tempId = `temp_${Date.now()}`;
      const tempTx: Transaction = {
        ...tx,
        id: tempId,
        created_at: new Date().toISOString(),
      };

      setTransactions((prev) => [tempTx, ...prev]);

      if (userId) {
        try {
          const realTx = await TransactionService.add(userId, tx);
          setTransactions((prev) => prev.map((t) => (t.id === tempId ? realTx : t)));
          return realTx;
        } catch (e) {
          // Rollback on error
          setTransactions((prev) => prev.filter((t) => t.id !== tempId));
          throw e;
        }
      }
      return tempTx;
    },
    [userId]
  );

  const updateTransaction = useCallback(
    async (id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at'>>) => {
      setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
      if (userId) {
        try {
          await TransactionService.update(id, updates);
        } catch (e) {
          console.error('Error updating transaction on Supabase:', e);
        }
      }
    },
    [userId]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      if (userId) {
        try {
          await TransactionService.delete(id);
        } catch (e) {
          console.error('Error deleting transaction on Supabase:', e);
        }
      }
    },
    [userId]
  );

  return { transactions, addTransaction, updateTransaction, deleteTransaction, isLoading };
}
