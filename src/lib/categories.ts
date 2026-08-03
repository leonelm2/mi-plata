import type { CategoryInfo } from '../types';

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { key: 'comida',      label: 'Comida',      emoji: '🍔', color: '#f97316', tipo: 'gasto' },
  { key: 'transporte',  label: 'Transporte',  emoji: '🚗', color: '#3b82f6', tipo: 'gasto' },
  { key: 'hogar',       label: 'Hogar',       emoji: '🏠', color: '#8b5cf6', tipo: 'gasto' },
  { key: 'compras',     label: 'Compras',     emoji: '🛒', color: '#ec4899', tipo: 'gasto' },
  { key: 'ocio',        label: 'Ocio',        emoji: '🎮', color: '#06b6d4', tipo: 'gasto' },
  { key: 'salud',       label: 'Salud',       emoji: '💊', color: '#ef4444', tipo: 'gasto' },
  { key: 'educacion',   label: 'Educación',   emoji: '📚', color: '#10b981', tipo: 'gasto' },
  { key: 'servicios',   label: 'Servicios',   emoji: '💡', color: '#f59e0b', tipo: 'gasto' },
  { key: 'mascotas',    label: 'Mascotas',    emoji: '🐶', color: '#84cc16', tipo: 'gasto' },
  { key: 'viajes',      label: 'Viajes',      emoji: '✈️', color: '#14b8a6', tipo: 'gasto' },
  { key: 'otros_gasto', label: 'Otros',       emoji: '📦', color: '#94a3b8', tipo: 'gasto' },
];

export const INCOME_CATEGORIES: CategoryInfo[] = [
  { key: 'sueldo',        label: 'Sueldo',      emoji: '💼', color: '#22c55e', tipo: 'ingreso' },
  { key: 'freelance',     label: 'Freelance',   emoji: '💻', color: '#6366f1', tipo: 'ingreso' },
  { key: 'inversiones',   label: 'Inversiones', emoji: '📈', color: '#0ea5e9', tipo: 'ingreso' },
  { key: 'regalos',       label: 'Regalos',     emoji: '🎁', color: '#f43f5e', tipo: 'ingreso' },
  { key: 'otros_ingreso', label: 'Otros',       emoji: '💰', color: '#a78bfa', tipo: 'ingreso' },
];

export const ALL_CATEGORIES: CategoryInfo[] = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryInfo(key: string): CategoryInfo {
  return (
    ALL_CATEGORIES.find((c) => c.key === key) ?? {
      key: 'otros_gasto',
      label: 'Otros',
      emoji: '📦',
      color: '#94a3b8',
      tipo: 'gasto',
    }
  );
}
