-- =============================================
-- NutricionRosa — Schema Inicial
-- =============================================

-- Tabla: empresas
CREATE TABLE IF NOT EXISTS empresas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  sexo TEXT NOT NULL CHECK (sexo IN ('Femenino', 'Masculino')),
  correo TEXT,
  ciudad TEXT,
  empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: fichas_nutricionales
CREATE TABLE IF NOT EXISTS fichas_nutricionales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  fecha_consulta DATE DEFAULT CURRENT_DATE,

  -- Motivo
  motivo_consulta TEXT,

  -- Ficha Nutricional
  diagnostico_clinico TEXT,
  peso_kg DECIMAL(5,2),
  talla_m DECIMAL(3,2),
  imc DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN talla_m > 0 AND peso_kg > 0
    THEN ROUND(peso_kg / (talla_m * talla_m), 2)
    ELSE NULL END
  ) STORED,
  circunferencia_cintura DECIMAL(5,2),
  circunferencia_cadera DECIMAL(5,2),
  indice_cc DECIMAL(4,2) GENERATED ALWAYS AS (
    CASE WHEN circunferencia_cadera > 0 AND circunferencia_cintura > 0
    THEN ROUND(circunferencia_cintura / circunferencia_cadera, 2)
    ELSE NULL END
  ) STORED,
  recordatorio_24h TEXT,
  comentarios TEXT,

  -- Datos Balanza
  porcentaje_masa_grasa DECIMAL(5,2),
  porcentaje_masa_muscular DECIMAL(5,2),
  edad_metabolica INTEGER,
  grasa_visceral DECIMAL(5,2),

  -- Hábitos
  digestion TEXT CHECK (digestion IN ('Irregular', 'Normal', 'Estrenimiento', 'Diarrea')),
  descanso TEXT CHECK (descanso IN ('4-5 horas', '5-7 horas', '> 7 horas')),
  nivel_estres TEXT CHECK (nivel_estres IN ('Bajo', 'Medio', 'Alto', 'Ocasional')),
  consumo_agua TEXT CHECK (consumo_agua IN ('Menos de 1 lt', 'Entre 1 - 1,5 lts', 'Entre 2 - 2,5 lts', '> 3 lts')),
  consumo_frutas TEXT CHECK (consumo_frutas IN ('Ocasional', '> 4 veces por semana', '< 2 veces por semana')),
  consumo_vegetales TEXT CHECK (consumo_vegetales IN ('Ocasional', '> 3 veces por semana', '< 2 veces por semana')),
  actividad_fisica TEXT CHECK (actividad_fisica IN ('No realiza', 'Bajo (1 o 2 veces por semana)', 'Moderado (3 a 4 veces por semana)', 'Intenso (Hasta 6 veces por semana)')),
  consumo_cafe TEXT CHECK (consumo_cafe IN ('Todos los dias', '> 3 veces por semana', 'Irregular')),
  consumo_alcohol TEXT CHECK (consumo_alcohol IN ('No consume', 'Semanal', 'Mensual')),
  consumo_tabaco TEXT CHECK (consumo_tabaco IN ('No consume', 'Semanal', 'Mensual')),
  no_le_gusta_comer TEXT,

  -- Indicadores Calculados (calculados en frontend y guardados)
  peso_ideal DECIMAL(5,2),
  dx_grasa TEXT,
  dx_musculo TEXT,
  riesgo_metabolico TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Trigger: updated_at automático
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pacientes_updated_at
  BEFORE UPDATE ON pacientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER fichas_updated_at
  BEFORE UPDATE ON fichas_nutricionales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE fichas_nutricionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Solo usuarios autenticados tienen acceso completo
CREATE POLICY "Authenticated users full access" ON fichas_nutricionales
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users full access" ON pacientes
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users full access" ON empresas
  FOR ALL USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- Datos iniciales: Empresas de ejemplo
-- =============================================

INSERT INTO empresas (nombre) VALUES
  ('Empresa Demo'),
  ('Corporacion Ejemplo')
ON CONFLICT (nombre) DO NOTHING;
