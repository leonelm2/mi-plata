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

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'banco' | 'mercado_pago';

export interface Transaction {
  id: string;
  tipo: TransactionType;
  importe: number;
  categoria: Category;
  descripcion: string;
  fecha: string;
  metodo_pago?: PaymentMethod;
  es_recurrente?: boolean;
  created_at: string;
}

export interface Goal {
  id: string;
  nombre: string;
  monto_objetivo: number;
  monto_actual: number;
  emoji: string;
  fecha_limite?: string;
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
  objetivo_nombre?: string;
  objetivo_monto?: number;
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
