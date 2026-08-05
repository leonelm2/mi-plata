import { supabase } from './client';
import type { Goal } from '../../types';

export const GoalsService = {
  async getAll(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Goals table notice:', error.message);
      return [];
    }
    return (data || []) as Goal[];
  },

  async add(userId: string, goal: Omit<Goal, 'id'>): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        nombre: goal.nombre,
        monto_objetivo: goal.monto_objetivo,
        monto_actual: goal.monto_actual || 0,
        emoji: goal.emoji || '🎯',
        fecha_limite: goal.fecha_limite,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Goal;
  },

  async update(id: string, updates: Partial<Goal>): Promise<void> {
    const { error } = await supabase.from('goals').update(updates).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) throw error;
  },
};
