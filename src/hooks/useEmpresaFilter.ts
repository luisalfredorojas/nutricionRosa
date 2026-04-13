'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import type { Empresa } from '@/types/database'

interface UseEmpresaFilterReturn {
  empresas: Empresa[]
  selectedEmpresaId: string | null
  setSelectedEmpresaId: (id: string | null) => void
  loading: boolean
}

export function useEmpresaFilter(): UseEmpresaFilterReturn {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEmpresas = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('empresas')
        .select('*')
        .order('nombre')

      setEmpresas(data ?? [])
      setLoading(false)
    }

    fetchEmpresas()
  }, [])

  return { empresas, selectedEmpresaId, setSelectedEmpresaId, loading }
}
