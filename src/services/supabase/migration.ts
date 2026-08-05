import { TransactionService } from './transactions';
import type { Transaction } from '../../types';

const MIGRATED_KEY = 'miplata_supabase_migrated';
const LOCAL_STORAGE_KEY = 'miplata_transactions';

export const MigrationService = {
  async migrateIfNeeded(userId: string): Promise<boolean> {
    try {
      const alreadyMigrated = localStorage.getItem(`${MIGRATED_KEY}_${userId}`);
      if (alreadyMigrated === 'true') return false;

      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(`${MIGRATED_KEY}_${userId}`, 'true');
        return false;
      }

      const localTxs = JSON.parse(raw) as Transaction[];
      if (localTxs && localTxs.length > 0) {
        for (const tx of localTxs) {
          await TransactionService.add(userId, {
            tipo: tx.tipo,
            importe: tx.importe,
            categoria: tx.categoria,
            descripcion: tx.descripcion,
            fecha: tx.fecha,
          });
        }
      }

      // Mark migration as completed and clear legacy local storage
      localStorage.setItem(`${MIGRATED_KEY}_${userId}`, 'true');
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return true;
    } catch (e) {
      console.warn('Migration warning:', e);
      return false;
    }
  },
};
