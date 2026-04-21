-- Migration 005: balanza configs, le_gusta_comer, FUM, circunferencia_brazo

-- Balanza configs (flexible, list of custom fields per config)
CREATE TABLE balanza_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE balanza_campos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  balanza_id UUID NOT NULL REFERENCES balanza_configs(id) ON DELETE CASCADE,
  nombre_campo TEXT NOT NULL,
  unidad TEXT NOT NULL CHECK (unidad IN ('%', 'kg', 'lb')),
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_balanza_campos_balanza_id ON balanza_campos(balanza_id);

ALTER TABLE balanza_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE balanza_campos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access" ON balanza_configs
  FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated full access" ON balanza_campos
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Fichas: new columns
ALTER TABLE fichas_nutricionales
  ADD COLUMN balanza_id UUID REFERENCES balanza_configs(id),
  ADD COLUMN le_gusta_comer TEXT,
  ADD COLUMN fecha_ultima_menstruacion DATE,
  ADD COLUMN circunferencia_brazo DECIMAL(5,2);

-- Seed initial balanzas
INSERT INTO balanza_configs (nombre) VALUES ('Omron'), ('Tanita')
ON CONFLICT (nombre) DO NOTHING;

-- Default fields for Omron
INSERT INTO balanza_campos (balanza_id, nombre_campo, unidad, orden)
SELECT id, 'Peso', 'kg', 1 FROM balanza_configs WHERE nombre = 'Omron'
UNION ALL
SELECT id, 'Masa grasa', '%', 2 FROM balanza_configs WHERE nombre = 'Omron'
UNION ALL
SELECT id, 'Masa muscular', '%', 3 FROM balanza_configs WHERE nombre = 'Omron'
UNION ALL
SELECT id, 'Grasa visceral', '%', 4 FROM balanza_configs WHERE nombre = 'Omron';

-- Default fields for Tanita
INSERT INTO balanza_campos (balanza_id, nombre_campo, unidad, orden)
SELECT id, 'Peso', 'kg', 1 FROM balanza_configs WHERE nombre = 'Tanita'
UNION ALL
SELECT id, 'Masa grasa', '%', 2 FROM balanza_configs WHERE nombre = 'Tanita'
UNION ALL
SELECT id, 'Masa muscular', '%', 3 FROM balanza_configs WHERE nombre = 'Tanita'
UNION ALL
SELECT id, 'Grasa visceral', '%', 4 FROM balanza_configs WHERE nombre = 'Tanita';
