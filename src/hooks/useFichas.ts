'use client'

import { useState, useEffect, useCallback } from 'react'
import type { FichaConPaciente } from '@/types/ficha'

interface UseFichasOptions {
  empresaId?: string | null
  pacienteId?: string | null
}

interface UseFichasReturn {
  fichas: FichaConPaciente[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useFichas({ empresaId, pacienteId }: UseFichasOptions = {}): UseFichasReturn {
  const [fichas, setFichas] = useState<FichaConPaciente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFichas = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (empresaId) params.set('empresa_id', empresaId)
      if (pacienteId) params.set('paciente_id', pacienteId)

      const res = await fetch(`/api/fichas?${params.toString()}`)
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Error al cargar fichas')
      }

      const { data } = await res.json()
      setFichas(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [empresaId, pacienteId])

  useEffect(() => {
    fetchFichas()
  }, [fetchFichas])

  return { fichas, loading, error, refetch: fetchFichas }
}
