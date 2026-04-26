import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { calcularTodosLosIndicadores } from '@/lib/formulas/indicadores'
import type { SexoType } from '@/types/ficha'

const rowSchema = z.object({
  nombre: z.string().trim().min(2, 'Nombre requerido'),
  fecha_nacimiento: z.string().trim().min(1, 'Fecha de nacimiento requerida'),
  sexo: z.enum(['Femenino', 'Masculino']),
  correo: z.string().trim().email('Correo inválido').min(1, 'Correo requerido'),
  ciudad: z.string().trim().optional().nullable(),
  fecha_consulta: z.string().trim().optional().nullable(),
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

type RowInput = z.infer<typeof rowSchema>

interface RowResult {
  fila: number
  estado: 'creado' | 'error'
  mensaje?: string
  nombre?: string
  correo?: string
  tipo?: 'inicial' | 'seguimiento'
}

interface ParsedRow {
  filaNum: number
  row: RowInput
}

const HEADER_MAP: Record<string, string> = {
  'paciente': 'nombre',
  'fecha': 'fecha_consulta',
  'sexo': 'sexo',
  'correo': 'correo',
  'fecha nac.': 'fecha_nacimiento',
  'fecha nac': 'fecha_nacimiento',
  'fecha nacimiento': 'fecha_nacimiento',
  'ciudad': 'ciudad',
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

const NUMERIC_FIELDS = new Set([
  'peso_kg',
  'talla_m',
  'circunferencia_cintura',
  'circunferencia_cadera',
  'porcentaje_masa_grasa',
  'porcentaje_masa_muscular',
  'edad_metabolica',
  'grasa_visceral',
])

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

function mapRow(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(raw)) {
    const norm = key.trim().toLowerCase()
    if (IGNORED_HEADERS.has(norm)) continue
    const field = HEADER_MAP[norm]
    if (!field) continue
    if (NUMERIC_FIELDS.has(field)) {
      out[field] = stripNumeric(value)
    } else if (field === 'fecha_consulta' || field === 'fecha_nacimiento') {
      out[field] = parseDate(value)
    } else {
      out[field] = cleanString(value)
    }
  }
  return out
}

function buildFichaPayload(row: RowInput, pacienteId: string, tipo: 'inicial' | 'seguimiento', fichaPadreId: string | null, sexo: SexoType) {
  const indicadores = calcularTodosLosIndicadores({
    pesoKg: row.peso_kg ?? null,
    tallaM: row.talla_m ?? null,
    cintura: row.circunferencia_cintura ?? null,
    cadera: row.circunferencia_cadera ?? null,
    porcentajeGrasa: row.porcentaje_masa_grasa ?? null,
    porcentajeMusculo: row.porcentaje_masa_muscular ?? null,
    grasaVisceral: row.grasa_visceral ?? null,
    sexo,
  })

  return {
    paciente_id: pacienteId,
    tipo,
    ficha_padre_id: fichaPadreId,
    fecha_consulta: row.fecha_consulta ?? new Date().toISOString().slice(0, 10),
    peso_kg: row.peso_kg ?? null,
    talla_m: row.talla_m ?? null,
    circunferencia_cintura: row.circunferencia_cintura ?? null,
    circunferencia_cadera: row.circunferencia_cadera ?? null,
    porcentaje_masa_grasa: row.porcentaje_masa_grasa ?? null,
    porcentaje_masa_muscular: row.porcentaje_masa_muscular ?? null,
    edad_metabolica: row.edad_metabolica ?? null,
    grasa_visceral: row.grasa_visceral ?? null,
    actividad_fisica: row.actividad_fisica ?? null,
    descanso: row.descanso ?? null,
    nivel_estres: row.nivel_estres ?? null,
    digestion: row.digestion ?? null,
    consumo_agua: row.consumo_agua ?? null,
    consumo_frutas: row.consumo_frutas ?? null,
    consumo_vegetales: row.consumo_vegetales ?? null,
    consumo_cafe: row.consumo_cafe ?? null,
    consumo_alcohol: row.consumo_alcohol ?? null,
    consumo_tabaco: row.consumo_tabaco ?? null,
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

    // ── 1. Parse y validar todas las filas ──────────────────────────────
    const parsed: ParsedRow[] = []
    const results: RowResult[] = []
    let errores = 0

    for (let i = 0; i < rowsInput.length; i++) {
      const filaNum = i + 2
      const mapped = mapRow(rowsInput[i] as Record<string, unknown>)
      const result = rowSchema.safeParse(mapped)

      if (!result.success) {
        errores++
        const msg = result.error.issues
          .map((iss) => `${iss.path.join('.')}: ${iss.message}`)
          .join('; ')
        results.push({ fila: filaNum, estado: 'error', mensaje: msg })
      } else {
        parsed.push({ filaNum, row: result.data })
      }
    }

    // ── 2. Agrupar por correo y ordenar por fecha_consulta ASC ──────────
    const groups = new Map<string, ParsedRow[]>()
    for (const item of parsed) {
      const key = item.row.correo.toLowerCase()
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(item)
    }
    for (const rows of groups.values()) {
      rows.sort((a, b) => {
        const da = a.row.fecha_consulta ?? '9999'
        const db = b.row.fecha_consulta ?? '9999'
        return da < db ? -1 : da > db ? 1 : 0
      })
    }

    // ── 3. Fetch pacientes existentes de esta empresa ────────────────────
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

    // ── 4. Procesar cada grupo ───────────────────────────────────────────
    let nuevos = 0
    let seguimientos = 0

    for (const [correoKey, groupRows] of groups) {
      const firstRow = groupRows[0].row
      const sexo = firstRow.sexo as SexoType
      const existingPacienteId = existentesByCorreo.get(correoKey)

      if (!existingPacienteId) {
        // Paciente nuevo: crear paciente + ficha inicial
        const { data: paciente, error: pacErr } = await supabase
          .from('pacientes')
          .insert({
            nombre: firstRow.nombre,
            fecha_nacimiento: firstRow.fecha_nacimiento,
            sexo,
            correo: firstRow.correo,
            ciudad: firstRow.ciudad ?? null,
            tipo_paciente: 'empresa',
            empresa_id: empresaId,
          })
          .select('id')
          .single()

        if (pacErr || !paciente) {
          errores += groupRows.length
          for (const { filaNum, row } of groupRows) {
            results.push({
              fila: filaNum, estado: 'error',
              nombre: row.nombre, correo: row.correo,
              mensaje: pacErr?.message ?? 'Error creando paciente',
            })
          }
          continue
        }

        const pacienteId = paciente.id

        // Ficha inicial
        const { data: fichaInicial, error: fichaInicialErr } = await supabase
          .from('fichas_nutricionales')
          .insert(buildFichaPayload(firstRow, pacienteId, 'inicial', null, sexo))
          .select('id')
          .single()

        if (fichaInicialErr || !fichaInicial) {
          errores++
          results.push({
            fila: groupRows[0].filaNum, estado: 'error',
            nombre: firstRow.nombre, correo: firstRow.correo,
            mensaje: `Paciente creado pero ficha inicial falló: ${fichaInicialErr?.message}`,
          })
          continue
        }

        nuevos++
        results.push({
          fila: groupRows[0].filaNum, estado: 'creado',
          nombre: firstRow.nombre, correo: firstRow.correo,
          tipo: 'inicial',
        })

        // Seguimientos del mismo grupo
        for (const { filaNum, row } of groupRows.slice(1)) {
          const { error: segErr } = await supabase
            .from('fichas_nutricionales')
            .insert(buildFichaPayload(row, pacienteId, 'seguimiento', fichaInicial.id, sexo))

          if (segErr) {
            errores++
            results.push({ fila: filaNum, estado: 'error', nombre: row.nombre, correo: row.correo, mensaje: segErr.message })
          } else {
            seguimientos++
            results.push({ fila: filaNum, estado: 'creado', nombre: row.nombre, correo: row.correo, tipo: 'seguimiento' })
          }
        }

      } else {
        // Paciente existe: buscar su ficha inicial
        const pacienteId = existingPacienteId

        const { data: fichaInicialData, error: fetchErr } = await supabase
          .from('fichas_nutricionales')
          .select('id')
          .eq('paciente_id', pacienteId)
          .eq('tipo', 'inicial')
          .order('fecha_consulta', { ascending: true })
          .limit(1)
          .single()

        if (fetchErr || !fichaInicialData) {
          errores += groupRows.length
          for (const { filaNum, row } of groupRows) {
            results.push({
              fila: filaNum, estado: 'error',
              nombre: row.nombre, correo: row.correo,
              mensaje: 'Paciente existe pero sin ficha inicial. Créala manualmente primero.',
            })
          }
          continue
        }

        // Todas las filas son seguimientos
        for (const { filaNum, row } of groupRows) {
          const { error: segErr } = await supabase
            .from('fichas_nutricionales')
            .insert(buildFichaPayload(row, pacienteId, 'seguimiento', fichaInicialData.id, row.sexo as SexoType))

          if (segErr) {
            errores++
            results.push({ fila: filaNum, estado: 'error', nombre: row.nombre, correo: row.correo, mensaje: segErr.message })
          } else {
            seguimientos++
            results.push({ fila: filaNum, estado: 'creado', nombre: row.nombre, correo: row.correo, tipo: 'seguimiento' })
          }
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
