import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type Scope = 'empresa' | 'privado'

interface FichaRow {
  id: string
  paciente_id: string
  fecha_consulta: string
  tipo: string | null
  peso_kg: number | null
  imc: number | null
  porcentaje_masa_grasa: number | null
  porcentaje_masa_muscular: number | null
  digestion: string | null
  descanso: string | null
  nivel_estres: string | null
  consumo_agua: string | null
  consumo_frutas: string | null
  consumo_vegetales: string | null
  actividad_fisica: string | null
  pacientes: {
    id: string
    nombre: string
    sexo: string | null
    empresa_id: string | null
    tipo_paciente: string | null
  } | null
}

interface CountItem {
  valor: string
  count: number
}

function clasificarIMC(imc: number): string {
  if (imc < 18.5) return 'Bajo peso'
  if (imc < 25) return 'Normal'
  if (imc < 30) return 'Sobrepeso'
  if (imc < 35) return 'Obesidad I'
  if (imc < 40) return 'Obesidad II'
  return 'Obesidad III'
}

function countBy(values: (string | null)[]): CountItem[] {
  const map = new Map<string, number>()
  for (const v of values) {
    if (!v) continue
    map.set(v, (map.get(v) ?? 0) + 1)
  }
  return Array.from(map.entries()).map(([valor, count]) => ({ valor, count }))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const scope = (searchParams.get('scope') ?? 'empresa') as Scope
    const empresaId = searchParams.get('empresa_id')
    const pacienteId = searchParams.get('paciente_id')
    const fechaDesde = searchParams.get('fecha_desde')
    const fechaHasta = searchParams.get('fecha_hasta')
    const ciudad = searchParams.get('ciudad')

    const supabase = await createClient()

    let query = supabase
      .from('fichas_nutricionales')
      .select(
        `id, paciente_id, fecha_consulta, tipo, peso_kg, imc,
         porcentaje_masa_grasa, porcentaje_masa_muscular,
         digestion, descanso, nivel_estres, consumo_agua,
         consumo_frutas, consumo_vegetales, actividad_fisica,
         pacientes!inner(id, nombre, sexo, empresa_id, tipo_paciente)`
      )
      .order('fecha_consulta', { ascending: true })

    if (scope === 'empresa' && empresaId) {
      query = query.eq('pacientes.empresa_id', empresaId)
    } else if (scope === 'empresa') {
      query = query.eq('pacientes.tipo_paciente', 'empresa')
    }
    if (scope === 'privado' && pacienteId) {
      query = query.eq('paciente_id', pacienteId)
    }
    if (scope === 'empresa' && ciudad) {
      query = query.eq('pacientes.ciudad', ciudad)
    }
    if (fechaDesde) query = query.gte('fecha_consulta', fechaDesde)
    if (fechaHasta) query = query.lte('fecha_consulta', fechaHasta)

    const { data, error } = await query
    if (error) throw new Error(error.message)

    const fichas = (data ?? []) as unknown as FichaRow[]

    // Group by paciente
    const byPaciente = new Map<string, FichaRow[]>()
    for (const f of fichas) {
      if (!byPaciente.has(f.paciente_id)) byPaciente.set(f.paciente_id, [])
      byPaciente.get(f.paciente_id)!.push(f)
    }

    const latestFichas: FichaRow[] = []
    const firstFichas: FichaRow[] = []
    for (const arr of byPaciente.values()) {
      firstFichas.push(arr[0])
      latestFichas.push(arr[arr.length - 1])
    }

    // Peso
    let pesoResult: { promedio?: number; actual?: number; delta?: number } = {}
    if (scope === 'privado') {
      const first = firstFichas[0]
      const last = latestFichas[0]
      if (last?.peso_kg != null) pesoResult.actual = last.peso_kg
      if (first && last && first.peso_kg != null && last.peso_kg != null && first.id !== last.id) {
        pesoResult.delta = Math.round((last.peso_kg - first.peso_kg) * 10) / 10
      }
    } else {
      const pesos = latestFichas.map((f) => f.peso_kg).filter((v): v is number => v != null)
      if (pesos.length > 0) {
        pesoResult.promedio = Math.round((pesos.reduce((a, b) => a + b, 0) / pesos.length) * 10) / 10
      }
    }

    // Grasa delta
    const grasaDeltas: { paciente_id: string; nombre: string; delta: number }[] = []
    const musculoDeltas: { paciente_id: string; nombre: string; delta: number }[] = []
    const pesoDeltas: { paciente_id: string; nombre: string; delta: number }[] = []
    for (const [pid, arr] of byPaciente) {
      if (arr.length < 2) continue
      const first = arr[0]
      const last = arr[arr.length - 1]
      const nombre = last.pacientes?.nombre ?? ''
      if (first.porcentaje_masa_grasa != null && last.porcentaje_masa_grasa != null) {
        grasaDeltas.push({
          paciente_id: pid,
          nombre,
          delta: last.porcentaje_masa_grasa - first.porcentaje_masa_grasa,
        })
      }
      if (first.porcentaje_masa_muscular != null && last.porcentaje_masa_muscular != null) {
        musculoDeltas.push({
          paciente_id: pid,
          nombre,
          delta: last.porcentaje_masa_muscular - first.porcentaje_masa_muscular,
        })
      }
      if (first.peso_kg != null && last.peso_kg != null) {
        pesoDeltas.push({
          paciente_id: pid,
          nombre,
          delta: last.peso_kg - first.peso_kg,
        })
      }
    }

    const avg = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null

    type CambioResult = {
      delta?: number
      actual?: number
      deltaPromedio?: number
      mejoraronPct?: number
      mejoraronCount?: number
      totalConDato?: number
      promedioSubida?: number
      promedioBajada?: number
    }
    let grasaResult: CambioResult = {}
    let musculoResult: CambioResult = {}

    const round1 = (n: number) => Math.round(n * 10) / 10

    if (scope === 'privado') {
      const last = latestFichas[0]
      if (last?.porcentaje_masa_grasa != null) grasaResult.actual = last.porcentaje_masa_grasa
      if (last?.porcentaje_masa_muscular != null) musculoResult.actual = last.porcentaje_masa_muscular
      const gd = grasaDeltas[0]?.delta
      const md = musculoDeltas[0]?.delta
      if (gd != null) grasaResult.delta = round1(gd)
      if (md != null) musculoResult.delta = round1(md)
    } else {
      // Para empresa: % que mejoró + promedios de subida y bajada por métrica.
      // Mejora: músculo = subir (delta > 0); grasa = bajar (delta < 0).
      const computeCambio = (deltas: number[], metric: 'grasa' | 'musculo'): CambioResult => {
        if (deltas.length === 0) return {}
        const subidas = deltas.filter((d) => d > 0)
        const bajadas = deltas.filter((d) => d < 0)
        const mejoraron = metric === 'musculo' ? subidas : bajadas
        const neto = avg(deltas)
        const ps = avg(subidas)
        const pb = avg(bajadas)
        const res: CambioResult = {
          totalConDato: deltas.length,
          mejoraronCount: mejoraron.length,
          mejoraronPct: Math.round((mejoraron.length / deltas.length) * 100),
        }
        if (neto != null) res.deltaPromedio = round1(neto)
        if (ps != null) res.promedioSubida = round1(ps)
        if (pb != null) res.promedioBajada = round1(pb)
        return res
      }
      grasaResult = computeCambio(grasaDeltas.map((d) => d.delta), 'grasa')
      musculoResult = computeCambio(musculoDeltas.map((d) => d.delta), 'musculo')
    }

    // Mejores cambios (empresa only): top 3 por mayor reducción de grasa o aumento de músculo
    let mejoresCambios: { paciente_nombre: string; metric: string; delta: number }[] | undefined
    if (scope === 'empresa') {
      const candidates: { paciente_nombre: string; metric: string; delta: number; score: number }[] = []
      const byPid = new Map<string, { paciente_nombre: string; metric: string; delta: number; score: number }>()
      for (const d of grasaDeltas) {
        // mejor = más negativo (bajó grasa)
        const score = -d.delta
        const existing = byPid.get(d.paciente_id)
        if (!existing || score > existing.score) {
          byPid.set(d.paciente_id, {
            paciente_nombre: d.nombre,
            metric: '% Grasa',
            delta: Math.round(d.delta * 10) / 10,
            score,
          })
        }
      }
      for (const d of musculoDeltas) {
        // mejor = más positivo (subió músculo)
        const score = d.delta
        const existing = byPid.get(d.paciente_id)
        if (!existing || score > existing.score) {
          byPid.set(d.paciente_id, {
            paciente_nombre: d.nombre,
            metric: '% Músculo',
            delta: Math.round(d.delta * 10) / 10,
            score,
          })
        }
      }
      candidates.push(...byPid.values())
      mejoresCambios = candidates
        .filter((c) => c.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ paciente_nombre, metric, delta }) => ({ paciente_nombre, metric, delta }))
    }

    // Distribución IMC
    const imcMap = new Map<string, number>()
    for (const f of latestFichas) {
      if (f.imc != null) {
        const cat = clasificarIMC(f.imc)
        imcMap.set(cat, (imcMap.get(cat) ?? 0) + 1)
      }
    }
    const distribucionIMC = Array.from(imcMap.entries()).map(([categoria, count]) => ({
      categoria,
      count,
    }))

    // Género (empresa only)
    let totalMujeres: number | undefined
    let totalHombres: number | undefined
    if (scope === 'empresa') {
      totalMujeres = 0
      totalHombres = 0
      for (const arr of byPaciente.values()) {
        const sexo = arr[0]?.pacientes?.sexo
        if (sexo === 'Femenino') totalMujeres++
        else if (sexo === 'Masculino') totalHombres++
      }
    }

    // Atendidos por mes
    const mesMap = new Map<string, number>()
    for (const f of fichas) {
      const mes = f.fecha_consulta.slice(0, 7)
      mesMap.set(mes, (mesMap.get(mes) ?? 0) + 1)
    }
    const atendidosPorMes = Array.from(mesMap.entries())
      .map(([mes, count]) => ({ mes, count }))
      .sort((a, b) => a.mes.localeCompare(b.mes))

    // Citas de control
    const citasControl = fichas.filter((f) => f.tipo === 'seguimiento').length

    // Hábitos
    let habitos: Record<string, CountItem[]>
    if (scope === 'privado') {
      // Para privado: historia de valores (cada ficha es una entrada)
      habitos = {
        descanso: countBy(fichas.map((f) => f.descanso)),
        nivel_estres: countBy(fichas.map((f) => f.nivel_estres)),
        consumo_agua: countBy(fichas.map((f) => f.consumo_agua)),
        consumo_frutas: countBy(fichas.map((f) => f.consumo_frutas)),
        consumo_vegetales: countBy(fichas.map((f) => f.consumo_vegetales)),
        actividad_fisica: countBy(fichas.map((f) => f.actividad_fisica)),
      }
    } else {
      // Para empresa: distribución en última ficha por paciente
      habitos = {
        descanso: countBy(latestFichas.map((f) => f.descanso)),
        nivel_estres: countBy(latestFichas.map((f) => f.nivel_estres)),
        consumo_agua: countBy(latestFichas.map((f) => f.consumo_agua)),
        consumo_frutas: countBy(latestFichas.map((f) => f.consumo_frutas)),
        consumo_vegetales: countBy(latestFichas.map((f) => f.consumo_vegetales)),
        actividad_fisica: countBy(latestFichas.map((f) => f.actividad_fisica)),
      }
    }

    // Ciudades disponibles para el filtro (empresa): TODAS las ciudades de sus pacientes,
    // sin aplicar el filtro de ciudad activo, para no vaciar el dropdown al filtrar.
    let ciudadesDisponibles: string[] | undefined
    if (scope === 'empresa') {
      let ciudadesQuery = supabase
        .from('pacientes')
        .select('ciudad')
        .not('ciudad', 'is', null)
      if (empresaId) ciudadesQuery = ciudadesQuery.eq('empresa_id', empresaId)
      else ciudadesQuery = ciudadesQuery.eq('tipo_paciente', 'empresa')
      const { data: ciudadesData } = await ciudadesQuery
      const ciudadesSet = new Set<string>()
      for (const row of ciudadesData ?? []) {
        const c = (row.ciudad as string | null)?.trim()
        if (c) ciudadesSet.add(c)
      }
      ciudadesDisponibles = Array.from(ciudadesSet).sort((a, b) => a.localeCompare(b))
    }

    return NextResponse.json({
      peso: pesoResult,
      grasa: grasaResult,
      musculo: musculoResult,
      mejoresCambios,
      distribucionIMC,
      totalMujeres,
      totalHombres,
      totalPacientes: byPaciente.size,
      atendidosPorMes,
      citasControl,
      habitos,
      ciudadesDisponibles,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
