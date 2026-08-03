import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Wallet, ArrowUpRight, ArrowDownRight, ArrowRight, Sparkles, TrendingUp, Calendar, Zap } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import { useApp } from '../context/AppContext';
import { OnboardingModal } from '../components/shared/OnboardingModal';
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
  const { transactions, profile, setAddModalOpen } = useApp();
  const currency = profile.moneda;
  const currYM = currentYearMonth();
  const prevYM = previousYearMonth();

  // Onboarding modal visibility state
  const [showOnboarding, setShowOnboarding] = useState<boolean>(!profile.onboarding_completado);

  const mode = profile.modo_uso || 'presupuesto';

  const { ingresos, gastos } = useMemo(() => calcMonthSummary(transactions, currYM), [transactions, currYM]);
  const prevMonth = useMemo(() => calcMonthSummary(transactions, prevYM), [transactions, prevYM]);
  const balance = ingresos - gastos;

  // ── Budget calculations (Presupuesto Mode) ──────────────────────────────────
  const budgetMetrics = useMemo(() => {
    if (mode !== 'presupuesto') return null;

    const initialBudget = profile.presupuesto_inicial || 0;
    const remaining = Math.max(0, initialBudget - gastos);
    const usedPercentage = initialBudget > 0 ? Math.min(100, Math.round((gastos / initialBudget) * 100)) : 0;

    // Daily recommended calculation until next reset
    const now = new Date();
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const resetDay = profile.dia_reinicio_presupuesto || 1;

    let daysRemaining = 1;
    if (currentDay < resetDay) {
      daysRemaining = resetDay - currentDay;
    } else {
      daysRemaining = daysInMonth - currentDay + resetDay;
    }
    daysRemaining = Math.max(1, daysRemaining);

    const dailyRecommended = remaining / daysRemaining;

    return {
      initialBudget,
      remaining,
      usedPercentage,
      dailyRecommended,
      daysRemaining,
    };
  }, [mode, profile, gastos]);

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
      
      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}

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

      {/* ── MODE 1: PRESUPUESTO (Controlar Presupuesto) ───────────── */}
      {mode === 'presupuesto' && budgetMetrics && (
        <div className="space-y-4 animate-fade-in">
          {/* Main Hero Card: Budget Remaining */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 p-6 text-white shadow-xl border border-emerald-800/30">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-teal-500/10 blur-2xl" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-300/80 tracking-wide flex items-center gap-1.5">
                  <span>💰</span> Dinero Restante
                </span>
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/20 flex items-center gap-1.5 text-xs text-emerald-300 font-semibold">
                  <span>Presupuesto</span>
                </div>
              </div>

              <div>
                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                  {formatCurrency(budgetMetrics.remaining, currency)}
                </h2>
                <p className="text-xs text-emerald-300/70 mt-1">
                  de {formatCurrency(budgetMetrics.initialBudget, currency)} inicial
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-xs text-emerald-200">
                  <span>{budgetMetrics.usedPercentage}% utilizado</span>
                  <span>Gasto total: {formatCurrency(gastos, currency)}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-950/60 p-0.5 border border-emerald-800/40">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      budgetMetrics.usedPercentage > 85
                        ? 'bg-rose-500'
                        : budgetMetrics.usedPercentage > 65
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${budgetMetrics.usedPercentage}%` }}
                  />
                </div>
              </div>

              {insights.length > 0 && (
                <div className="pt-1 flex items-center gap-2 text-xs text-emerald-200/90 border-t border-emerald-800/40">
                  <Sparkles size={14} className="text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{insights[0]}</span>
                </div>
              )}
            </div>
          </div>

          {/* Daily Recommended Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Recomendado por día</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatCurrency(budgetMetrics.dailyRecommended, currency)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 justify-end">
                <Calendar size={12} />
                Quedan {budgetMetrics.daysRemaining} días
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── MODE 2: MOVIMIENTOS (Solo Registrar Movimientos) ────── */}
      {mode === 'movimientos' && (
        <div className="space-y-4 animate-fade-in">
          {/* Main Hero Card: Monthly Balance */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 p-6 text-white shadow-xl border border-emerald-800/30">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-teal-500/10 blur-2xl" />

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-300/80 tracking-wide">
                  Balance del Período
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

          {/* Income & Expense Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Income Card */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Ingresos</span>
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
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Gastos</span>
                <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <ArrowUpRight size={16} />
                </div>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(gastos, currency)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Category Breakdown (Pie Chart - Shared in both modes) ── */}
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

      {/* ── Recent Transactions (Shared in both modes) ── */}
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

      {/* Mobile Floating Action Button (FAB) */}
      <button
        onClick={() => setAddModalOpen(true)}
        className="md:hidden fixed bottom-20 right-5 z-30 w-14 h-14 rounded-full
                   bg-emerald-600 hover:bg-emerald-500 text-white
                   flex items-center justify-center shadow-lg shadow-emerald-600/30
                   hover:scale-105 active:scale-95 transition-all duration-200"
        aria-label="Agregar movimiento"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
