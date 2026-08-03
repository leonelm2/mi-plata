export type TransactionType = 'ingreso' | 'gasto';

export type ExpenseCategory =
  | 'comida'
  | 'transporte'
  | 'hogar'
  | 'compras'
  | 'ocio'
  | 'salud'
  | 'educacion'
  | 'servicios'
  | 'mascotas'
  | 'viajes'
  | 'otros_gasto';

export type IncomeCategory =
  | 'sueldo'
  | 'freelance'
  | 'inversiones'
  | 'regalos'
  | 'otros_ingreso';

export type Category = ExpenseCategory | IncomeCategory;

export interface Transaction {
  id: string;
  tipo: TransactionType;
  importe: number;
  categoria: Category;
  descripcion: string;
  fecha: string; // ISO date string YYYY-MM-DD
  created_at: string;
}

export interface Profile {
  nombre: string;
  email: string;
  foto_url: string;
  moneda: string;
}

export interface CategoryInfo {
  key: Category;
  label: string;
  emoji: string;
  color: string;
  tipo: TransactionType;
}

export interface MonthSummary {
  ingresos: number;
  gastos: number;
  balance: number;
  saldo: number;
}
