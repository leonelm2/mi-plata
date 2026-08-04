-- ==============================================================================
-- MI PLATA - SCHEMA COMPLETO DE BASE DE DATOS Y SEGURIDAD SUPABASE (POSTGRESQL)
-- ==============================================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Perfiles de Usuario (Vinculada a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT 'Usuario',
  email TEXT NOT NULL UNIQUE,
  foto_url TEXT DEFAULT '',
  moneda TEXT NOT NULL DEFAULT 'ARS',
  modo_uso TEXT NOT NULL DEFAULT 'presupuesto' CHECK (modo_uso IN ('presupuesto', 'movimientos')),
  presupuesto_inicial NUMERIC(12,2) DEFAULT 0,
  fecha_inicio_presupuesto DATE,
  dia_reinicio_presupuesto INT DEFAULT 1,
  onboarding_completado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Transacciones Normalizada
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
  importe NUMERIC(12,2) NOT NULL CHECK (importe >= 0),
  categoria TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  fecha DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Índices para Consultas de Alto Rendimiento y Filtros
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_fecha ON public.transactions(user_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_tipo ON public.transactions(user_id, tipo);
CREATE INDEX IF NOT EXISTS idx_transactions_user_categoria ON public.transactions(user_id, categoria);

-- 5. Habilitar Row Level Security (RLS) en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de RLS para Tabla Profiles
CREATE POLICY "Los usuarios solo ven su propio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios solo insertan su propio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Los usuarios solo actualizan su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 7. Políticas de RLS para Tabla Transactions
CREATE POLICY "Los usuarios solo ven sus transacciones"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios solo insertan sus transacciones"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios solo actualizan sus transacciones"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios solo eliminan sus transacciones"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- 8. Trigger para crear perfil automáticamente al registrarse en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
