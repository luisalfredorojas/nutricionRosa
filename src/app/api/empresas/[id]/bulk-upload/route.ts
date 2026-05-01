import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { calcularTodosLosIndicadores } from '@/lib/formulas/indicadores'
import type { SexoType } from '@/types/ficha'

// ── Esquemas ─────────────────────────────────────────────────────────────────
const patientSchema = z.object({
  nombre: z.string().trim().min(2, 'Nombre requerido'),
  fecha_nacimiento: z.string().trim().min(1, 'Fecha de nacimiento requerida'),
  sexo: z.enum(['Femenino', 'Masculino']),
  correo: z.string().trim().email('Correo inválido').min(1, 'Correo requerido'),
  ciudad: z.string().trim().optional().nullable(),
})

const fichaSchema = z.object({
  fecha_consulta: z.string().trim().min(1, 'Fecha de la ficha requerida'),
  peso_kg: z.number().min(1).max(500).optional().nullable(),
  talla_m: z.number().min(0.5).max(2.5).optional().nullable(),
  circunferencia_cintura: z.number().min(1).max(300).optional().nullable(),
  circunferencia_cadera: z.number().min(1).max(300).optional().nullable(),
  porcentaje_masa_grasa: z.number().min(0).max(100).optional().nullable(),
  porcentaje_masa_muscular: z.number().min(0).max(100).optional().nullable(),
  edad_metabolica: z.number().min(1).max(120).optional().nullable(),
  grasa_visceral: z.number().min(0).max(50).optional().nullable(),
  actividad_fisica: z.string().optional().nullable(),
  descanso: z.string().optional().nullable(),
  nivel_estres: z.string().optional().nullable(),
  digestion: z.enum(['Irregular', 'Normal', 'Estrenimiento', 'Diarrea']).optional().nullable(),
  consumo_agua: z.enum(['Menos de 1 lt', 'Entre 1 - 1,5 lts', 'Entre 2 - 2,5 lts', '> 3 lts']).optional().nullable(),
  consumo_frutas: z.enum(['Ocasional', '> 4 veces por semana', '< 2 veces por semana']).optional().nullable(),
  consumo_vegetales: z.enum(['Ocasional', '> 3 veces por semana', '< 2 veces por semana']).optional().nullable(),
  consumo_cafe: z.enum(['Todos los dias', '> 3 veces por semana', 'Irregular']).optional().nullable(),
  consumo_alcohol: z.enum(['No consume', 'Semanal', 'Mensual']).optional().nullable(),
  consumo_tabaco: z.enum(['No consume', 'Semanal', 'Mensual']).optional().nullable(),
})

type PatientInput = z.infer<typeof patientSchema>
type FichaInput = z.infer<typeof fichaSchema>

interface RowResult {
  fila: number
  estado: 'creado' | 'error'
  mensaje?: string
  nombre?: string
  correo?: string
  tipo?: 'inicial' | 'seguimiento'
  ficha?: number
}

interface ParsedFicha {
  index: number // 1-based
  data: FichaInput
}

interface ParsedRow {
  filaNum: number
  patient: PatientInput
  fichas: ParsedFicha[]
}

// ── Mapas de cabeceras ───────────────────────────────────────────────────────
const PATIENT_HEADER_MAP: Record<string, keyof PatientInput> = {
  'paciente': 'nombre',
  'nombre': 'nombre',
  'sexo': 'sexo',
  'correo': 'correo',
  'fecha nac.': 'fecha_nacimiento',
  'fecha nac': 'fecha_nacimiento',
  'fecha nacimiento': 'fecha_nacimiento',
  'ciudad': 'ciudad',
}

const FICHA_HEADER_MAP: Record<string, keyof FichaInput> = {
  'fecha': 'fecha_consulta',
  'peso': 'peso_kg',
  'talla': 'talla_m',
  'cintura': 'circunferencia_cintura',
  'cadera': 'circunferencia_cadera',
  '% grasa': 'porcentaje_masa_grasa',
  '% músculo': 'porcentaje_masa_muscular',
  '% musculo': 'porcentaje_masa_muscular',
  'edad met.': 'edad_metabolica',
  'edad met': 'edad_metabolica',
  'gr. visceral': 'grasa_visceral',
  'gr visceral': 'grasa_visceral',
  'actividad': 'actividad_fisica',
  'descanso': 'descanso',
  'estrés': 'nivel_estres',
  'estres': 'nivel_estres',
  'digestión': 'digestion',
  'digestion': 'digestion',
  'agua': 'consumo_agua',
  'frutas': 'consumo_frutas',
  'vegetales': 'consumo_vegetales',
  'café': 'consumo_cafe',
  'cafe': 'consumo_cafe',
  'alcohol': 'consumo_alcohol',
  'tabaco': 'consumo_tabaco',
}

const IGNORED_HEADERS = new Set([
  'empresa',
  'imc',
  'icc',
  'dx grasa',
  'dx músculo',
  'dx musculo',
  'riesgo met.',
  'riesgo met',
])

const NUMERIC_FICHA_FIELDS = new Set<keyof FichaInput>([
  'peso_kg',
  'talla_m',
  'circunferencia_cintura',
  'circunferencia_cadera',
  'porcentaje_masa_grasa',
  'porcentaje_masa_muscular',
  'edad_metabolica',
  'grasa_visceral',
])

// ── Helpers ──────────────────────────────────────────────────────────────────
function stripNumeric(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null
  const s = String(raw).trim()
  if (!s || s === '—' || s === '-') return null
  const cleaned = s.replace(/\s*(kg|cm|mm|%)\s*$/i, '').replace(/\s*m\s*$/i, '').replace(',', '.').trim()
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

function parseDate(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null
  if (raw instanceof Date) return raw.toISOString().slice(0, 10)
  const s = String(raw).trim()
  if (!s || s === '—') return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (m) {
    const [, dd, mm, yyyy] = m
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
  }
  const d = new Date(s)
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  return null
}

function cleanString(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null
  const s = String(raw).trim()
  if (!s || s === '—') return null
  return s
}

function daysBetween(dateA: string, dateB: string): number {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.floor((new Date(dateB).getTime() - new Date(dateA).getTime()) / msPerDay)
}

/**
 * Extrae el sufijo (N) del header. Devuelve { base, index }.
 * Ej. "Peso (1)" → { base: "peso", index: 1 }
 *     "Correo"   → { base: "correo", index: null }
 */
function parseHeaderSuffix(header: string): { base: string; index: number | null } {
  const m = header.trim().match(/^(.*?)\s*\((\d+)\)\s*$/)
  if (m) {
    return { base: m[1].trim().toLowerCase(), index: parseInt(m[2], 10) }
  }
  return { base: header.trim().toLowerCase(), index: null }
}

function isFichaEmpty(f: Partial<FichaInput>): boolean {
  // Una ficha se considera vacía si no tiene fecha ni ningún dato numérico/texto
  if (f.fecha_consulta) return false
  for (const key of Object.keys(f) as (keyof FichaInput)[]) {
    const v = f[key]
    if (v !== null && v !== undefined && v !== '') return false
  }
  return true
}

/**
 * Parsea una fila cruda del Excel y devuelve los campos del paciente +
 * un mapa indexado de fichas detectadas por el sufijo (N).
 */
function mapRow(raw: Record<string, unknown>): {
  patient: Record<string, unknown>
  fichas: Map<number, Record<string, unknown>>
} {
  const patient: Record<string, unknown> = {}
  const fichas = new Map<number, Record<string, unknown>>()

  for (const [rawKey, value] of Object.entries(raw)) {
    const { base, index } = parseHeaderSuffix(rawKey)
    if (IGNORED_HEADERS.has(base)) continue

    if (index === null) {
      // Campo del paciente (sin sufijo)
      const field = PATIENT_HEADER_MAP[base]
      if (!field) continue
      if (field === 'fecha_nacimiento') {
        patient[field] = parseDate(value)
      } else {
        patient[field] = cleanString(value)
      }
    } else {
      // Campo de ficha (con sufijo)
      const field = FICHA_HEADER_MAP[base]
      if (!field) continue
      if (!fichas.has(index)) fichas.set(index, {})
      const target = fichas.get(index)!
      if (NUMERIC_FICHA_FIELDS.has(field)) {
        target[field] = stripNumeric(value)
      } else if (field === 'fecha_consulta') {
        target[field] = parseDate(value)
      } else {
        target[field] = cleanString(value)
      }
    }
  }

  return { patient, fichas }
}

function buildFichaPayload(
  ficha: FichaInput,
  pacienteId: string,
  tipo: 'inicial' | 'seguimiento',
  fichaPadreId: string | null,
  sexo: SexoType
) {
  const indicadores = calcularTodosLosIndicadores({
    pesoKg: ficha.peso_kg ?? null,
    tallaM: ficha.talla_m ?? null,
    cintura: ficha.circunferencia_cintura ?? null,
    cadera: ficha.circunferencia_cadera ?? null,
    porcentajeGrasa: ficha.porcentaje_masa_grasa ?? null,
    porcentajeMusculo: ficha.porcentaje_masa_muscular ?? null,
    grasaVisceral: ficha.grasa_visceral ?? null,
    sexo,
  })

  return {
    paciente_id: pacienteId,
    tipo,
    ficha_padre_id: fichaPadreId,
    fecha_consulta: ficha.fecha_consulta,
    peso_kg: ficha.peso_kg ?? null,
    talla_m: ficha.talla_m ?? null,
    circunferencia_cintura: ficha.circunferencia_cintura ?? null,
    circunferencia_cadera: ficha.circunferencia_cadera ?? null,
    porcentaje_masa_grasa: ficha.porcentaje_masa_grasa ?? null,
    porcentaje_masa_muscular: ficha.porcentaje_masa_muscular ?? null,
    edad_metabolica: ficha.edad_metabolica ?? null,
    grasa_visceral: ficha.grasa_visceral ?? null,
    actividad_fisica: ficha.actividad_fisica ?? null,
    descanso: ficha.descanso ?? null,
    nivel_estres: ficha.nivel_estres ?? null,
    digestion: ficha.digestion ?? null,
    consumo_agua: ficha.consumo_agua ?? null,
    consumo_frutas: ficha.consumo_frutas ?? null,
    consumo_vegetales: ficha.consumo_vegetales ?? null,
    consumo_cafe: ficha.consumo_cafe ?? null,
    consumo_alcohol: ficha.consumo_alcohol ?? null,
    consumo_tabaco: ficha.consumo_tabaco ?? null,
    peso_ideal: indicadores.pesoIdeal,
    dx_grasa: indicadores.dxGrasa,
    dx_musculo: indicadores.dxMusculo,
    riesgo_metabolico: indicadores.riesgoMetabolico,
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const empresaId = params.id
    const supabase = await createClient()

    const { data: empresa } = await supabase
      .from('empresas')
      .select('id')
      .eq('id', empresaId)
      .single()

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const rowsInput = Array.isArray(body?.rows) ? body.rows : []

    if (rowsInput.length === 0) {
      return NextResponse.json({ error: 'No hay filas para procesar' }, { status: 400 })
    }

    // ── 1. Parse y validar paciente + fichas por fila ──────────────────────
    const parsed: ParsedRow[] = []
    const results: RowResult[] = []
    let errores = 0

    for (let i = 0; i < rowsInput.length; i++) {
      const filaNum = i + 2
      const { patient: rawPatient, fichas: rawFichas } = mapRow(rowsInput[i] as Record<string, unknown>)

      const patientResult = patientSchema.safeParse(rawPatient)
      if (!patientResult.success) {
        errores++
        const msg = patientResult.error.issues
          .map((iss) => `${iss.path.join('.')}: ${iss.message}`)
          .join('; ')
        results.push({ fila: filaNum, estado: 'error', mensaje: `Datos del paciente: ${msg}` })
        continue
      }

      // Validar y filtrar fichas no vacías, ordenadas por índice ascendente
      const fichaIndexes = Array.from(rawFichas.keys()).sort((a, b) => a - b)
      const validFichas: ParsedFicha[] = []
      let rowHasError = false

      for (const idx of fichaIndexes) {
        const rawFicha = rawFichas.get(idx)!
        if (isFichaEmpty(rawFicha)) continue

        const fichaResult = fichaSchema.safeParse(rawFicha)
        if (!fichaResult.success) {
          errores++
          rowHasError = true
          const msg = fichaResult.error.issues
            .map((iss) => `${iss.path.join('.')}: ${iss.message}`)
            .join('; ')
          results.push({
            fila: filaNum,
            estado: 'error',
            nombre: patientResult.data.nombre,
            correo: patientResult.data.correo,
            ficha: idx,
            mensaje: `Ficha (${idx}): ${msg}`,
          })
          continue
        }
        validFichas.push({ index: idx, data: fichaResult.data })
      }

      if (rowHasError) continue
      if (validFichas.length === 0) {
        errores++
        results.push({
          fila: filaNum,
          estado: 'error',
          nombre: patientResult.data.nombre,
          correo: patientResult.data.correo,
          mensaje: 'No se encontró ninguna ficha con datos. Completa al menos la ficha (1).',
        })
        continue
      }

      parsed.push({ filaNum, patient: patientResult.data, fichas: validFichas })
    }

    // ── 2. Validar mínimo 14 días entre fichas consecutivas (por fila) ─────
    const invalidRows = new Set<number>()
    for (const row of parsed) {
      // ordenar por fecha_consulta ASC para validar separación
      const sorted = [...row.fichas].sort((a, b) =>
        a.data.fecha_consulta < b.data.fecha_consulta ? -1 : a.data.fecha_consulta > b.data.fecha_consulta ? 1 : 0
      )
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1].data.fecha_consulta
        const curr = sorted[i].data.fecha_consulta
        const dias = daysBetween(prev, curr)
        if (dias < 14) {
          invalidRows.add(row.filaNum)
          errores++
          results.push({
            fila: row.filaNum,
            estado: 'error',
            nombre: row.patient.nombre,
            correo: row.patient.correo,
            ficha: sorted[i].index,
            mensaje: `Debe haber al menos 14 días entre fichas. Entre ficha (${sorted[i - 1].index}) ${prev} y ficha (${sorted[i].index}) ${curr} hay solo ${dias} día${dias === 1 ? '' : 's'}.`,
          })
        }
      }
    }

    // ── 3. Detectar correos duplicados dentro del archivo ──────────────────
    const correoCount = new Map<string, number>()
    for (const row of parsed) {
      const key = row.patient.correo.toLowerCase()
      correoCount.set(key, (correoCount.get(key) ?? 0) + 1)
    }
    for (const row of parsed) {
      const key = row.patient.correo.toLowerCase()
      if ((correoCount.get(key) ?? 0) > 1 && !invalidRows.has(row.filaNum)) {
        invalidRows.add(row.filaNum)
        errores++
        results.push({
          fila: row.filaNum,
          estado: 'error',
          nombre: row.patient.nombre,
          correo: row.patient.correo,
          mensaje: 'Correo repetido en el archivo. Cada paciente debe estar en una sola fila con todas sus fichas.',
        })
      }
    }

    // ── 4. Fetch pacientes existentes de esta empresa ──────────────────────
    const { data: existentes } = await supabase
      .from('pacientes')
      .select('id, correo')
      .eq('empresa_id', empresaId)
      .not('correo', 'is', null)

    const existentesByCorreo = new Map<string, string>(
      (existentes ?? []).map((p) => [
        (p.correo as string).toLowerCase(),
        p.id as string,
      ])
    )

    // ── 5. Procesar cada fila ──────────────────────────────────────────────
    let nuevos = 0
    let seguimientos = 0

    for (const row of parsed) {
      if (invalidRows.has(row.filaNum)) continue

      const { filaNum, patient, fichas } = row
      const sexo = patient.sexo as SexoType
      const correoKey = patient.correo.toLowerCase()
      const existingPacienteId = existentesByCorreo.get(correoKey)

      // Ordenar fichas por fecha ASC para asegurar inicial = la más antigua
      const sortedFichas = [...fichas].sort((a, b) =>
        a.data.fecha_consulta < b.data.fecha_consulta ? -1 : a.data.fecha_consulta > b.data.fecha_consulta ? 1 : 0
      )

      let pacienteId: string
      let fichaInicialId: string | null = null
      let primeraFichaPendiente = 0

      if (!existingPacienteId) {
        // ── Paciente nuevo ───────────────────────────────────────────────
        const { data: newPaciente, error: pacErr } = await supabase
          .from('pacientes')
          .insert({
            nombre: patient.nombre,
            fecha_nacimiento: patient.fecha_nacimiento,
            sexo,
            correo: patient.correo,
            ciudad: patient.ciudad ?? null,
            tipo_paciente: 'empresa',
            empresa_id: empresaId,
          })
          .select('id')
          .single()

        if (pacErr || !newPaciente) {
          errores++
          results.push({
            fila: filaNum,
            estado: 'error',
            nombre: patient.nombre,
            correo: patient.correo,
            mensaje: pacErr?.message ?? 'Error creando paciente',
          })
          continue
        }
        pacienteId = newPaciente.id

        // Insertar primera ficha como inicial
        const first = sortedFichas[0]
        const { data: fichaInicial, error: fichaInicialErr } = await supabase
          .from('fichas_nutricionales')
          .insert(buildFichaPayload(first.data, pacienteId, 'inicial', null, sexo))
          .select('id')
          .single()

        if (fichaInicialErr || !fichaInicial) {
          errores++
          results.push({
            fila: filaNum,
            estado: 'error',
            nombre: patient.nombre,
            correo: patient.correo,
            ficha: first.index,
            mensaje: `Paciente creado pero ficha inicial falló: ${fichaInicialErr?.message}`,
          })
          continue
        }

        fichaInicialId = fichaInicial.id
        nuevos++
        results.push({
          fila: filaNum,
          estado: 'creado',
          nombre: patient.nombre,
          correo: patient.correo,
          tipo: 'inicial',
          ficha: first.index,
        })
        primeraFichaPendiente = 1
      } else {
        // ── Paciente existente ────────────────────────────────────────────
        pacienteId = existingPacienteId

        const { data: fichaInicialData, error: fetchErr } = await supabase
          .from('fichas_nutricionales')
          .select('id')
          .eq('paciente_id', pacienteId)
          .eq('tipo', 'inicial')
          .order('fecha_consulta', { ascending: true })
          .limit(1)
          .single()

        if (fetchErr || !fichaInicialData) {
          errores++
          results.push({
            fila: filaNum,
            estado: 'error',
            nombre: patient.nombre,
            correo: patient.correo,
            mensaje: 'Paciente existe pero sin ficha inicial. Créala manualmente primero.',
          })
          continue
        }
        fichaInicialId = fichaInicialData.id

        // Validar separación de 14 días contra última ficha en BD
        const { data: ultimaFichaDB } = await supabase
          .from('fichas_nutricionales')
          .select('fecha_consulta')
          .eq('paciente_id', pacienteId)
          .order('fecha_consulta', { ascending: false })
          .limit(1)
          .single()

        if (ultimaFichaDB?.fecha_consulta) {
          const dias = daysBetween(ultimaFichaDB.fecha_consulta, sortedFichas[0].data.fecha_consulta)
          if (dias < 14) {
            errores++
            results.push({
              fila: filaNum,
              estado: 'error',
              nombre: patient.nombre,
              correo: patient.correo,
              ficha: sortedFichas[0].index,
              mensaje: `Debe haber al menos 14 días desde la última ficha del paciente (${ultimaFichaDB.fecha_consulta}). La fecha ${sortedFichas[0].data.fecha_consulta} tiene solo ${dias} día${dias === 1 ? '' : 's'}.`,
            })
            continue
          }
        }
        // Para paciente existente todas las fichas son seguimientos
        primeraFichaPendiente = 0
      }

      // Insertar fichas restantes como seguimiento
      for (let i = primeraFichaPendiente; i < sortedFichas.length; i++) {
        const { index, data: fichaData } = sortedFichas[i]
        const { error: segErr } = await supabase
          .from('fichas_nutricionales')
          .insert(buildFichaPayload(fichaData, pacienteId, 'seguimiento', fichaInicialId, sexo))

        if (segErr) {
          errores++
          results.push({
            fila: filaNum,
            estado: 'error',
            nombre: patient.nombre,
            correo: patient.correo,
            ficha: index,
            mensaje: segErr.message,
          })
        } else {
          seguimientos++
          results.push({
            fila: filaNum,
            estado: 'creado',
            nombre: patient.nombre,
            correo: patient.correo,
            tipo: 'seguimiento',
            ficha: index,
          })
        }
      }
    }

    return NextResponse.json({
      resumen: { total: rowsInput.length, nuevos, seguimientos, errores },
      resultados: results,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
