import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Wallet, ArrowUpRight, ArrowDownRight, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import { useApp } from '../context/AppContext';
import {
  formatCurrency, formatDateShort,
  currentYearMonth, previousYearMonth
} from '../lib/formatters';
import { getCategoryInfo } from '../lib/categories';
import type { Transaction } from '../types';

// ── helpers ──────────────────────────────────────────────────────────────────

function calcMonthSummary(txs: Transaction[], ym: string) {
  return txs
    .filter((t) => t.fecha.startsWith(ym))
    .reduce(
      (acc, t) => {
        if (t.tipo === 'ingreso') acc.ingresos += t.importe;
        else acc.gastos += t.importe;
        return acc;
      },
      { ingresos: 0, gastos: 0 }
    );
}

export default function DashboardPage() {
  const { transactions, profile } = useApp();
  const currency = profile.moneda;
  const currYM = currentYearMonth();
  const prevYM = previousYearMonth();

  const { ingresos, gastos } = useMemo(() => calcMonthSummary(transactions, currYM), [transactions, currYM]);
  const prevMonth = useMemo(() => calcMonthSummary(transactions, prevYM), [transactions, prevYM]);
  const balance = ingresos - gastos;

  // Category breakdown for current month expenses
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.tipo === 'gasto' && t.fecha.startsWith(currYM))
      .forEach((t) => {
        map[t.categoria] = (map[t.categoria] ?? 0) + t.importe;
      });
    return Object.entries(map)
      .map(([key, value]) => ({
        name: getCategoryInfo(key).label,
        emoji: getCategoryInfo(key).emoji,
        value,
        color: getCategoryInfo(key).color,
        key,
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, currYM]);

  // Recent transactions (last 5)
  const recent = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 5),
    [transactions]
  );

  // Smart insights
  const insights = useMemo(() => {
    const msgs: string[] = [];
    if (categoryData.length > 0) {
      msgs.push(`Mayor gasto en ${categoryData[0].emoji} ${categoryData[0].name}.`);
    }
    if (prevMonth.gastos > 0 && gastos > 0) {
      const diff = ((gastos - prevMonth.gastos) / prevMonth.gastos) * 100;
      if (diff < 0) {
        msgs.push(`Gastaste un ${Math.abs(diff).toFixed(0)}% menos que el mes pasado.`);
      } else if (diff > 0) {
        msgs.push(`Gastaste un ${diff.toFixed(0)}% más que el mes pasado.`);
      }
    }
    return msgs.slice(0, 1);
  }, [categoryData, gastos, prevMonth]);

  // Current Month Name
  const monthName = useMemo(() => {
    const date = new Date();
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }, []);

  return (
    <div className="page-enter min-h-screen bg-slate-50/50 dark:bg-slate-950 px-4 md:px-8 pt-6 pb-28 max-w-xl mx-auto space-y-6">
      
      {/* ── Top Header / Greeting ────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
            Resumen de {monthName}
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Hola, {profile.nombre} 👋
          </h1>
        </div>
        <Link
          to="/perfil"
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500/20 shadow-sm hover:scale-105 transition-transform"
        >
          {profile.foto_url ? (
            <img src={profile.foto_url} alt="Perfil" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              {profile.nombre.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
      </div>

      {/* ── Main Hero Card: Monthly Balance ───────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 p-6 text-white shadow-xl border border-emerald-800/30">
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-teal-500/10 blur-2xl" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-300/80 tracking-wide">
              Balance Neto del Mes
            </span>
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/20 flex items-center gap-1.5 text-xs text-emerald-300">
              <TrendingUp size={12} />
              <span>{monthName.split(' ')[0]}</span>
            </div>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            {balance >= 0 ? '' : '-'}{formatCurrency(Math.abs(balance), currency)}
          </h2>

          {insights.length > 0 && (
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-200/90">
              <Sparkles size={14} className="text-emerald-400 flex-shrink-0" />
              <span className="truncate">{insights[0]}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Income & Expense Cards ─────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Income Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Ingresos</span>
            <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(ingresos, currency)}
          </p>
        </div>

        {/* Expense Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Gastos</span>
            <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(gastos, currency)}
          </p>
        </div>
      </div>

      {/* ── Category Breakdown (Pie Chart) ─────────────── */}
      {categoryData.length > 0 && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Gastos por categoría</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Este mes</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-36 h-36 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: any) => formatCurrency(Number(v), currency)}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 grid grid-cols-1 gap-2.5 w-full">
              {categoryData.slice(0, 4).map((cat) => {
                const pct = gastos > 0 ? ((cat.value / gastos) * 100).toFixed(0) : 0;
                return (
                  <div key={cat.key} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                        {cat.emoji} {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 dark:text-slate-500">{pct}%</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrency(cat.value, currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Recent Transactions ───────────────────────── */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Últimos movimientos</h3>
          <Link
            to="/historial"
            className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Wallet size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">Aún no registraste movimientos este mes.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {recent.map((tx) => {
              const cat = getCategoryInfo(tx.categoria);
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: cat.color + '15' }}
                    >
                      {cat.emoji}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {tx.descripcion || cat.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatDateShort(tx.fecha)}</p>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-bold flex-shrink-0 ${
                      tx.tipo === 'ingreso' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {tx.tipo === 'ingreso' ? '+' : '-'}
                    {formatCurrency(tx.importe, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Mobile Floating Action Button (FAB) ─────────── */}
      <Link
        to="/agregar"
        className="md:hidden fixed bottom-20 right-5 z-30 w-14 h-14 rounded-full
                   bg-emerald-600 hover:bg-emerald-500 text-white
                   flex items-center justify-center shadow-lg shadow-emerald-600/30
                   hover:scale-105 active:scale-95 transition-all duration-200"
        aria-label="Agregar movimiento"
      >
        <Plus size={28} />
      </Link>
    </div>
  );
}
