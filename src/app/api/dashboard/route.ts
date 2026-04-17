import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface DashboardData {
  // Section 1 — Mis pacientes
  totalPacientes: number
  mujeresCount: number
  mujeresPct: number
  hombresCount: number
  hombresPct: number
  ultimoPaciente: { nombre: string; created_at: string } | null

  // Section 2 — Peso
  totalMediciones: number
  pesoPromedio: number | null
  sumaKilosPerdidos: number
  mayorPesoPerdido: { nombre: string; kilos: number } | null

  // Section 3 — Grasa
  promedioGrasa: number | null
  distribucionGrasa: { label: string; count: number }[]
  menorGrasa: { nombre: string; valor: number } | null
  mayorGrasa: { nombre: string; valor: number } | null

  // Section 4 — IMC
  promedioIMC: number | null
  distribucionIMC: { label: string; count: number }[]
  menorIMC: { nombre: string; valor: number } | null
  mayorIMC: { nombre: string; valor: number } | null

  // Quick stats
  totalFichas: number
  totalEmpresas: number

  // Recent fichas
  ultimasFichas: {
    id: string
    fecha_consulta: string | null
    imc: number | null
    nombre: string | null
    empresa: string | null
  }[]
}

const GRASA_RANGES = [
  { label: '<10',   min: 0,   max: 10 },
  { label: '10-14', min: 10,  max: 15 },
  { label: '15-19', min: 15,  max: 20 },
  { label: '20-24', min: 20,  max: 25 },
  { label: '25-29', min: 25,  max: 30 },
  { label: '30-34', min: 30,  max: 35 },
  { label: '>34',   min: 35,  max: 999 },
]

const IMC_RANGES = [
  { label: '15-17', min: 15,  max: 18 },
  { label: '18-20', min: 18,  max: 21 },
  { label: '21-23', min: 21,  max: 24 },
  { label: '24-25', min: 24,  max: 26 },
  { label: '26-28', min: 26,  max: 29 },
  { label: '>28',   min: 29,  max: 999 },
]

function avg(arr: number[]): number | null {
  if (!arr.length) return null
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const desde = searchParams.get('desde')
    const hasta = searchParams.get('hasta')

    // ── 1. Pacientes (not date-filtered — always total) ──────────────────────
    const { data: pacientes } = await supabase
      .from('pacientes')
      .select('id, nombre, sexo, created_at')
      .order('created_at', { ascending: false })

    // ── 2. Fichas with date filter ───────────────────────────────────────────
    let fichasQuery = supabase
      .from('fichas_nutricionales')
      .select(`
        id, paciente_id, fecha_consulta, created_at,
        peso_kg, imc, porcentaje_masa_grasa,
        pacientes( nombre, empresas( nombre ) )
      `)
      .order('fecha_consulta', { ascending: true })

    if (desde) fichasQuery = fichasQuery.gte('fecha_consulta', desde)
    if (hasta) fichasQuery = fichasQuery.lte('fecha_consulta', hasta)

    const { data: fichasRaw } = await fichasQuery

    // ── 3. Quick stats ───────────────────────────────────────────────────────
    const [fichasCountRes, empresasCountRes] = await Promise.all([
      supabase.from('fichas_nutricionales').select('id', { count: 'exact', head: true }),
      supabase.from('empresas').select('id', { count: 'exact', head: true }),
    ])

    // ── 4. Recent fichas (not date-filtered) ─────────────────────────────────
    const { data: recentFichas } = await supabase
      .from('fichas_nutricionales')
      .select(`id, fecha_consulta, imc, pacientes( nombre, empresas( nombre ) )`)
      .order('created_at', { ascending: false })
      .limit(5)

    // ── Computations ─────────────────────────────────────────────────────────

    const allPacientes = pacientes ?? []
    const fichas = fichasRaw ?? []

    // Section 1 — patients
    const totalPacientes = allPacientes.length
    const mujeresCount = allPacientes.filter((p) => p.sexo === 'Femenino').length
    const hombresCount = allPacientes.filter((p) => p.sexo === 'Masculino').length
    const mujeresPct = totalPacientes > 0 ? (mujeresCount / totalPacientes) * 100 : 0
    const hombresPct = totalPacientes > 0 ? (hombresCount / totalPacientes) * 100 : 0
    const ultimoPaciente = allPacientes[0]
      ? { nombre: allPacientes[0].nombre, created_at: allPacientes[0].created_at }
      : null

    // Build latest/first ficha maps per patient (fichas sorted asc)
    type FichaRow = {
      id: string
      paciente_id: string
      fecha_consulta: string | null
      peso_kg: number | null
      imc: number | null
      porcentaje_masa_grasa: number | null
      pacientes: unknown
    }
    const latestMap = new Map<string, FichaRow>()
    const firstMap = new Map<string, FichaRow>()

    for (const f of fichas as FichaRow[]) {
      if (!firstMap.has(f.paciente_id)) firstMap.set(f.paciente_id, f)
      latestMap.set(f.paciente_id, f) // overwrite → last wins
    }

    // Section 2 — peso
    const totalMediciones = fichas.length
    const pesosLatest = Array.from(latestMap.values())
      .map((f) => f.peso_kg)
      .filter((p): p is number => p != null)
    const pesoPromedio = avg(pesosLatest)

    let sumaKilosPerdidos = 0
    let mayorPesoPerdido: { nombre: string; kilos: number } | null = null

    for (const [pid, latest] of latestMap) {
      const first = firstMap.get(pid)
      if (!first || first.id === latest.id) continue
      const diff = (first.peso_kg ?? 0) - (latest.peso_kg ?? 0)
      if (diff > 0) {
        sumaKilosPerdidos += diff
        if (!mayorPesoPerdido || diff > mayorPesoPerdido.kilos) {
          const p = latest.pacientes as { nombre: string } | null
          mayorPesoPerdido = { nombre: p?.nombre ?? '—', kilos: diff }
        }
      }
    }

    // Section 3 — grasa
    type GrasaEntry = { grasa: number; nombre: string }
    const grasaList: GrasaEntry[] = Array.from(latestMap.values())
      .filter((f) => f.porcentaje_masa_grasa != null)
      .map((f) => ({
        grasa: f.porcentaje_masa_grasa as number,
        nombre: (f.pacientes as { nombre: string } | null)?.nombre ?? '—',
      }))

    const promedioGrasa = avg(grasaList.map((g) => g.grasa))
    const sortedGrasa = [...grasaList].sort((a, b) => a.grasa - b.grasa)
    const menorGrasa = sortedGrasa[0]
      ? { nombre: sortedGrasa[0].nombre, valor: sortedGrasa[0].grasa }
      : null
    const lastG = sortedGrasa[sortedGrasa.length - 1]
    const mayorGrasa = lastG ? { nombre: lastG.nombre, valor: lastG.grasa } : null
    const distribucionGrasa = GRASA_RANGES.map((r) => ({
      label: r.label,
      count: grasaList.filter((g) => g.grasa >= r.min && g.grasa < r.max).length,
    })).filter((r) => r.count > 0)

    // Section 4 — IMC
    type ImcEntry = { imc: number; nombre: string }
    const imcList: ImcEntry[] = Array.from(latestMap.values())
      .filter((f) => f.imc != null)
      .map((f) => ({
        imc: f.imc as number,
        nombre: (f.pacientes as { nombre: string } | null)?.nombre ?? '—',
      }))

    const promedioIMC = avg(imcList.map((i) => i.imc))
    const sortedIMC = [...imcList].sort((a, b) => a.imc - b.imc)
    const menorIMC = sortedIMC[0] ? { nombre: sortedIMC[0].nombre, valor: sortedIMC[0].imc } : null
    const lastI = sortedIMC[sortedIMC.length - 1]
    const mayorIMC = lastI ? { nombre: lastI.nombre, valor: lastI.imc } : null
    const distribucionIMC = IMC_RANGES.map((r) => ({
      label: r.label,
      count: imcList.filter((i) => i.imc >= r.min && i.imc < r.max).length,
    })).filter((r) => r.count > 0)

    // Recent fichas
    const ultimasFichas = (recentFichas ?? []).map((f) => {
      const p = f.pacientes as unknown as { nombre: string; empresas: { nombre: string } | null } | null
      return {
        id: f.id,
        fecha_consulta: f.fecha_consulta,
        imc: f.imc,
        nombre: p?.nombre ?? null,
        empresa: p?.empresas?.nombre ?? null,
      }
    })

    const result: DashboardData = {
      totalPacientes,
      mujeresCount,
      mujeresPct,
      hombresCount,
      hombresPct,
      ultimoPaciente,
      totalMediciones,
      pesoPromedio,
      sumaKilosPerdidos,
      mayorPesoPerdido,
      promedioGrasa,
      distribucionGrasa,
      menorGrasa,
      mayorGrasa,
      promedioIMC,
      distribucionIMC,
      menorIMC,
      mayorIMC,
      totalFichas: fichasCountRes.count ?? 0,
      totalEmpresas: empresasCountRes.count ?? 0,
      ultimasFichas,
    }

    return NextResponse.json({ data: result })
  } catch (err) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
