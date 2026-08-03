import { useState } from 'react';
import {
  Moon, Sun, DollarSign, Download,
  Camera, Check, Pencil, LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';

const CURRENCIES = [
  { code: 'ARS', label: 'Peso Argentino ($)' },
  { code: 'USD', label: 'Dólar Estadounidense ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'BRL', label: 'Real Brasileño (R$)' },
  { code: 'UYU', label: 'Peso Uruguayo ($U)' },
  { code: 'CLP', label: 'Peso Chileno ($)' },
];

export default function ProfilePage() {
  const { profile, updateProfile, theme, toggleTheme, transactions, logout } = useApp();
  const { showToast } = useToast();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.nombre);

  const saveName = () => {
    if (nameInput.trim()) {
      updateProfile({ nombre: nameInput.trim() });
      showToast('Nombre actualizado ✓', 'success');
    }
    setEditingName(false);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Tipo', 'Importe', 'Categoría', 'Descripción', 'Fecha'];
    const rows = transactions.map((t) =>
      [t.id, t.tipo, t.importe, t.categoria, t.descripcion, t.fecha].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mi-plata-movimientos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Datos exportados ✓', 'success');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ foto_url: reader.result as string });
      showToast('Foto actualizada ✓', 'success');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="page-enter min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 md:px-6 py-5">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Perfil</h1>
      </div>

      <div className="px-4 md:px-6 py-6 max-w-lg mx-auto space-y-4">

        {/* Avatar & Name */}
        <div className="card p-6 flex flex-col items-center gap-4 animate-slide-up">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              {profile.foto_url ? (
                <img src={profile.foto_url} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl text-white font-bold">
                  {profile.nombre.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center cursor-pointer shadow-lg hover:bg-emerald-700 transition-colors">
              <Camera size={14} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>

          {/* Name */}
          {editingName ? (
            <div className="flex gap-2 w-full max-w-xs">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                className="input-field text-center text-lg font-bold"
                autoFocus
              />
              <button onClick={saveName} className="btn-primary px-3">
                <Check size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{profile.nombre}</h2>
              <button
                onClick={() => setEditingName(true)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-brand-600 transition-colors"
              >
                <Pencil size={15} />
              </button>
            </div>
          )}

          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{transactions.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">movimientos</p>
            </div>
            <div className="w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {transactions.filter((t) => t.tipo === 'ingreso').length}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">ingresos</p>
            </div>
            <div className="w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {transactions.filter((t) => t.tipo === 'gasto').length}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">gastos</p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card divide-y divide-slate-100 dark:divide-slate-800 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          {/* Dark mode */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon size={20} className="text-sky-400" />
              ) : (
                <Sun size={20} className="text-amber-500" />
              )}
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Modo oscuro</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{theme === 'dark' ? 'Activado' : 'Desactivado'}</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              className={cn(
                'w-12 h-6 rounded-full transition-all duration-300 relative focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2',
                theme === 'dark' ? 'bg-brand-500' : 'bg-slate-400'
              )}
            >
              <div
                className={cn(
                  'absolute top-0.5 w-5 h-5 rounded-full shadow-md transition-all duration-300',
                  theme === 'dark' ? 'left-6 bg-white' : 'left-0.5 bg-white'
                )}
              />
            </button>
          </div>

          {/* Currency */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <DollarSign size={20} className="text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Moneda</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{profile.moneda}</p>
              </div>
            </div>
            <select
              value={profile.moneda}
              onChange={(e) => {
                updateProfile({ moneda: e.target.value });
                showToast('Moneda actualizada ✓', 'success');
              }}
              className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Export */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-3 p-4 w-full hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <Download size={20} className="text-blue-500" />
            <div className="text-left">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Exportar datos</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Descarga CSV con todos tus movimientos</p>
            </div>
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              showToast('Sesión cerrada ✓', 'info');
            }}
            className="flex items-center gap-3 p-4 w-full hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition-colors"
          >
            <LogOut size={20} />
            <div className="text-left">
              <p className="text-sm font-medium">Cerrar sesión</p>
              <p className="text-xs text-rose-500/80 dark:text-rose-400/70">Salir de tu cuenta en este dispositivo</p>
            </div>
          </button>
        </div>

        {/* App info */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-500 py-4">
          Mi Plata v1.0 · Hecho con ❤️
        </div>
      </div>
    </div>
  );
}
