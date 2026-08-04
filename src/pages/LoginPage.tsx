import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

type AuthMode = 'login' | 'register' | 'recovery';

export default function LoginPage() {
  const { login, register, resetPassword } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        await register(email, password, name);
        showToast(`¡Cuenta creada con éxito! Bienvenido ${name} 🎉`, 'success');
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
              ? 'Creá tu cuenta en segundos y sincronizá tus datos en la nube.'
              : mode === 'recovery'
              ? 'Ingresá tu email para restablecer tu contraseña.'
              : 'Controlá tus finanzas personales con Supabase Cloud.'}
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
          <form onSubmit={handleSubmit} className="space-y-4">
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
                      ? 'Crear Cuenta en Supabase'
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
