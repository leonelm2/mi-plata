import type { Transaction } from '../types';

// ── Dates relative to August 2026 ────────────────────────────────────────────
const T = (date: string, tipo: Transaction['tipo'], importe: number, categoria: Transaction['categoria'], descripcion: string): Transaction => ({
  id: crypto.randomUUID(),
  tipo,
  importe,
  categoria,
  descripcion,
  fecha: date,
  created_at: new Date().toISOString(),
});

export const SEED_TRANSACTIONS: Transaction[] = [
  // ── Julio 2026 ────────────────────────────────────────────────────────────
  T('2026-07-01', 'ingreso', 850000, 'sueldo',      'Sueldo julio'),
  T('2026-07-02', 'gasto',   12500,  'comida',      'Almuerzo con compañeros'),
  T('2026-07-03', 'gasto',   8400,   'transporte',  'SUBE - carga semanal'),
  T('2026-07-05', 'gasto',   35000,  'hogar',       'Gas - factura mensual'),
  T('2026-07-07', 'gasto',   22000,  'compras',     'Ropa - zapatillas'),
  T('2026-07-09', 'gasto',   6800,   'comida',      'Supermercado Día'),
  T('2026-07-10', 'gasto',   15000,  'ocio',        'Netflix + Spotify'),
  T('2026-07-12', 'gasto',   9200,   'salud',       'Farmacia'),
  T('2026-07-14', 'ingreso', 120000, 'freelance',   'Proyecto diseño web'),
  T('2026-07-15', 'gasto',   48000,  'hogar',       'Alquiler - parte proporcional'),
  T('2026-07-16', 'gasto',   11300,  'comida',      'Pizzería El Cuartito'),
  T('2026-07-18', 'gasto',   5500,   'transporte',  'Taxi aeropuerto'),
  T('2026-07-20', 'gasto',   18000,  'servicios',   'Internet - Fibertel'),
  T('2026-07-22', 'gasto',   7600,   'comida',      'Mercado Libre - especias'),
  T('2026-07-23', 'gasto',   45000,  'viajes',      'Fin de semana en Bariloche'),
  T('2026-07-25', 'gasto',   3200,   'mascotas',    'Alimento perro'),
  T('2026-07-26', 'gasto',   12000,  'educacion',   'Curso Udemy'),
  T('2026-07-28', 'gasto',   9800,   'compras',     'Librería - cuadernos'),
  T('2026-07-29', 'ingreso', 25000,  'inversiones', 'Rendimiento plazo fijo'),
  T('2026-07-30', 'gasto',   6000,   'ocio',        'Entradas cine'),

  // ── Agosto 2026 ───────────────────────────────────────────────────────────
  T('2026-08-01', 'ingreso', 850000, 'sueldo',      'Sueldo agosto'),
  T('2026-08-01', 'gasto',   48000,  'hogar',       'Alquiler agosto'),
  T('2026-08-01', 'gasto',   18000,  'servicios',   'Internet agosto'),
  T('2026-08-02', 'gasto',   14200,  'comida',      'Supermercado Coto'),
  T('2026-08-02', 'gasto',   8400,   'transporte',  'SUBE - carga'),
  T('2026-08-03', 'gasto',   9500,   'comida',      'Almuerzo en el trabajo'),
];

export const SEED_PROFILE = {
  nombre: 'Santiago García',
  email: 'santi@miplata.app',
  foto_url: '',
  moneda: 'ARS',
};
