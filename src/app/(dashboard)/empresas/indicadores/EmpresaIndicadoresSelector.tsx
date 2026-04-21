'use client'

import { useState } from 'react'
import { Select } from '@/components/ui/select'
import { IndicadoresDashboard } from '@/components/indicadores/IndicadoresDashboard'

interface Empresa {
  id: string
  nombre: string
}

interface Props {
  empresas: Empresa[]
}

export function EmpresaIndicadoresSelector({ empresas }: Props) {
  const [selectedId, setSelectedId] = useState<string>(empresas[0]?.id ?? '')
  const selected = empresas.find((e) => e.id === selectedId)

  if (empresas.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-rosa-800 mb-4">Indicadores</h1>
        <div className="bg-white rounded-xl border border-rosa-100 p-8 text-center text-rosa-400">
          No hay empresas registradas.
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-rosa-600 mb-1">
            Selecciona una empresa
          </label>
          <Select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="max-w-sm"
          >
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {selected && (
        <IndicadoresDashboard
          key={selected.id}
          scope="empresa"
          entityId={selected.id}
          entityNombre={selected.nombre}
        />
      )}
    </div>
  )
}
