import { useState } from 'react';
import { Wallet, ArrowRight, CheckCircle2, Calendar, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import type { AppMode } from '../../types';

interface OnboardingModalProps {
  onComplete: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const { profile, updateProfile } = useApp();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedMode, setSelectedMode] = useState<AppMode>(profile.modo_uso || 'presupuesto');

  // Step 2 Form State (Budget Mode)
  const [presupuesto, setPresupuesto] = useState<number>(profile.presupuesto_inicial || 300000);
  const [fechaInicio, setFechaInicio] = useState<string>(
    profile.fecha_inicio_presupuesto || new Date().toISOString().slice(0, 10)
  );
  const [diaReinicio, setDiaReinicio] = useState<number>(profile.dia_reinicio_presupuesto || 1);

  const handleNextStep = () => {
    if (selectedMode === 'movimientos') {
      // Complete immediately for movimientos mode
      updateProfile({
        modo_uso: 'movimientos',
        onboarding_completado: true,
      });
      showToast('¡Modo "Solo registrar movimientos" activado! 📊', 'success');
      onComplete();
    } else {
      // Go to budget config step
      setStep(2);
    }
  };

  const handleFinishBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presupuesto || presupuesto <= 0) {
      showToast('Por favor ingresá un presupuesto inicial válido', 'error');
      return;
    }

    updateProfile({
      modo_uso: 'presupuesto',
      presupuesto_inicial: presupuesto,
      fecha_inicio_presupuesto: fechaInicio,
      dia_reinicio_presupuesto: diaReinicio,
      onboarding_completado: true,
    });

    showToast('¡Presupuesto activado correctamente! 💰', 'success');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-slide-up my-auto">
        
        {/* Step 1: Choice */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
                <Wallet size={28} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                ¿Cómo querés usar Mi Plata?
              </h2>
              <p className="text-sm text-slate-400">
                Elegí la experiencia que mejor se adapte a tu forma de administrar el dinero.
              </p>
            </div>

            <div className="space-y-3">
              {/* Option 1: Budget */}
              <div
                onClick={() => setSelectedMode('presupuesto')}
                className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 ${
                  selectedMode === 'presupuesto'
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💰</span>
                    <h3 className="font-bold text-white text-base">Controlar mi presupuesto</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                    Recomendado
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-7">
                  "Quiero definir cuánto dinero tengo disponible y controlar cuánto me queda durante el mes."
                </p>
                {selectedMode === 'presupuesto' && (
                  <CheckCircle2 className="absolute right-4 bottom-4 text-emerald-400" size={20} />
                )}
              </div>

              {/* Option 2: Transactions only */}
              <div
                onClick={() => setSelectedMode('movimientos')}
                className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-2 ${
                  selectedMode === 'movimientos'
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    <h3 className="font-bold text-white text-base">Solo registrar movimientos</h3>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-7">
                  "Solo quiero registrar ingresos y gastos para analizar en qué gasto mi dinero, sin llevar un presupuesto."
                </p>
                {selectedMode === 'movimientos' && (
                  <CheckCircle2 className="absolute right-4 bottom-4 text-emerald-400" size={20} />
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-2xl shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transform active:scale-95 transition-all duration-200"
            >
              <span>{selectedMode === 'presupuesto' ? 'Configurar Presupuesto' : 'Comenzar'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Budget Setup Form */}
        {step === 2 && (
          <form onSubmit={handleFinishBudget} className="space-y-6 animate-fade-in">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-bold text-white">Configurar Presupuesto</h2>
              <p className="text-xs text-slate-400">
                Definí tu monto disponible y las fechas de reinicio de tu dinero.
              </p>
            </div>

            <div className="space-y-4">
              {/* Presupuesto Inicial */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Presupuesto Inicial
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="number"
                    min="1"
                    step="100"
                    value={presupuesto}
                    onChange={(e) => setPresupuesto(Number(e.target.value))}
                    placeholder="300000"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-lg font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Fecha Inicio */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Fecha de inicio del período
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Día de reinicio */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Día de reinicio mensual (ej. cobro)
                </label>
                <select
                  value={diaReinicio}
                  onChange={(e) => setDiaReinicio(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      Día {d} de cada mes
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-2xl transition-colors text-sm"
              >
                Volver
              </button>
              <button
                type="submit"
                className="w-2/3 py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-2xl shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transform active:scale-95 transition-all text-sm"
              >
                <span>Guardar y Empezar</span>
                <CheckCircle2 size={16} />
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
