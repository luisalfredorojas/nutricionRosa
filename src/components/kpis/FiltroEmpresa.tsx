'use client'

import { ChevronDown } from 'lucide-react'

interface Empresa {
  id: string
  nombre: string
}

interface FiltroEmpresaProps {
  empresas: Empresa[]
  selectedId: string | null
  onChange: (id: string | null) => void
  loading?: boolean
}

export function FiltroEmpresa({ empresas, selectedId, onChange, loading }: FiltroEmpresaProps) {
  return (
    <div className="relative">
      <select
        value={selectedId ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={loading}
        className="h-9 appearance-none pl-3 pr-8 border border-rosa-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rosa-400 bg-white text-rosa-700 min-w-[200px] disabled:opacity-50"
      >
        <option value="">Todas las empresas</option>
        {empresas.map((e) => (
          <option key={e.id} value={e.id}>
            {e.nombre}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-rosa-400" />
    </div>
  )
}
