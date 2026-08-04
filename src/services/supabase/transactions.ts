import { supabase } from './client';
import type { Transaction } from '../../types';

export const TransactionService = {
  async getAll(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    return (data || []) as Transaction[];
  },

  async add(userId: string, tx: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        tipo: tx.tipo,
        importe: tx.importe,
        categoria: tx.categoria,
        descripcion: tx.descripcion || '',
        fecha: tx.fecha,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }

    return data as Transaction;
  },

  async update(id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at'>>): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },
};
