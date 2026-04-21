'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDate, formatDecimal, cn } from '@/lib/utils'

interface Row {
  id: string
  fecha_consulta: string | null
  peso_kg: number | null
  talla_m: number | null
  imc: number | null
  porcentaje_masa_grasa: number | null
  circunferencia_cintura: number | null
  circunferencia_cadera: number | null
  circunferencia_brazo: number | null
  fecha_nacimiento: string | null
}

interface TablaComparativaProps {
  pacienteId: string
  currentFichaId?: string
}

function calcEdad(fechaConsulta: string | null, fechaNacimiento: string | null): number | null {
  if (!fechaConsulta || !fechaNacimiento) return null
  const consulta = new Date(fechaConsulta)
  const nac = new Date(fechaNacimiento)
  let edad = consulta.getFullYear() - nac.getFullYear()
  const m = consulta.getMonth() - nac.getMonth()
  if (m < 0 || (m === 0 && consulta.getDate() < nac.getDate())) edad--
  return edad
}

export function TablaComparativa({ pacienteId, currentFichaId }: TablaComparativaProps) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancel = false
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/fichas?paciente_id=${pacienteId}`)
        const json = await res.json()
        if (cancel) return
        const data = (json.data ?? []) as any[]
        const mapped: Row[] = data.map((f) => ({
          id: f.id,
          fecha_consulta: f.fecha_consulta ?? null,
          peso_kg: f.peso_kg ?? null,
          talla_m: f.talla_m ?? null,
          imc: f.imc ?? null,
          porcentaje_masa_grasa: f.porcentaje_masa_grasa ?? null,
          circunferencia_cintura: f.circunferencia_cintura ?? null,
          circunferencia_cadera: f.circunferencia_cadera ?? null,
          circunferencia_brazo: f.circunferencia_brazo ?? null,
          fecha_nacimiento: f.pacientes?.fecha_nacimiento ?? null,
        }))
        // Sort ASC by fecha_consulta
        mapped.sort((a, b) => {
          const da = a.fecha_consulta ?? ''
          const db = b.fecha_consulta ?? ''
          return da.localeCompare(db)
        })
        setRows(mapped)
      } finally {
        if (!cancel) setLoading(false)
      }
    }
    load()
    return () => {
      cancel = true
    }
  }, [pacienteId])

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-rosa-400">
        Cargando tabla comparativa...
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-rosa-400">
        No hay consultas registradas para este paciente.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-rosa-600 uppercase tracking-wide">Fecha consulta</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-rosa-600 uppercase tracking-wide">Edad</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-rosa-600 uppercase tracking-wide">IMC</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-rosa-600 uppercase tracking-wide">Peso (kg)</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-rosa-600 uppercase tracking-wide">% Grasa</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-rosa-600 uppercase tracking-wide">Cintura (cm)</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-rosa-600 uppercase tracking-wide">Cadera (cm)</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-rosa-600 uppercase tracking-wide">Brazo (cm)</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const highlight = r.id === currentFichaId
              return (
                <tr
                  key={r.id}
                  className={cn(
                    'border-b border-gray-100 last:border-0 transition-colors',
                    highlight ? 'bg-rosa-50' : 'hover:bg-gray-50/60'
                  )}
                >
                  <td className="px-4 py-2.5 text-rosa-700 whitespace-nowrap">
                    {r.fecha_consulta ? formatDate(r.fecha_consulta) : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-center text-rosa-700">
                    {calcEdad(r.fecha_consulta, r.fecha_nacimiento) ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 text-center text-rosa-800 font-semibold">
                    {formatDecimal(r.imc, 1)}
                  </td>
                  <td className="px-4 py-2.5 text-center text-rosa-700">
                    {formatDecimal(r.peso_kg, 1)}
                  </td>
                  <td className="px-4 py-2.5 text-center text-rosa-700">
                    {r.porcentaje_masa_grasa != null ? `${formatDecimal(r.porcentaje_masa_grasa, 1)}%` : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-center text-rosa-700">
                    {formatDecimal(r.circunferencia_cintura, 1)}
                  </td>
                  <td className="px-4 py-2.5 text-center text-rosa-700">
                    {formatDecimal(r.circunferencia_cadera, 1)}
                  </td>
                  <td className="px-4 py-2.5 text-center text-rosa-700">
                    {formatDecimal(r.circunferencia_brazo, 1)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {!highlight && (
                      <Link href={`/fichas/${r.id}`} className="text-xs text-rosa-500 hover:text-rosa-700">
                        Ver →
                      </Link>
                    )}
                    {highlight && (
                      <span className="text-xs font-medium text-rosa-600">Actual</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
