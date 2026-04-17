'use client'

import { useState } from 'react'
import { MatrizPacientes } from './MatrizPacientes'
import { ExportPDFButton } from './ExportPDFButton'
import type { FichaRow } from './ColumnDefs'
import { Search } from 'lucide-react'

interface TablaClientWrapperProps {
  initialData: FichaRow[]
}

export function TablaClientWrapper({ initialData }: TablaClientWrapperProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [empresaFilter, setEmpresaFilter] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  // Derive unique companies from data
  const empresas = Array.from(
    new Set(initialData.map((r) => r.empresa).filter((e): e is string => e !== null))
  ).sort()

  const filteredData = initialData.filter((row) => {
    const matchesSearch =
      !searchQuery ||
      row.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.empresa?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

    const matchesEmpresa = !empresaFilter || row.empresa === empresaFilter

    const rowDate = row.fecha_consulta
    const matchesDesde = !fechaDesde || rowDate >= fechaDesde
    const matchesHasta = !fechaHasta || rowDate <= fechaHasta

    return matchesSearch && matchesEmpresa && matchesDesde && matchesHasta
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-rosa-800">Matriz</h1>
          <p className="text-rosa-500 text-sm mt-1">
            {filteredData.length} de {initialData.length} registros
          </p>
        </div>
        <ExportPDFButton data={filteredData} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rosa-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o empresa..."
            className="w-full pl-9 pr-4 h-9 border border-rosa-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rosa-400 bg-white"
          />
        </div>
        <div className="relative">
          <select
            value={empresaFilter}
            onChange={(e) => setEmpresaFilter(e.target.value)}
            className="h-9 appearance-none pl-3 pr-8 border border-rosa-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rosa-400 bg-white text-rosa-700 min-w-[180px]"
          >
            <option value="">Todas las empresas</option>
            {empresas.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-rosa-600 font-medium whitespace-nowrap">Desde</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="h-9 px-3 border border-rosa-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rosa-400 bg-white text-rosa-700"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-rosa-600 font-medium whitespace-nowrap">Hasta</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="h-9 px-3 border border-rosa-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rosa-400 bg-white text-rosa-700"
          />
        </div>
        {(empresaFilter || fechaDesde || fechaHasta) && (
          <button
            type="button"
            onClick={() => { setEmpresaFilter(''); setFechaDesde(''); setFechaHasta('') }}
            className="h-9 px-3 text-xs text-rosa-500 hover:text-rosa-700 border border-rosa-200 rounded-lg bg-white transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <MatrizPacientes data={filteredData} globalFilter={searchQuery} />
    </div>
  )
}
