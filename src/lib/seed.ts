import type { Transaction } from '../types';

export const SEED_TRANSACTIONS: Transaction[] = [];

export const SEED_PROFILE = {
  nombre: 'Usuario',
  email: '',
  foto_url: '',
  moneda: 'ARS',
  modo_uso: 'presupuesto' as const,
  presupuesto_inicial: 0,
  fecha_inicio_presupuesto: new Date().toISOString().slice(0, 10),
  dia_reinicio_presupuesto: 1,
  onboarding_completado: false,
};
