'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { type PacienteRow, METRIC_KEYS, METRIC_LABELS } from './ColumnDefs'
import { formatDate, formatDecimal } from '@/lib/utils'

interface ExportPDFButtonProps {
  data: PacienteRow[]
}

function metricValue(key: string, snap: PacienteRow['fichas'][number] | undefined): string {
  if (!snap) return '—'
  const v = (snap as unknown as Record<string, unknown>)[key]
  if (v === null || v === undefined || v === '') return '—'
  if (key === 'fecha_consulta') return formatDate(String(v))
  if (key === 'peso_kg') return `${formatDecimal(v as number, 1)} kg`
  if (key === 'talla_m') return `${v} m`
  if (key === 'circunferencia_cintura' || key === 'circunferencia_cadera') return `${formatDecimal(v as number, 1)} cm`
  if (key === 'porcentaje_masa_grasa' || key === 'porcentaje_masa_muscular') return `${formatDecimal(v as number, 1)}%`
  if (key === 'imc' || key === 'indice_cc') return formatDecimal(v as number, key === 'indice_cc' ? 2 : 1)
  if (key === 'peso_ideal') return `${formatDecimal(v as number, 1)} kg`
  if (key === 'grasa_visceral') return formatDecimal(v as number, 1)
  return String(v)
}

export function ExportPDFButton({ data }: ExportPDFButtonProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const { jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const maxFichas = data.reduce((m, r) => Math.max(m, r.num_fichas), 1)

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a3',
      })

      const today = formatDate(new Date())
      doc.setFontSize(16)
      doc.setTextColor(157, 23, 77)
      doc.text('NutricionRosa — Matriz de Pacientes', 14, 16)
      doc.setFontSize(10)
      doc.setTextColor(120, 80, 100)
      doc.text(`Exportado el ${today} · ${data.length} pacientes · máx. ${maxFichas} ficha${maxFichas === 1 ? '' : 's'}`, 14, 23)

      const baseHeaders = ['Paciente', 'Empresa', 'N° Fichas', 'Sexo']
      const metricHeaders: string[] = []
      for (let i = 0; i < maxFichas; i++) {
        for (const k of METRIC_KEYS) {
          metricHeaders.push(`${METRIC_LABELS[k]} (${i + 1})`)
        }
      }
      const habitHeaders = ['Act. Física (últ.)', 'Descanso (últ.)', 'Estrés (últ.)']
      const columns = [...baseHeaders, ...metricHeaders, ...habitHeaders]

      const rows = data.map((r) => {
        const base: (string | number)[] = [r.nombre, r.empresa ?? '—', r.num_fichas, r.sexo ?? '—']
        const metrics: string[] = []
        for (let i = 0; i < maxFichas; i++) {
          const snap = r.fichas[i]
          for (const k of METRIC_KEYS) {
            metrics.push(metricValue(k, snap))
          }
        }
        const habits = [r.actividad_fisica ?? '—', r.descanso ?? '—', r.nivel_estres ?? '—']
        return [...base, ...metrics, ...habits]
      })

      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 28,
        styles: {
          fontSize: 6,
          cellPadding: 1.5,
          textColor: [80, 40, 60],
        },
        headStyles: {
          fillColor: [253, 242, 248],
          textColor: [157, 23, 77],
          fontStyle: 'bold',
          lineColor: [251, 207, 232],
          lineWidth: 0.3,
        },
        alternateRowStyles: {
          fillColor: [254, 249, 252],
        },
        tableLineColor: [251, 207, 232],
        tableLineWidth: 0.2,
      })

      doc.save(`nutricion-rosa-matriz-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      console.error('Error exportando PDF:', err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={exporting} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      {exporting ? 'Exportando...' : 'Exportar PDF'}
    </Button>
  )
}
