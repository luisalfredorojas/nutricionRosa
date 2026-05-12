import { z } from 'zod'

// Convierte "" / null / undefined → null antes de coerce, para que campos
// opcionales numéricos no fallen con min() cuando el input HTML llega vacío.
const optionalNumber = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.coerce.number().min(min).max(max).nullable()
  )

export const datosPersonalesSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  fecha_nacimiento: z.string().min(1, 'La fecha de nacimiento es requerida'),
  sexo: z.enum(['Femenino', 'Masculino'], {
    errorMap: () => ({ message: 'Selecciona el sexo' }),
  }),
  correo: z.string().email('Correo electrónico inválido').min(1, 'El correo es requerido'),
  ciudad: z.string().optional(),
  tipo_paciente: z.enum(['privado', 'empresa']).default('empresa'),
  empresa_id: z.string().uuid('Empresa inválida').optional().or(z.literal('')),
})

export const fichaNutricionalSchema = z.object({
  fecha_consulta: z.string().min(1, 'La fecha de consulta es requerida'),
  motivo_consulta: z.string().optional(),
  diagnostico_clinico: z.string().optional(),
  peso_kg: optionalNumber(1, 500).optional(),
  talla_m: optionalNumber(0.5, 2.5).optional(),
  circunferencia_cintura: optionalNumber(1, 300).optional(),
  circunferencia_cadera: optionalNumber(1, 300).optional(),
  circunferencia_brazo: optionalNumber(1, 100).optional(),
  fecha_ultima_menstruacion: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.string().nullable().optional()
  ),
  recordatorio_24h: z.string().optional(),
  comentarios: z.string().optional(),
})

export const datosBalanzaSchema = z.object({
  balanza_id: z.string().uuid().optional().nullable().or(z.literal('')),
  porcentaje_masa_grasa: z.coerce.number().min(0, 'Mínimo 0%').max(100, 'Máximo 100%').optional().nullable(),
  porcentaje_masa_muscular: z.coerce.number().min(0, 'Mínimo 0%').max(100, 'Máximo 100%').optional().nullable(),
  edad_metabolica: optionalNumber(1, 120).optional(),
  grasa_visceral: z.coerce.number().min(0, 'Mínimo 0').max(50, 'Máximo 50').optional().nullable(),
})

export const habitosSchema = z.object({
  digestion: z.enum(['Irregular', 'Normal', 'Estrenimiento', 'Diarrea']).optional().nullable(),
  descanso: z.enum(['4-5 horas', '5-7 horas', '> 7 horas']).optional().nullable(),
  nivel_estres: z.enum(['Bajo', 'Medio', 'Alto', 'Ocasional']).optional().nullable(),
  consumo_agua: z.enum(['Menos de 1 lt', 'Entre 1 - 1,5 lts', 'Entre 2 - 2,5 lts', '> 3 lts']).optional().nullable(),
  consumo_frutas: z.enum(['Ocasional', '> 4 veces por semana', '< 2 veces por semana']).optional().nullable(),
  consumo_vegetales: z.enum(['Ocasional', '> 3 veces por semana', '< 2 veces por semana']).optional().nullable(),
  actividad_fisica: z.enum(['No realiza', 'Bajo (1 o 2 veces por semana)', 'Moderado (3 a 4 veces por semana)', 'Intenso (Hasta 6 veces por semana)']).optional().nullable(),
  consumo_cafe: z.enum(['Todos los dias', '> 3 veces por semana', 'Irregular']).optional().nullable(),
  consumo_alcohol: z.enum(['No consume', 'Semanal', 'Mensual']).optional().nullable(),
  consumo_tabaco: z.enum(['No consume', 'Semanal', 'Mensual']).optional().nullable(),
  no_le_gusta_comer: z.string().optional(),
  le_gusta_comer: z.string().optional(),
})

export const fichaCompletaSchema = datosPersonalesSchema
  .merge(fichaNutricionalSchema)
  .merge(datosBalanzaSchema)
  .merge(habitosSchema)

export type DatosPersonalesInput = z.infer<typeof datosPersonalesSchema>
export type FichaNutricionalInput = z.infer<typeof fichaNutricionalSchema>
export type DatosBalanzaInput = z.infer<typeof datosBalanzaSchema>
export type HabitosInput = z.infer<typeof habitosSchema>
export type FichaCompletaInput = z.infer<typeof fichaCompletaSchema>
