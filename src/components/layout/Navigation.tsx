import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  List,
  BarChart3,
  User,
  PlusCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { to: '/',            label: 'Inicio',       icon: LayoutDashboard },
  { to: '/historial',   label: 'Historial',    icon: List },
  { to: '/estadisticas',label: 'Stats',        icon: BarChart3 },
  { to: '/perfil',      label: 'Perfil',       icon: User },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 py-2 md:hidden safe-area-pb shadow-lg">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200',
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                size={22}
                className={cn(
                  'transition-all duration-200',
                  isActive ? 'stroke-[2.5px] scale-110' : 'stroke-[1.75px]'
                )}
              />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6 gap-2">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <img
            src="/mi-platitas.png"
            alt="Mi Plata Logo"
            className="w-10 h-10 rounded-2xl object-cover shadow-fab flex-shrink-0"
          />
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Mi Plata</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Finanzas personales</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={cn(isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]')} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Add transaction sidebar button */}
      <NavLink
        to="/agregar"
        className="flex items-center justify-center gap-2 btn-primary mt-4 w-full"
      >
        <PlusCircle size={18} />
        Agregar
      </NavLink>
    </aside>
  );
}
