import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { login, updateProfile } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Por favor completa todos los campos', 'error');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Extract name from email as fallback greeting
      const namePart = email.split('@')[0];
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

      login(email);
      updateProfile({ email, nombre: formattedName });

      showToast(`¡Bienvenido de nuevo, ${formattedName}! 👋`, 'success');
      setIsLoading(false);
      navigate('/');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-in">
        {/* Header Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-xl shadow-emerald-950/50 mb-2 ring-4 ring-emerald-500/20">
            <img src="/mi-platitas.png" alt="Logo" className="w-12 h-12 rounded-2xl object-cover" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Mi Plata</h1>
          <p className="text-sm text-slate-400 max-w-xs mx-auto">
            Controlá tus finanzas personales de forma simple, segura y elegante.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
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
                <a href="#" onClick={(e) => e.preventDefault()} className="text-xs text-emerald-400 hover:underline">
                  ¿Olvidaste tu clave?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-2xl shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transform active:scale-95 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80 text-center space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Tus datos están encriptados y protegidos</span>
            </div>

            <p className="text-xs text-slate-400">
              ¿No tenés una cuenta?{' '}
              <button
                type="button"
                onClick={() => {
                  setEmail('demousuario@miplata.com');
                  setPassword('demo1234');
                  showToast('Credenciales de prueba cargadas ✓', 'info');
                }}
                className="text-emerald-400 font-semibold hover:underline"
              >
                Probar Demo
              </button>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400">
          Mi Plata v1.0 · Tu billetera personal inteligente
        </p>
      </div>
    </div>
  );
}
