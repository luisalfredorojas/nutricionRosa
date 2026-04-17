-- Tipo de paciente: 'privado' o 'empresa'
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS tipo_paciente TEXT NOT NULL DEFAULT 'empresa';
ALTER TABLE pacientes DROP CONSTRAINT IF EXISTS pacientes_tipo_paciente_check;
ALTER TABLE pacientes ADD CONSTRAINT pacientes_tipo_paciente_check
  CHECK (tipo_paciente IN ('privado', 'empresa'));
