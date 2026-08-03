
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../lib/categories';
import { todayStr } from '../lib/formatters';
import { cn } from '../lib/utils';
import type { TransactionType, Category } from '../types';

const schema = z.object({
  tipo: z.enum(['ingreso', 'gasto'] as const),
  importe: z.coerce.number().positive('El importe debe ser mayor a 0'),
  categoria: z.string().min(1, 'Seleccioná una categoría'),
  descripcion: z.string().optional(),
  fecha: z.string().min(1, 'La fecha es requerida'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  editId?: string;
  initialValues?: Partial<FormValues>;
  onClose?: () => void;
}

export default function AddTransactionPage({ editId, initialValues, onClose }: Props) {
  const navigate = useNavigate();
  const { addTransaction, updateTransaction } = useApp();
  const { showToast } = useToast();
  const isEdit = Boolean(editId);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: initialValues?.tipo ?? 'gasto',
      importe: initialValues?.importe,
      categoria: initialValues?.categoria ?? '',
      descripcion: initialValues?.descripcion ?? '',
      fecha: initialValues?.fecha ?? todayStr(),
    },
  });

  const tipo = watch('tipo');
  const selectedCategoria = watch('categoria');
  const categories = tipo === 'gasto' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const onSubmit = (data: FormValues) => {
    if (isEdit && editId) {
      updateTransaction(editId, {
        tipo: data.tipo,
        importe: data.importe,
        categoria: data.categoria as Category,
        descripcion: data.descripcion ?? '',
        fecha: data.fecha,
      });
      showToast('Movimiento actualizado ✓', 'success');
    } else {
      addTransaction({
        tipo: data.tipo,
        importe: data.importe,
        categoria: data.categoria as Category,
        descripcion: data.descripcion ?? '',
        fecha: data.fecha,
      });
      showToast('Movimiento guardado ✓', 'success');
    }
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const handleBack = () => {
    if (onClose) onClose();
    else navigate(-1);
  };

  return (
    <div className="page-enter min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-4 py-4 flex items-center gap-3">
        <button
          onClick={handleBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
          {isEdit ? 'Editar movimiento' : 'Agregar movimiento'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 md:px-6 py-6 max-w-lg mx-auto space-y-5">

        {/* Type toggle */}
        <Controller
          name="tipo"
          control={control}
          render={({ field }) => (
            <div className="card p-1 flex gap-1">
              {(['gasto', 'ingreso'] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    field.onChange(t);
                    setValue('categoria', '');
                  }}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                    field.value === t
                      ? t === 'gasto'
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  {t === 'gasto' ? '↑ Gasto' : '↓ Ingreso'}
                </button>
              ))}
            </div>
          )}
        />

        {/* Amount */}
        <div>
          <label className="label">Importe</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
            <input
              type="number"
              step="1"
              min="0"
              placeholder="0"
              className={cn('input-field pl-8 text-2xl font-bold', errors.importe && 'border-red-400 focus:ring-red-400')}
              {...register('importe')}
            />
          </div>
          {errors.importe && <p className="text-xs text-red-500 mt-1">{errors.importe.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="label">Categoría</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setValue('categoria', cat.key)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 text-xs font-medium',
                  selectedCategoria === cat.key
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                    : 'border-transparent bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-600'
                )}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="truncate w-full text-center">{cat.label}</span>
              </button>
            ))}
          </div>
          {errors.categoria && <p className="text-xs text-red-500 mt-1">{errors.categoria.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="label">Descripción <span className="text-slate-400">(opcional)</span></label>
          <input
            type="text"
            placeholder="¿En qué gastaste?"
            className="input-field"
            {...register('descripcion')}
          />
        </div>

        {/* Date */}
        <div>
          <label className="label">Fecha</label>
          <input
            type="date"
            className={cn('input-field', errors.fecha && 'border-red-400')}
            {...register('fecha')}
          />
          {errors.fecha && <p className="text-xs text-red-500 mt-1">{errors.fecha.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4"
        >
          <Check size={20} />
          {isEdit ? 'Guardar cambios' : 'Guardar movimiento'}
        </button>
      </form>
    </div>
  );
}
