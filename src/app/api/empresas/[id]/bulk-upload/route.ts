import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { calcularTodosLosIndicadores } from '@/lib/formulas/indicadores'
import type { SexoType } from '@/types/ficha'

const rowSchema = z.object({
  nombre: z.string().trim().min(2, 'Nombre requerido'),
  fecha_nacimiento: z.string().trim().min(1, 'Fecha de nacimiento requerida'),
  sexo: z.enum(['Femenino', 'Masculino']),
  correo: z.string().trim().email('Correo inválido').optional().or(z.literal('')).nullable(),
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
})

type RowInput = z.infer<typeof rowSchema>

interface RowResult {
  fila: number
  estado: 'creado' | 'saltado' | 'error'
  mensaje?: string
  nombre?: string
}

// Headers en español (matriz) → campos del schema
const HEADER_MAP: Record<string, string> = {
  'paciente': 'nombre',
  'fecha': 'fecha_consulta',
  'sexo': 'sexo',
  'fecha nac.': 'fecha_nacimiento',
  'fecha nac': 'fecha_nacimiento',
  'fecha nacimiento': 'fecha_nacimiento',
  'correo': 'correo',
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
}

// Columnas calculadas o ignoradas
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
  // Remove units and symbols: kg, cm, m, %
  const cleaned = s.replace(/\s*(kg|cm|mm|%)\s*$/i, '').replace(/\s*m\s*$/i, '').replace(',', '.').trim()
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

function parseDate(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null
  if (raw instanceof Date) return raw.toISOString().slice(0, 10)
  const s = String(raw).trim()
  if (!s || s === '—') return null
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  // DD-MM-YYYY or DD/MM/YYYY
  const m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (m) {
    const [, dd, mm, yyyy] = m
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
  }
  // Try Date parse fallback
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

    const { data: existentes } = await supabase
      .from('pacientes')
      .select('nombre, correo')
      .eq('empresa_id', empresaId)

    const duplicadoKey = (nombre: string, correo: string | null | undefined) =>
      `${nombre.trim().toLowerCase()}|${(correo || '').trim().toLowerCase()}`

    const existentesSet = new Set(
      (existentes ?? []).map((p) => duplicadoKey(p.nombre as string, p.correo as string | null))
    )

    const results: RowResult[] = []
    let creados = 0
    let saltados = 0
    let errores = 0

    for (let i = 0; i < rowsInput.length; i++) {
      const filaNum = i + 2
      const mapped = mapRow(rowsInput[i] as Record<string, unknown>)
      const parsed = rowSchema.safeParse(mapped)

      if (!parsed.success) {
        errores++
        const msg = parsed.error.issues
          .map((iss) => `${iss.path.join('.')}: ${iss.message}`)
          .join('; ')
        results.push({ fila: filaNum, estado: 'error', mensaje: msg })
        continue
      }

      const row: RowInput = parsed.data
      const key = duplicadoKey(row.nombre, row.correo)

      if (existentesSet.has(key)) {
        saltados++
        results.push({ fila: filaNum, estado: 'saltado', nombre: row.nombre, mensaje: 'Paciente ya existe (nombre + correo)' })
        continue
      }

      const { data: paciente, error: pacErr } = await supabase
        .from('pacientes')
        .insert({
          nombre: row.nombre,
          fecha_nacimiento: row.fecha_nacimiento,
          sexo: row.sexo,
          correo: row.correo || null,
          ciudad: row.ciudad || null,
          tipo_paciente: 'empresa',
          empresa_id: empresaId,
        })
        .select('id')
        .single()

      if (pacErr || !paciente) {
        errores++
        results.push({ fila: filaNum, estado: 'error', nombre: row.nombre, mensaje: pacErr?.message ?? 'Error creando paciente' })
        continue
      }

      const indicadores = calcularTodosLosIndicadores({
        pesoKg: row.peso_kg ?? null,
        tallaM: row.talla_m ?? null,
        cintura: row.circunferencia_cintura ?? null,
        cadera: row.circunferencia_cadera ?? null,
        porcentajeGrasa: row.porcentaje_masa_grasa ?? null,
        porcentajeMusculo: row.porcentaje_masa_muscular ?? null,
        grasaVisceral: row.grasa_visceral ?? null,
        sexo: row.sexo as SexoType,
      })

      const { error: fichaErr } = await supabase.from('fichas_nutricionales').insert({
        paciente_id: paciente.id,
        fecha_consulta: row.fecha_consulta || new Date().toISOString().slice(0, 10),
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
        peso_ideal: indicadores.pesoIdeal,
        dx_grasa: indicadores.dxGrasa,
        dx_musculo: indicadores.dxMusculo,
        riesgo_metabolico: indicadores.riesgoMetabolico,
      })

      if (fichaErr) {
        errores++
        results.push({ fila: filaNum, estado: 'error', nombre: row.nombre, mensaje: `Paciente creado pero ficha falló: ${fichaErr.message}` })
        continue
      }

      existentesSet.add(key)
      creados++
      results.push({ fila: filaNum, estado: 'creado', nombre: row.nombre })
    }

    return NextResponse.json({
      resumen: { total: rowsInput.length, creados, saltados, errores },
      resultados: results,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
