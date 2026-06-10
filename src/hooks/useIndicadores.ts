'use client'

import { useCallback, useEffect, useState } from 'react'

// Resultado de cambio de composición corporal (grasa/músculo) para una empresa o paciente.
export interface CambioMetric {
  // Scope privado (un paciente)
  delta?: number          // cambio individual última − primera
  actual?: number         // valor en la última ficha
  // Scope empresa (agregado)
  deltaPromedio?: number  // promedio neto de los cambios (puede cancelarse)
  mejoraronPct?: number   // % de pacientes que mejoraron (músculo: subió; grasa: bajó)
  mejoraronCount?: number // # de pacientes que mejoraron
  totalConDato?: number   // # de pacientes con cambio medible (2+ fichas con dato)
  promedioSubida?: number // promedio de los que subieron (delta > 0)
  promedioBajada?: number // promedio de los que bajaron (delta < 0)
}

export interface IndicadoresData {
  peso: { promedio?: number; actual?: number; delta?: number }
  grasa: CambioMetric
  musculo: CambioMetric
  mejoresCambios?: { paciente_nombre: string; metric: string; delta: number }[]
  distribucionIMC: { categoria: string; count: number }[]
  totalMujeres?: number
  totalHombres?: number
  totalPacientes: number
  atendidosPorMes: { mes: string; count: number }[]
  citasControl: number
  ciudadesDisponibles?: string[]
  habitos: {
    descanso: { valor: string; count: number }[]
    nivel_estres: { valor: string; count: number }[]
    consumo_agua: { valor: string; count: number }[]
    consumo_frutas: { valor: string; count: number }[]
    consumo_vegetales: { valor: string; count: number }[]
    actividad_fisica: { valor: string; count: number }[]
  }
}

export interface UseIndicadoresOptions {
  scope: 'empresa' | 'privado'
  empresaId?: string | null
  pacienteId?: string | null
  ciudad?: string | null
  fechaDesde?: string | null
  fechaHasta?: string | null
}

export interface UseIndicadoresReturn {
  data: IndicadoresData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useIndicadores(
  options: UseIndicadoresOptions
): UseIndicadoresReturn {
  const { scope, empresaId, pacienteId, ciudad, fechaDesde, fechaHasta } = options
  const [data, setData] = useState<IndicadoresData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('scope', scope)
      if (empresaId) params.set('empresa_id', empresaId)
      if (pacienteId) params.set('paciente_id', pacienteId)
      if (ciudad) params.set('ciudad', ciudad)
      if (fechaDesde) params.set('fecha_desde', fechaDesde)
      if (fechaHasta) params.set('fecha_hasta', fechaHasta)
      const res = await fetch(`/api/indicadores?${params.toString()}`, {
        cache: 'no-store',
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Error ${res.status}`)
      }
      const json = (await res.json()) as IndicadoresData
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [scope, empresaId, pacienteId, ciudad, fechaDesde, fechaHasta])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
