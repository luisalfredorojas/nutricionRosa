-- =============================================
-- NutricionRosa — Seed Data para desarrollo local
-- =============================================

-- Insertar empresas de ejemplo
INSERT INTO empresas (id, nombre) VALUES
  ('11111111-1111-1111-1111-111111111111', 'TechCorp Chile'),
  ('22222222-2222-2222-2222-222222222222', 'Minera Norte S.A.'),
  ('33333333-3333-3333-3333-333333333333', 'Banco Central')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar pacientes
INSERT INTO pacientes (id, nombre, fecha_nacimiento, sexo, correo, ciudad, empresa_id) VALUES
  ('aaaa0001-0000-0000-0000-000000000001', 'María González López', '1988-03-15', 'Femenino', 'maria.g@techcorp.cl', 'Santiago', '11111111-1111-1111-1111-111111111111'),
  ('aaaa0002-0000-0000-0000-000000000002', 'Valentina Morales', '1992-07-22', 'Femenino', 'v.morales@techcorp.cl', 'Providencia', '11111111-1111-1111-1111-111111111111'),
  ('aaaa0003-0000-0000-0000-000000000003', 'Carolina Soto Rivera', '1985-11-08', 'Femenino', 'csoto@minera.cl', 'Antofagasta', '22222222-2222-2222-2222-222222222222'),
  ('aaaa0004-0000-0000-0000-000000000004', 'Jorge Fuentes', '1979-05-30', 'Masculino', 'jfuentes@minera.cl', 'Antofagasta', '22222222-2222-2222-2222-222222222222'),
  ('aaaa0005-0000-0000-0000-000000000005', 'Andrea Castillo', '1995-02-14', 'Femenino', 'a.castillo@banco.cl', 'Santiago', '33333333-3333-3333-3333-333333333333'),
  ('aaaa0006-0000-0000-0000-000000000006', 'Roberto Herrera', '1983-09-27', 'Masculino', 'r.herrera@banco.cl', 'Las Condes', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO NOTHING;

-- Fichas primera consulta
INSERT INTO fichas_nutricionales (
  paciente_id, fecha_consulta, motivo_consulta,
  peso_kg, talla_m, circunferencia_cintura, circunferencia_cadera,
  porcentaje_masa_grasa, porcentaje_masa_muscular, edad_metabolica, grasa_visceral,
  digestion, descanso, nivel_estres, consumo_agua, consumo_frutas, consumo_vegetales,
  actividad_fisica, consumo_alcohol, consumo_tabaco,
  peso_ideal, dx_grasa, dx_musculo, riesgo_metabolico
) VALUES
  ('aaaa0001-0000-0000-0000-000000000001', '2024-06-01', 'Bajar de peso y mejorar composición corporal',
   72.5, 1.63, 86, 102, 32.4, 26.8, 38, 11,
   'Normal', '5-7 horas', 'Medio', 'Entre 1 - 1,5 lts', '< 2 veces por semana', 'Ocasional',
   'Bajo (1 o 2 veces por semana)', 'Mensual', 'No consume',
   57.2, 'Obesidad', 'Normal', 'Moderado'),
  ('aaaa0002-0000-0000-0000-000000000002', '2024-06-05', 'Control nutricional general',
   58.0, 1.58, 74, 96, 27.5, 29.2, 30, 7,
   'Normal', '> 7 horas', 'Bajo', 'Entre 2 - 2,5 lts', '> 4 veces por semana', '> 3 veces por semana',
   'Moderado (3 a 4 veces por semana)', 'No consume', 'No consume',
   53.8, 'Promedio', 'Normal', 'Bajo'),
  ('aaaa0003-0000-0000-0000-000000000003', '2024-06-10', 'Reducir grasa corporal y estrés',
   80.2, 1.67, 92, 108, 38.1, 24.3, 45, 14,
   'Irregular', '4-5 horas', 'Alto', 'Menos de 1 lt', 'Ocasional', 'Ocasional',
   'No realiza', 'Semanal', 'No consume',
   61.0, 'Obesidad', 'Bajo', 'Alto'),
  ('aaaa0004-0000-0000-0000-000000000004', '2024-06-12', 'Mejorar masa muscular y hábitos',
   88.5, 1.75, 98, 105, 24.8, 38.5, 42, 9,
   'Normal', '5-7 horas', 'Medio', 'Entre 1 - 1,5 lts', 'Ocasional', '< 2 veces por semana',
   'Bajo (1 o 2 veces por semana)', 'Mensual', 'No consume',
   76.5, 'Promedio', 'Normal', 'Moderado'),
  ('aaaa0005-0000-0000-0000-000000000005', '2024-06-15', 'Alimentación saludable en trabajo sedentario',
   62.3, 1.62, 78, 99, 29.8, 27.4, 33, 8,
   'Normal', '5-7 horas', 'Ocasional', 'Entre 1 - 1,5 lts', '> 4 veces por semana', '> 3 veces por semana',
   'Moderado (3 a 4 veces por semana)', 'No consume', 'No consume',
   55.7, 'Promedio', 'Normal', 'Bajo'),
  ('aaaa0006-0000-0000-0000-000000000006', '2024-06-18', 'Control de peso y salud cardiovascular',
   92.0, 1.72, 105, 112, 28.2, 36.8, 50, 15,
   'Estrenimiento', '4-5 horas', 'Alto', 'Menos de 1 lt', 'Ocasional', 'Ocasional',
   'No realiza', 'Semanal', 'Mensual',
   73.0, 'Promedio', 'Normal', 'Muy alto');

-- Fichas segunda consulta (3 meses después)
INSERT INTO fichas_nutricionales (
  paciente_id, fecha_consulta, motivo_consulta,
  peso_kg, talla_m, circunferencia_cintura, circunferencia_cadera,
  porcentaje_masa_grasa, porcentaje_masa_muscular, edad_metabolica, grasa_visceral,
  digestion, descanso, nivel_estres, consumo_agua, consumo_frutas, consumo_vegetales,
  actividad_fisica, consumo_alcohol, consumo_tabaco,
  peso_ideal, dx_grasa, dx_musculo, riesgo_metabolico
) VALUES
  ('aaaa0001-0000-0000-0000-000000000001', '2024-09-01', 'Seguimiento evolución',
   68.8, 1.63, 81, 100, 29.2, 28.5, 36, 9,
   'Normal', '5-7 horas', 'Bajo', 'Entre 2 - 2,5 lts', '> 4 veces por semana', '> 3 veces por semana',
   'Moderado (3 a 4 veces por semana)', 'No consume', 'No consume',
   57.2, 'Promedio', 'Normal', 'Bajo'),
  ('aaaa0002-0000-0000-0000-000000000002', '2024-09-05', 'Seguimiento evolución',
   56.5, 1.58, 71, 95, 25.8, 31.0, 28, 6,
   'Normal', '> 7 horas', 'Bajo', 'Entre 2 - 2,5 lts', '> 4 veces por semana', '> 3 veces por semana',
   'Moderado (3 a 4 veces por semana)', 'No consume', 'No consume',
   53.8, 'Fitness', 'Normal', 'Bajo'),
  ('aaaa0003-0000-0000-0000-000000000003', '2024-09-10', 'Seguimiento evolución',
   76.5, 1.67, 88, 106, 34.2, 26.1, 42, 12,
   'Normal', '5-7 horas', 'Medio', 'Entre 1 - 1,5 lts', '< 2 veces por semana', 'Ocasional',
   'Bajo (1 o 2 veces por semana)', 'Mensual', 'No consume',
   61.0, 'Obesidad', 'Normal', 'Moderado'),
  ('aaaa0004-0000-0000-0000-000000000004', '2024-09-12', 'Seguimiento evolución',
   86.0, 1.75, 95, 104, 22.5, 40.8, 40, 8,
   'Normal', '5-7 horas', 'Bajo', 'Entre 2 - 2,5 lts', '> 4 veces por semana', '> 3 veces por semana',
   'Moderado (3 a 4 veces por semana)', 'No consume', 'No consume',
   76.5, 'Fitness', 'Alto', 'Bajo'),
  ('aaaa0005-0000-0000-0000-000000000005', '2024-09-15', 'Seguimiento evolución',
   60.8, 1.62, 75, 98, 27.5, 28.9, 31, 7,
   'Normal', '> 7 horas', 'Bajo', 'Entre 2 - 2,5 lts', '> 4 veces por semana', '> 3 veces por semana',
   'Moderado (3 a 4 veces por semana)', 'No consume', 'No consume',
   55.7, 'Promedio', 'Normal', 'Bajo'),
  ('aaaa0006-0000-0000-0000-000000000006', '2024-09-18', 'Seguimiento evolución',
   89.5, 1.72, 102, 111, 26.5, 38.2, 47, 14,
   'Normal', '5-7 horas', 'Medio', 'Entre 1 - 1,5 lts', 'Ocasional', '< 2 veces por semana',
   'Bajo (1 o 2 veces por semana)', 'Mensual', 'No consume',
   73.0, 'Promedio', 'Alto', 'Alto');
