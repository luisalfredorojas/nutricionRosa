'use client'

import { useCallback, useEffect, useState } from 'react'

export interface IndicadoresData {
  peso: { promedio?: number; actual?: number; delta?: number }
  grasa: { deltaPromedio?: number; actual?: number; delta?: number }
  musculo: { deltaPromedio?: number; actual?: number; delta?: number }
  mejoresCambios?: { paciente_nombre: string; metric: string; delta: number }[]
  distribucionIMC: { categoria: string; count: number }[]
  totalMujeres?: number
  totalHombres?: number
  totalPacientes: number
  atendidosPorMes: { mes: string; count: number }[]
  citasControl: number
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
  const { scope, empresaId, pacienteId, fechaDesde, fechaHasta } = options
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
  }, [scope, empresaId, pacienteId, fechaDesde, fechaHasta])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
