import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { TrendingDown, TrendingUp, Calendar, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatCurrency, currentYearMonth, previousYearMonth, getYearMonth,
} from '../lib/formatters';
import { getCategoryInfo } from '../lib/categories';
import { cn } from '../lib/utils';

function CustomPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
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

export default function StatsPage() {
  const { transactions, profile } = useApp();
  const currency = profile.moneda;
  const currYM = currentYearMonth();
  const prevYM = previousYearMonth();

  // Category breakdown
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.tipo === 'gasto' && t.fecha.startsWith(currYM))
      .forEach((t) => { map[t.categoria] = (map[t.categoria] ?? 0) + t.importe; });
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

  const totalGastos = categoryData.reduce((s, c) => s + c.value, 0);

  // Monthly bar chart (last 6 months)
  const monthlyData = useMemo(() => {
    const months: Record<string, { ingresos: number; gastos: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[ym] = { ingresos: 0, gastos: 0 };
    }
    transactions.forEach((t) => {
      const ym = getYearMonth(t.fecha);
      if (months[ym]) {
        if (t.tipo === 'ingreso') months[ym].ingresos += t.importe;
        else months[ym].gastos += t.importe;
      }
    });
    return Object.entries(months).map(([ym, v]) => {
      const [y, m] = ym.split('-');
      const date = new Date(Number(y), Number(m) - 1, 1);
      return {
        mes: date.toLocaleDateString('es-AR', { month: 'short' }),
        Ingresos: v.ingresos,
        Gastos: v.gastos,
      };
    });
  }, [transactions]);

  // Daily average
  const dailyAvg = useMemo(() => {
    const days = new Date().getDate();
    return totalGastos / days;
  }, [totalGastos]);

  // Top category
  const topCategory = categoryData[0];

  // vs prev month
  const prevGastos = useMemo(() => {
    return transactions
      .filter((t) => t.tipo === 'gasto' && t.fecha.startsWith(prevYM))
      .reduce((s, t) => s + t.importe, 0);
  }, [transactions, prevYM]);

  const vsLastMonth = prevGastos > 0
    ? ((totalGastos - prevGastos) / prevGastos) * 100
    : null;

  const statCards = [
    {
      icon: Calendar,
      label: 'Promedio diario',
      value: formatCurrency(dailyAvg, currency),
      sub: 'de gasto este mes',
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Target,
      label: 'Mayor categoría',
      value: topCategory ? `${topCategory.emoji} ${topCategory.name}` : '—',
      sub: topCategory ? formatCurrency(topCategory.value, currency) : '',
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      icon: vsLastMonth !== null && vsLastMonth < 0 ? TrendingDown : TrendingUp,
      label: 'vs. mes anterior',
      value:
        vsLastMonth !== null
          ? `${vsLastMonth > 0 ? '+' : ''}${vsLastMonth.toFixed(1)}%`
          : '—',
      sub: vsLastMonth !== null
        ? vsLastMonth < 0 ? 'Menos que el mes pasado 🎉' : 'Más que el mes pasado'
        : 'Sin datos del mes anterior',
      color: vsLastMonth !== null && vsLastMonth < 0 ? 'text-emerald-500' : 'text-red-500',
      bg: vsLastMonth !== null && vsLastMonth < 0
        ? 'bg-emerald-50 dark:bg-emerald-900/20'
        : 'bg-red-50 dark:bg-red-900/20',
    },
  ];

  return (
    <div className="page-enter min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 md:px-6 py-5">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Estadísticas</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Resumen del mes actual</p>
      </div>

      <div className="px-4 md:px-6 py-5 max-w-4xl mx-auto space-y-5">

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="card p-4 flex gap-3 items-start animate-slide-up">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', s.bg)}>
                <s.icon size={20} className={s.color} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{s.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Category Pie */}
        {categoryData.length > 0 && (
          <div className="card p-5 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Gastos por categoría</h3>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="w-full md:w-64 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={CustomPieLabel} outerRadius={100} dataKey="value">
                      {categoryData.map((entry) => (
                        <Cell key={entry.key} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => formatCurrency(Number(v), currency)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', fontSize: '13px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 w-full">
                {categoryData.map((cat) => {
                  const pct = ((cat.value / totalGastos) * 100).toFixed(1);
                  return (
                    <div key={cat.key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {cat.emoji} {cat.name}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {formatCurrency(cat.value, currency)} <span className="text-slate-400">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Monthly chart */}
        <div className="card p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Últimos 6 meses</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barSize={20} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => formatCurrency(v, currency)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', fontSize: '13px' }} />
                <Legend />
                <Bar dataKey="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
