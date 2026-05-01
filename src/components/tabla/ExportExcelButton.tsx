'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet } from 'lucide-react'
import { type PacienteRow, METRIC_KEYS, METRIC_LABELS } from './ColumnDefs'
import { formatDate, formatDecimal } from '@/lib/utils'

interface ExportExcelButtonProps {
  data: PacienteRow[]
}

function metricValue(key: string, snap: PacienteRow['fichas'][number] | undefined): string {
  if (!snap) return '—'
  const v = (snap as unknown as Record<string, unknown>)[key]
  if (v === null || v === undefined || v === '') return '—'
  if (key === 'fecha_consulta') return formatDate(String(v))
  if (key === 'peso_kg') return `${formatDecimal(v as number, 1)} kg`
  if (key === 'talla_m') return `${v} m`
  if (key === 'circunferencia_cintura' || key === 'circunferencia_cadera' || key === 'grasa_visceral') return `${formatDecimal(v as number, 1)} cm`
  if (key === 'porcentaje_masa_grasa' || key === 'porcentaje_masa_muscular') return `${formatDecimal(v as number, 1)}%`
  if (key === 'imc' || key === 'indice_cc') return formatDecimal(v as number, key === 'indice_cc' ? 2 : 1)
  if (key === 'peso_ideal') return `${formatDecimal(v as number, 1)} kg`
  return String(v)
}

export function ExportExcelButton({ data }: ExportExcelButtonProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const XLSX = await import('xlsx')

      const maxFichas = data.reduce((m, r) => Math.max(m, r.num_fichas), 1)

      const baseHeaders = ['Paciente', 'Empresa', 'N° Fichas', 'Sexo', 'Edad', 'Ciudad', 'Correo']
      const metricHeaders: string[] = []
      for (let i = 0; i < maxFichas; i++) {
        for (const k of METRIC_KEYS) {
          metricHeaders.push(`${METRIC_LABELS[k]} (${i + 1})`)
        }
      }
      const habitHeaders = [
        'Digestión (últ.)', 'Descanso (últ.)', 'Estrés (últ.)', 'Agua (últ.)',
        'Act. Física (últ.)', 'Alcohol (últ.)', 'Tabaco (últ.)',
      ]
      const headers = [...baseHeaders, ...metricHeaders, ...habitHeaders]

      const rows = data.map((r) => {
        const base: (string | number | null)[] = [
          r.nombre,
          r.empresa ?? '—',
          r.num_fichas,
          r.sexo ?? '—',
          r.edad ?? '—',
          r.ciudad ?? '—',
          r.correo ?? '—',
        ]
        const metrics: string[] = []
        for (let i = 0; i < maxFichas; i++) {
          const snap = r.fichas[i]
          for (const k of METRIC_KEYS) {
            metrics.push(metricValue(k, snap))
          }
        }
        const habits: string[] = [
          r.digestion ?? '—',
          r.descanso ?? '—',
          r.nivel_estres ?? '—',
          r.consumo_agua ?? '—',
          r.actividad_fisica ?? '—',
          r.consumo_alcohol ?? '—',
          r.consumo_tabaco ?? '—',
        ]
        return [...base, ...metrics, ...habits]
      })

      const aoa = [headers, ...rows]
      const ws = XLSX.utils.aoa_to_sheet(aoa)

      ;(ws as unknown as { ['!views']: unknown[] })['!views'] = [{ state: 'frozen', xSplit: 3, ySplit: 1 }]
      ;(ws as unknown as { ['!cols']: { wch: number }[] })['!cols'] = headers.map((h) => ({ wch: Math.max(10, h.length + 2) }))

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Matriz')

      const date = new Date().toISOString().split('T')[0]
      XLSX.writeFile(wb, `nutricion-rosa-matriz-${date}.xlsx`)
    } catch (err) {
      console.error('Error exportando Excel:', err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={exporting} variant="outline" size="sm">
      <FileSpreadsheet className="h-4 w-4 mr-2" />
      {exporting ? 'Exportando...' : 'Exportar Excel'}
    </Button>
  )
}
