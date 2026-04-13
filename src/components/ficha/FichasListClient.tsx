'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatDecimal } from '@/lib/utils'
import { Plus, Search, FileText } from 'lucide-react'

interface FichaItem {
  id: string
  fecha_consulta: string | null
  imc: number | null
  riesgo_metabolico: string | null
  nombre: string | null
  empresa: string | null
}

interface FichasListClientProps {
  fichas: FichaItem[]
}

const riesgoVariant = (r: string | null): 'success' | 'warning' | 'danger' | 'default' => {
  if (r === 'Bajo') return 'success'
  if (r === 'Moderado') return 'warning'
  if (r === 'Alto' || r === 'Muy alto') return 'danger'
  return 'default'
}

export function FichasListClient({ fichas }: FichasListClientProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return fichas
    const q = search.toLowerCase()
    return fichas.filter(
      (f) =>
        f.nombre?.toLowerCase().includes(q) ||
        f.empresa?.toLowerCase().includes(q)
    )
  }, [fichas, search])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-rosa-800">Fichas Médicas</h1>
          <p className="text-rosa-400 text-sm mt-0.5">
            {filtered.length} de {fichas.length} fichas
          </p>
        </div>
        <Link href="/fichas/nueva">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Nueva Ficha
          </Button>
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rosa-300" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o empresa..."
          className="w-full pl-9 pr-4 h-9 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rosa-400 bg-white placeholder:text-gray-400"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-rosa-300">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-rosa-400">
              {search ? 'Sin resultados para esa búsqueda' : 'No hay fichas registradas'}
            </p>
            {!search && (
              <Link href="/fichas/nueva" className="inline-block mt-3">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Nueva Ficha
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-rosa-600 uppercase tracking-wide">Paciente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-rosa-600 uppercase tracking-wide hidden sm:table-cell">Empresa</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-rosa-600 uppercase tracking-wide hidden md:table-cell">Fecha</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-rosa-600 uppercase tracking-wide">IMC</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-rosa-600 uppercase tracking-wide hidden sm:table-cell">Riesgo</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((ficha) => (
                  <tr
                    key={ficha.id}
                    className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-rosa-800">{ficha.nombre ?? '—'}</td>
                    <td className="px-4 py-3 text-rosa-500 hidden sm:table-cell">{ficha.empresa ?? '—'}</td>
                    <td className="px-4 py-3 text-rosa-500 whitespace-nowrap hidden md:table-cell">
                      {ficha.fecha_consulta ? formatDate(ficha.fecha_consulta) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-rosa-800">
                      {formatDecimal(ficha.imc, 1)}
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <Badge variant={riesgoVariant(ficha.riesgo_metabolico)}>
                        {ficha.riesgo_metabolico ?? '—'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/fichas/${ficha.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs">Ver →</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
