-- Secuencias para códigos legibles
CREATE SEQUENCE IF NOT EXISTS pacientes_codigo_seq;
CREATE SEQUENCE IF NOT EXISTS fichas_numero_seq;

-- Código único de paciente: PAC-0001, PAC-0002...
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS codigo TEXT;
UPDATE pacientes SET codigo = 'PAC-' || LPAD(nextval('pacientes_codigo_seq')::text, 4, '0') WHERE codigo IS NULL;
ALTER TABLE pacientes DROP CONSTRAINT IF EXISTS pacientes_codigo_unique;
ALTER TABLE pacientes ADD CONSTRAINT pacientes_codigo_unique UNIQUE (codigo);

-- Número único de ficha: F-0001, F-0002...
ALTER TABLE fichas_nutricionales ADD COLUMN IF NOT EXISTS numero_ficha TEXT;
-- Tipo: 'inicial' o 'seguimiento'
ALTER TABLE fichas_nutricionales ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'inicial';
-- Referencia a la ficha padre (NULL = ficha inicial)
ALTER TABLE fichas_nutricionales ADD COLUMN IF NOT EXISTS ficha_padre_id UUID REFERENCES fichas_nutricionales(id) ON DELETE SET NULL;

UPDATE fichas_nutricionales SET numero_ficha = 'F-' || LPAD(nextval('fichas_numero_seq')::text, 4, '0'), tipo = 'inicial' WHERE numero_ficha IS NULL;
ALTER TABLE fichas_nutricionales DROP CONSTRAINT IF EXISTS fichas_numero_unique;
ALTER TABLE fichas_nutricionales ADD CONSTRAINT fichas_numero_unique UNIQUE (numero_ficha);

-- Trigger auto-código paciente
CREATE OR REPLACE FUNCTION generate_paciente_codigo() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo IS NULL THEN
    NEW.codigo := 'PAC-' || LPAD(nextval('pacientes_codigo_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS pacientes_codigo_trigger ON pacientes;
CREATE TRIGGER pacientes_codigo_trigger BEFORE INSERT ON pacientes FOR EACH ROW EXECUTE FUNCTION generate_paciente_codigo();

-- Trigger auto-número ficha + tipo automático
CREATE OR REPLACE FUNCTION generate_ficha_numero() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero_ficha IS NULL THEN
    NEW.numero_ficha := 'F-' || LPAD(nextval('fichas_numero_seq')::text, 4, '0');
  END IF;
  IF NEW.tipo IS NULL THEN
    NEW.tipo := CASE WHEN NEW.ficha_padre_id IS NOT NULL THEN 'seguimiento' ELSE 'inicial' END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS fichas_numero_trigger ON fichas_nutricionales;
CREATE TRIGGER fichas_numero_trigger BEFORE INSERT ON fichas_nutricionales FOR EACH ROW EXECUTE FUNCTION generate_ficha_numero();
