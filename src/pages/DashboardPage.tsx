import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Wallet, ArrowRight, Sparkles } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';
import {
  formatCurrency, formatDateShort,
  currentYearMonth, previousYearMonth, weekOfMonth,
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

// ── components ───────────────────────────────────────────────────────────────

function StatChip({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-white/60">{label}</span>
      <span className={`text-base font-bold ${positive ? 'text-emerald-300' : 'text-red-300'}`}>
        {value}
      </span>
    </div>
  );
}

// ── Custom Pie label ─────────────────────────────────────────────────────────
function CustomPieLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: any) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.06) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { transactions, profile } = useApp();
  const currency = profile.moneda;
  const currYM = currentYearMonth();
  const prevYM = previousYearMonth();

  const { ingresos, gastos } = useMemo(() => calcMonthSummary(transactions, currYM), [transactions, currYM]);
  const prevMonth = useMemo(() => calcMonthSummary(transactions, prevYM), [transactions, prevYM]);
  const balance = ingresos - gastos;

  // Total historical balance
  const totalBalance = useMemo(
    () =>
      transactions.reduce(
        (acc, t) => (t.tipo === 'ingreso' ? acc + t.importe : acc - t.importe),
        0
      ),
    [transactions]
  );

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

  // Weekly spending for current month
  const weeklyData = useMemo(() => {
    const weeks: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    transactions
      .filter((t) => t.tipo === 'gasto' && t.fecha.startsWith(currYM))
      .forEach((t) => {
        const w = weekOfMonth(t.fecha);
        weeks[w] = (weeks[w] ?? 0) + t.importe;
      });
    return Object.entries(weeks)
      .filter(([, v]) => v > 0)
      .map(([w, v]) => ({ semana: `Sem ${w}`, valor: v }));
  }, [transactions, currYM]);

  // Recent transactions (last 10)
  const recent = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 10),
    [transactions]
  );

  // Smart insights
  const insights = useMemo(() => {
    const msgs: string[] = [];
    if (categoryData.length > 0) {
      msgs.push(`Este mes gastaste más en ${categoryData[0].emoji} ${categoryData[0].name}.`);
    }
    if (gastos > 0) {
      const days = new Date().getDate();
      const avg = gastos / days;
      msgs.push(`Tu gasto promedio diario fue de ${formatCurrency(avg, currency)}.`);
    }
    if (prevMonth.gastos > 0 && gastos > 0) {
      const diff = ((gastos - prevMonth.gastos) / prevMonth.gastos) * 100;
      if (diff < 0) {
        msgs.push(`Gastaste un ${Math.abs(diff).toFixed(0)}% menos que el mes pasado. ¡Excelente!`);
      } else if (diff > 0) {
        msgs.push(`Gastaste un ${diff.toFixed(0)}% más que el mes pasado.`);
      }
    }
    if (categoryData.length > 0 && gastos > 0) {
      const top = categoryData[0];
      const pct = ((top.value / gastos) * 100).toFixed(0);
      msgs.push(`${top.emoji} ${top.name} representa el ${pct}% de tus gastos.`);
    }
    return msgs.slice(0, 2);
  }, [categoryData, gastos, prevMonth, currency]);

  return (
    <div className="page-enter min-h-screen">
      {/* ── Hero Balance Card ─────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 px-6 pt-10 pb-20">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/5 blur-2xl" />

        <p className="text-white/60 text-sm font-medium mb-2">Saldo disponible</p>
        <h2 className="text-5xl font-extrabold text-white mb-6 tracking-tight">
          {formatCurrency(totalBalance, currency)}
        </h2>
        <div className="flex gap-8">
          <StatChip label="Ingresos del mes" value={formatCurrency(ingresos, currency)} positive />
          <StatChip label="Gastos del mes" value={formatCurrency(gastos, currency)} positive={false} />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-white/60">Balance</span>
            <span className={`text-base font-bold ${balance >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
              {balance >= 0 ? '+' : ''}{formatCurrency(balance, currency)}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 -mt-10 pb-6 space-y-5 max-w-4xl mx-auto">

        {/* ── Smart Insights ─────────────────────────────── */}
        {insights.length > 0 && (
          <div className="card p-4 flex gap-3 items-start animate-slide-up">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <Sparkles size={18} className="text-amber-500" />
            </div>
            <div className="space-y-1">
              {insights.map((msg, i) => (
                <p key={i} className="text-sm text-slate-600 dark:text-slate-300">{msg}</p>
              ))}
            </div>
          </div>
        )}

        {/* ── Category Chart ─────────────────────────────── */}
        {categoryData.length > 0 && (
          <div className="card p-5 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Gastos por categoría</h3>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-full md:w-56 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={CustomPieLabel}
                      outerRadius={90}
                      dataKey="value"
                    >
                      {categoryData.map((entry) => (
                        <Cell key={entry.key} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: any) => formatCurrency(Number(v), currency)}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        fontSize: '13px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2 w-full">
                {categoryData.slice(0, 6).map((cat) => (
                  <div key={cat.key} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      {cat.emoji} {cat.name}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-auto">
                      {formatCurrency(cat.value, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Weekly Chart ─────────────────────────────── */}
        {weeklyData.length > 0 && (
          <div className="card p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Evolución semanal</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis
                    dataKey="semana"
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v: any) => formatCurrency(Number(v), currency)}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="valor" fill="url(#barGradient)" radius={[6, 6, 0, 0]} name="Gastos" />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Recent Transactions ─────────────────────────── */}
        <div className="card p-5 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Últimos movimientos</h3>
            <Link
              to="/historial"
              className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline"
            >
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Wallet size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aún no hay movimientos.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((tx) => {
                const cat = getCategoryInfo(tx.categoria);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: cat.color + '20' }}
                    >
                      {cat.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                        {tx.descripcion || cat.label}
                      </p>
                      <p className="text-xs text-slate-400">{formatDateShort(tx.fecha)}</p>
                    </div>
                    <span
                      className={`text-sm font-bold flex-shrink-0 ${
                        tx.tipo === 'ingreso' ? 'amount-positive' : 'amount-negative'
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
      </div>

      {/* ── FAB ───────────────────────────────────────────── */}
      <Link
        to="/agregar"
        className="md:hidden fixed bottom-20 right-5 z-30 w-14 h-14 rounded-2xl
                   bg-gradient-to-br from-brand-500 to-brand-700
                   flex items-center justify-center shadow-fab
                   hover:scale-110 active:scale-95 transition-transform duration-200"
        aria-label="Agregar movimiento"
      >
        <Plus size={26} className="text-white" />
      </Link>
    </div>
  );
}
