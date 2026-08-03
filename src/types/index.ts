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

export type AppMode = 'presupuesto' | 'movimientos';

export interface Profile {
  nombre: string;
  email: string;
  foto_url: string;
  moneda: string;
  modo_uso?: AppMode;
  presupuesto_inicial?: number;
  fecha_inicio_presupuesto?: string;
  dia_reinicio_presupuesto?: number;
  onboarding_completado?: boolean;
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
