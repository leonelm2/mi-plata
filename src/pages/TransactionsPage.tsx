import { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, Pencil, Trash2, X, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../lib/formatters';
import { getCategoryInfo, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../lib/categories';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import AddTransactionPage from './AddTransactionPage';
import { cn } from '../lib/utils';
import type { Transaction } from '../types';

type SortKey = 'fecha' | 'importe';
type SortDir = 'asc' | 'desc';

export default function TransactionsPage() {
  const { transactions, deleteTransaction } = useApp();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState<'' | 'ingreso' | 'gasto'>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('fecha');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { profile } = useApp();
  const currency = profile.moneda;

  const filtered = useMemo(() => {
    let txs = [...transactions];
    if (search) {
      const q = search.toLowerCase();
      txs = txs.filter(
        (t) =>
          t.descripcion.toLowerCase().includes(q) ||
          getCategoryInfo(t.categoria).label.toLowerCase().includes(q)
      );
    }
    if (filterCategory) txs = txs.filter((t) => t.categoria === filterCategory);
    if (filterType) txs = txs.filter((t) => t.tipo === filterType);
    if (dateFrom) txs = txs.filter((t) => t.fecha >= dateFrom);
    if (dateTo) txs = txs.filter((t) => t.fecha <= dateTo);

    txs.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'fecha') cmp = a.fecha.localeCompare(b.fecha);
      else cmp = a.importe - b.importe;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return txs;
  }, [transactions, search, filterCategory, filterType, dateFrom, dateTo, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const handleDelete = () => {
    if (!confirmId) return;
    deleteTransaction(confirmId);
    showToast('Movimiento eliminado', 'info');
    setConfirmId(null);
  };

  const hasFilters = filterCategory || filterType || dateFrom || dateTo;

  if (editTx) {
    return (
      <AddTransactionPage
        editId={editTx.id}
        initialValues={{
          tipo: editTx.tipo,
          importe: editTx.importe,
          categoria: editTx.categoria,
          descripcion: editTx.descripcion,
          fecha: editTx.fecha,
        }}
        onClose={() => setEditTx(null)}
      />
    );
  }

  return (
    <div className="page-enter min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-4 py-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Historial</h1>

        {/* Search */}
        <div className="relative mb-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar movimientos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2.5 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter toggles row */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors',
              showFilters || hasFilters
                ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            )}
          >
            <SlidersHorizontal size={14} />
            Filtros {hasFilters ? '•' : ''}
          </button>
          <button
            onClick={() => toggleSort('fecha')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors',
              sortKey === 'fecha'
                ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            )}
          >
            <ArrowUpDown size={14} />
            Fecha {sortKey === 'fecha' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
          </button>
          <button
            onClick={() => toggleSort('importe')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors',
              sortKey === 'importe'
                ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            )}
          >
            <ArrowUpDown size={14} />
            Importe {sortKey === 'importe' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
          </button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-3 animate-fade-in">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label text-xs">Tipo</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="input-field py-2 text-sm"
                >
                  <option value="">Todos</option>
                  <option value="gasto">Gastos</option>
                  <option value="ingreso">Ingresos</option>
                </select>
              </div>
              <div>
                <label className="label text-xs">Categoría</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="input-field py-2 text-sm"
                >
                  <option value="">Todas</option>
                  <optgroup label="Gastos">
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Ingresos">
                    {INCOME_CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label text-xs">Desde</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-field py-2 text-sm" />
              </div>
              <div>
                <label className="label text-xs">Hasta</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-field py-2 text-sm" />
              </div>
            </div>
            {hasFilters && (
              <button
                onClick={() => { setFilterCategory(''); setFilterType(''); setDateFrom(''); setDateTo(''); }}
                className="text-xs text-red-500 font-medium hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Transaction list */}
      <div className="px-4 md:px-6 py-4 max-w-2xl mx-auto">
        <p className="text-xs text-slate-400 mb-3">{filtered.length} movimiento{filtered.length !== 1 ? 's' : ''}</p>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Filter size={40} className="mx-auto mb-3 opacity-20" />
            <p>No se encontraron movimientos.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((tx) => {
              const cat = getCategoryInfo(tx.categoria);
              return (
                <div
                  key={tx.id}
                  className="card p-4 flex items-center gap-3 animate-fade-in group"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: cat.color + '20' }}
                  >
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {tx.descripcion || cat.label}
                    </p>
                    <p className="text-xs text-slate-400">{cat.label} · {formatDate(tx.fecha)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={cn(
                        'text-sm font-bold',
                        tx.tipo === 'ingreso' ? 'amount-positive' : 'amount-negative'
                      )}
                    >
                      {tx.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(tx.importe, currency)}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditTx(tx)}
                        className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 text-slate-400 hover:text-brand-600 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmId(tx.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmId}
        title="Eliminar movimiento"
        message="Esta acción no se puede deshacer. ¿Estás seguro?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
