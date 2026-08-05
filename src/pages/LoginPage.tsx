import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ShieldCheck, RefreshCw, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

type AuthMode = 'login' | 'register' | 'recovery';

interface CountryOption {
  code: string;
  name: string;
  flag: string;
  currency: string;
  symbol: string;
}

const SOUTH_AMERICAN_COUNTRIES: CountryOption[] = [
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', currency: 'ARS', symbol: '$' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', currency: 'BRL', symbol: 'R$' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', currency: 'CLP', symbol: '$' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', currency: 'COP', symbol: '$' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', currency: 'USD', symbol: '$' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', currency: 'PEN', symbol: 'S/' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', currency: 'UYU', symbol: '$U' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', currency: 'PYG', symbol: '₲' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', currency: 'BOB', symbol: 'Bs.' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', currency: 'VES', symbol: 'Bs.' },
];

export default function LoginPage() {
  const { login, loginWithGoogle, register, resetPassword } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(SOUTH_AMERICAN_COUNTRIES[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      showToast(err.message || 'Error al iniciar sesión con Google', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Por favor ingresa tu correo electrónico', 'error');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'recovery') {
        await resetPassword(email);
        showToast('Enviamos un enlace de recuperación a tu email 📬', 'success');
        setMode('login');
      } else if (mode === 'register') {
        if (!password || !name) {
          showToast('Por favor completa tu nombre y contraseña', 'error');
          setIsLoading(false);
          return;
        }
        await register(email, password, name, selectedCountry.currency);
        showToast(`¡Cuenta creada con éxito en ${selectedCountry.flag}! Bienvenido ${name} 🎉`, 'success');
        navigate('/');
      } else {
        if (!password) {
          showToast('Por favor ingresa tu contraseña', 'error');
          setIsLoading(false);
          return;
        }
        await login(email, password);
        showToast('¡Bienvenido de nuevo! 👋', 'success');
        navigate('/');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      showToast(err.message || 'Ocurrió un error al procesar tu solicitud', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-in my-auto">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-xl shadow-emerald-950/50 mb-1 ring-4 ring-emerald-500/20">
            <img src="/mi-platitas.png" alt="Logo" className="w-10 h-10 rounded-2xl object-cover" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Mi Plata</h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {mode === 'register'
              ? 'Seleccioná tu país sudamericano y comenzá con tu moneda local.'
              : mode === 'recovery'
              ? 'Ingresá tu email para restablecer tu contraseña.'
              : 'Controlá tus finanzas personales de forma simple y elegante.'}
          </p>
        </div>

        {mode !== 'recovery' && (
          <div className="flex rounded-2xl bg-slate-900/90 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Crear Cuenta
            </button>
          </div>
        )}

        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
          {/* Botón de Iniciar Sesión / Registro con Google */}
          {mode !== 'recovery' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl shadow-md flex items-center justify-center gap-3 transition-all active:scale-95 text-xs"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continuar con Google</span>
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  o con correo
                </span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Country Selector (Only on Register) */}
            {mode === 'register' && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                  País (Sudamérica)
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <select
                    value={selectedCountry.code}
                    onChange={(e) => {
                      const found = SOUTH_AMERICAN_COUNTRIES.find((c) => c.code === e.target.value);
                      if (found) setSelectedCountry(found);
                    }}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                  >
                    {SOUTH_AMERICAN_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                        {c.flag} {c.name} ({c.currency} - {c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Name Field (Only on Register) */}
            {mode === 'register' && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Lionel Andrés"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    required={mode === 'register'}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hola@tuemail.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            {mode !== 'recovery' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                    Contraseña
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('recovery')}
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      ¿Olvidaste tu clave?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-2xl shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transform active:scale-95 transition-all duration-200 disabled:opacity-50 text-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'register'
                      ? `Registrarme (${selectedCountry.flag} ${selectedCountry.currency})`
                      : mode === 'recovery'
                      ? 'Recuperar Contraseña'
                      : 'Iniciar Sesión'}
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {mode === 'recovery' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto"
              >
                <RefreshCw size={12} />
                Volver a Iniciar Sesión
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Protegido con Supabase Row Level Security (RLS)</span>
        </div>
      </div>
    </div>
  );
}
