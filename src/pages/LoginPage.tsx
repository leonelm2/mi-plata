import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { login, updateProfile } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Quick Demo Login Handler
  const handleQuickDemo = (demoType: 'presupuesto' | 'movimientos') => {
    setIsLoading(true);
    setTimeout(() => {
      if (demoType === 'presupuesto') {
        const demoEmail = 'demo.presupuesto@miplata.com';
        login(demoEmail);
        updateProfile({
          email: demoEmail,
          nombre: 'Lionel Andrés',
          modo_uso: 'presupuesto',
          presupuesto_inicial: 500000,
          fecha_inicio_presupuesto: '2026-08-01',
          dia_reinicio_presupuesto: 1,
          onboarding_completado: true,
        });
        showToast('¡Ingresaste como Demo 1 (Modo Presupuesto)! 💰', 'success');
      } else {
        const demoEmail = 'demo.movimientos@miplata.com';
        login(demoEmail);
        updateProfile({
          email: demoEmail,
          nombre: 'Mateo Rossi',
          modo_uso: 'movimientos',
          onboarding_completado: true,
        });
        showToast('¡Ingresaste como Demo 2 (Solo Movimientos)! 📊', 'success');
      }
      setIsLoading(false);
      navigate('/');
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegistering && !name)) {
      showToast('Por favor completa todos los campos', 'error');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const userNombre = isRegistering
        ? name
        : email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);

      login(email);

      if (isRegistering) {
        // New registered user -> trigger onboarding modal on dashboard
        updateProfile({
          email,
          nombre: userNombre,
          onboarding_completado: false,
        });
        showToast(`¡Cuenta creada con éxito! Bienvenido ${userNombre} 🎉`, 'success');
      } else {
        // Existing user login
        updateProfile({
          email,
          nombre: userNombre,
          onboarding_completado: true,
        });
        showToast(`¡Bienvenido de nuevo, ${userNombre}! 👋`, 'success');
      }

      setIsLoading(false);
      navigate('/');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-in my-auto">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-xl shadow-emerald-950/50 mb-1 ring-4 ring-emerald-500/20">
            <img src="/mi-platitas.png" alt="Logo" className="w-10 h-10 rounded-2xl object-cover" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Mi Plata</h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {isRegistering
              ? 'Creá tu cuenta en segundos y elegí tu forma de administrar tu dinero.'
              : 'Controlá tus finanzas personales de forma simple, segura y elegante.'}
          </p>
        </div>

        {/* Tab Switcher: Login / Register */}
        <div className="flex rounded-2xl bg-slate-900/90 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setIsRegistering(false)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              !isRegistering
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setIsRegistering(true)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isRegistering
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Main Form Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Only on Register) */}
            {isRegistering && (
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
                    required={isRegistering}
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
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                  Contraseña
                </label>
                {!isRegistering && (
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-[11px] text-emerald-400 hover:underline">
                    ¿Olvidaste tu clave?
                  </a>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-2xl shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transform active:scale-95 transition-all duration-200 disabled:opacity-50 text-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegistering ? 'Crear Cuenta y Elegir Modo' : 'Iniciar Sesión'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Users Section */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2.5 text-center">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Acceso Rápido de Prueba (Demos Preconfigurados)
            </p>

            <div className="grid grid-cols-2 gap-2">
              {/* Demo 1: Presupuesto (Lionel Andrés) */}
              <button
                type="button"
                onClick={() => handleQuickDemo('presupuesto')}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left space-y-0.5 transition-colors group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <Wallet size={12} />
                  <span>Demo 1 (Presupuesto)</span>
                </div>
                <p className="text-[10px] text-slate-300 font-semibold truncate">Lionel Andrés</p>
              </button>

              {/* Demo 2: Solo Movimientos */}
              <button
                type="button"
                onClick={() => handleQuickDemo('movimientos')}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left space-y-0.5 transition-colors group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-teal-400">
                  <span>📊</span>
                  <span>Demo 2 (Movimientos)</span>
                </div>
                <p className="text-[10px] text-slate-300 font-semibold truncate">Mateo Rossi</p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Seguridad de nivel bancario encriptada</span>
        </div>
      </div>
    </div>
  );
}
