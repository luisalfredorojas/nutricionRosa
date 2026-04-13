'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { KPISummary, GrasaDistribucion, RiesgoDistribucion } from '@/types/kpi'
import type { FichaConPaciente } from '@/types/ficha'

interface UseKPIsOptions {
  empresaId?: string | null
}

interface UseKPIsReturn {
  kpis: KPISummary | null
  loading: boolean
  error: string | null
}

export function useKPIs({ empresaId }: UseKPIsOptions = {}): UseKPIsReturn {
  const [kpis, setKpis] = useState<KPISummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const computeKPIs = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      let query = supabase
        .from('fichas_nutricionales')
        .select(`
          *,
          pacientes!inner (
            id,
            nombre,
            empresa_id,
            empresas (id, nombre)
          )
        `)
        .order('fecha_consulta', { ascending: true })

      if (empresaId) {
        query = query.eq('pacientes.empresa_id', empresaId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw new Error(fetchError.message)

      const fichas = (data ?? []) as FichaConPaciente[]

      // Group by paciente to compute deltas
      const byPaciente = new Map<string, FichaConPaciente[]>()
      for (const f of fichas) {
        const pid = f.paciente_id
        if (!byPaciente.has(pid)) byPaciente.set(pid, [])
        byPaciente.get(pid)!.push(f)
      }

      const deltas: { grasa: number; musculo: number; peso: number }[] = []

      for (const pacienteFichas of byPaciente.values()) {
        if (pacienteFichas.length < 2) continue
        const first = pacienteFichas[0]
        const last = pacienteFichas[pacienteFichas.length - 1]

        if (first.porcentaje_masa_grasa !== null && last.porcentaje_masa_grasa !== null) {
          deltas.push({
            grasa: last.porcentaje_masa_grasa - first.porcentaje_masa_grasa,
            musculo:
              last.porcentaje_masa_muscular !== null && first.porcentaje_masa_muscular !== null
                ? last.porcentaje_masa_muscular - first.porcentaje_masa_muscular
                : 0,
            peso:
              last.peso_kg !== null && first.peso_kg !== null
                ? last.peso_kg - first.peso_kg
                : 0,
          })
        }
      }

      // Latest ficha per paciente for current metrics
      const latestByPaciente = Array.from(byPaciente.values()).map(
        (arr) => arr[arr.length - 1]
      )

      const imcValues = latestByPaciente
        .map((f) => f.imc)
        .filter((v): v is number => v !== null)

      const promedioIMC =
        imcValues.length > 0
          ? imcValues.reduce((a, b) => a + b, 0) / imcValues.length
          : null

      const pacientesRiesgoAlto = latestByPaciente.filter(
        (f) => f.riesgo_metabolico === 'Alto' || f.riesgo_metabolico === 'Muy alto'
      ).length

      // Distribución de grasa
      const grasaMap = new Map<string, number>()
      for (const f of latestByPaciente) {
        if (f.dx_grasa) {
          grasaMap.set(f.dx_grasa, (grasaMap.get(f.dx_grasa) ?? 0) + 1)
        }
      }

      const totalConGrasa = Array.from(grasaMap.values()).reduce((a, b) => a + b, 0)
      const distribucionGrasa: GrasaDistribucion[] = Array.from(grasaMap.entries()).map(
        ([clasificacion, cantidad]) => ({
          clasificacion,
          cantidad,
          porcentaje: totalConGrasa > 0 ? Math.round((cantidad / totalConGrasa) * 100) : 0,
        })
      )

      // Distribución de riesgo metabólico
      const RIESGO_ORDER = ['Bajo', 'Moderado', 'Alto', 'Muy alto']
      const riesgoMap = new Map<string, number>()
      for (const f of latestByPaciente) {
        if (f.riesgo_metabolico) {
          riesgoMap.set(f.riesgo_metabolico, (riesgoMap.get(f.riesgo_metabolico) ?? 0) + 1)
        }
      }
      const distribucionRiesgo: RiesgoDistribucion[] = RIESGO_ORDER
        .filter((nivel) => riesgoMap.has(nivel))
        .map((nivel) => ({ nivel, cantidad: riesgoMap.get(nivel)! }))

      const avg = (arr: number[]) =>
        arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null

      setKpis({
        totalPacientes: byPaciente.size,
        totalFichas: fichas.length,
        promedioIMC: promedioIMC ? Math.round(promedioIMC * 10) / 10 : null,
        promedioGrasaBajada: deltas.length > 0 ? Math.round(avg(deltas.map((d) => d.grasa))! * 10) / 10 : null,
        promedioMusculoCambiado: deltas.length > 0 ? Math.round(avg(deltas.map((d) => d.musculo))! * 10) / 10 : null,
        promedioPesoPerdido: deltas.length > 0 ? Math.round(avg(deltas.map((d) => d.peso))! * 10) / 10 : null,
        pacientesRiesgoAlto,
        distribucionGrasa,
        distribucionRiesgo,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [empresaId])

  useEffect(() => {
    computeKPIs()
  }, [computeKPIs])

  return { kpis, loading, error }
}
