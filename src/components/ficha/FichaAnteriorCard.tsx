'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'

export interface FichaAnteriorData {
  fecha_consulta: string | null
  peso_kg: number | null
  talla_m: number | null
  imc: number | null
  circunferencia_cintura: number | null
  circunferencia_cadera: number | null
  circunferencia_brazo: number | null
  indice_cc: number | null
  porcentaje_masa_grasa: number | null
  porcentaje_masa_muscular: number | null
  edad_metabolica: number | null
  grasa_visceral: number | null
}

interface FichaAnteriorCardProps {
  tab: 'nutricional' | 'balanza'
  anterior: FichaAnteriorData
  current: Partial<FichaAnteriorData>
}

interface Row {
  label: string
  key: keyof FichaAnteriorData
  unit?: string
  decimals?: number
  // si true → un valor menor es mejor (verde ↓)
  lowerIsBetter?: boolean
}

const NUTRICIONAL_ROWS: Row[] = [
  { label: 'Peso', key: 'peso_kg', unit: 'kg', decimals: 1, lowerIsBetter: true },
  { label: 'Talla', key: 'talla_m', unit: 'm', decimals: 2 },
  { label: 'IMC', key: 'imc', decimals: 1, lowerIsBetter: true },
  { label: 'Cintura', key: 'circunferencia_cintura', unit: 'cm', decimals: 1, lowerIsBetter: true },
  { label: 'Cadera', key: 'circunferencia_cadera', unit: 'cm', decimals: 1 },
  { label: 'Brazo', key: 'circunferencia_brazo', unit: 'cm', decimals: 1 },
  { label: 'ICC', key: 'indice_cc', decimals: 2, lowerIsBetter: true },
]

const BALANZA_ROWS: Row[] = [
  { label: '% Masa grasa', key: 'porcentaje_masa_grasa', unit: '%', decimals: 1, lowerIsBetter: true },
  { label: '% Masa muscular', key: 'porcentaje_masa_muscular', unit: '%', decimals: 1, lowerIsBetter: false },
  { label: 'Edad metabólica', key: 'edad_metabolica', unit: 'años', decimals: 0, lowerIsBetter: true },
  { label: 'Grasa visceral', key: 'grasa_visceral', decimals: 1, lowerIsBetter: true },
]

function fmt(n: number | null | undefined, decimals = 1): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return Number(n).toFixed(decimals)
}

function Delta({ prev, curr, lowerIsBetter }: { prev: number | null; curr: number | null; lowerIsBetter?: boolean }) {
  if (prev === null || curr === null || Number.isNaN(prev) || Number.isNaN(curr)) {
    return <span className="text-gray-300">—</span>
  }
  const diff = curr - prev
  if (Math.abs(diff) < 0.005) {
    return (
      <span className="inline-flex items-center gap-0.5 text-gray-400 text-xs">
        <Minus className="h-3 w-3" /> 0
      </span>
    )
  }
  const improving = lowerIsBetter === undefined ? null : (lowerIsBetter ? diff < 0 : diff > 0)
  const color =
    improving === null ? 'text-gray-500' : improving ? 'text-emerald-600' : 'text-red-600'
  const Icon = diff > 0 ? ArrowUp : ArrowDown
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {diff > 0 ? '+' : ''}
      {diff.toFixed(Math.abs(diff) < 1 ? 2 : 1)}
    </span>
  )
}

export function FichaAnteriorCard({ tab, anterior, current }: FichaAnteriorCardProps) {
  const rows = tab === 'nutricional' ? NUTRICIONAL_ROWS : BALANZA_ROWS

  return (
    <Card className="border-rosa-200 bg-rosa-50/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-rosa-700">Ficha anterior</CardTitle>
        {anterior.fecha_consulta && (
          <p className="text-xs text-rosa-500">Consulta del {formatDate(anterior.fecha_consulta)}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map((r) => {
          const prev = anterior[r.key] as number | null
          const curr = (current[r.key] as number | null | undefined) ?? null
          return (
            <div key={r.key as string} className="flex items-center justify-between text-sm">
              <span className="text-rosa-600">{r.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-rosa-800 font-medium tabular-nums">
                  {fmt(prev, r.decimals)}{r.unit ? ` ${r.unit}` : ''}
                </span>
                <Delta prev={prev} curr={curr} lowerIsBetter={r.lowerIsBetter} />
              </div>
            </div>
          )
        })}
        <p className="text-[10px] text-rosa-400 pt-1 border-t border-rosa-200/60 mt-2">
          La flecha muestra el cambio respecto al valor actual del formulario.
        </p>
      </CardContent>
    </Card>
  )
}
