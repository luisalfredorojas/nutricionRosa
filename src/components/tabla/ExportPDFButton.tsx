'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { FichaRow } from './ColumnDefs'
import { formatDate, formatDecimal } from '@/lib/utils'

interface ExportPDFButtonProps {
  data: FichaRow[]
}

export function ExportPDFButton({ data }: ExportPDFButtonProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const { jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

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
      doc.text(`Exportado el ${today} · ${data.length} registros`, 14, 23)

      const columns = [
        'Paciente', 'Empresa', 'Fecha', 'Sexo', 'Peso', 'Talla', 'IMC',
        'Cintura', 'Cadera', 'ICC', '% Grasa', '% Músculo',
        'Edad Met.', 'Gr. Visceral', 'Dx Grasa', 'Dx Músculo', 'Riesgo Met.',
        'Actividad', 'Descanso', 'Estrés',
      ]

      const rows = data.map((r) => [
        r.nombre,
        r.empresa ?? '—',
        r.fecha_consulta ? formatDate(r.fecha_consulta) : '—',
        r.sexo ?? '—',
        r.peso_kg ? `${formatDecimal(r.peso_kg, 1)} kg` : '—',
        r.talla_m ? `${r.talla_m} m` : '—',
        formatDecimal(r.imc, 1),
        r.circunferencia_cintura ? `${formatDecimal(r.circunferencia_cintura, 1)} cm` : '—',
        r.circunferencia_cadera ? `${formatDecimal(r.circunferencia_cadera, 1)} cm` : '—',
        formatDecimal(r.indice_cc, 2),
        r.porcentaje_masa_grasa ? `${formatDecimal(r.porcentaje_masa_grasa, 1)}%` : '—',
        r.porcentaje_masa_muscular ? `${formatDecimal(r.porcentaje_masa_muscular, 1)}%` : '—',
        r.edad_metabolica ?? '—',
        formatDecimal(r.grasa_visceral, 1),
        r.dx_grasa ?? '—',
        r.dx_musculo ?? '—',
        r.riesgo_metabolico ?? '—',
        r.actividad_fisica ?? '—',
        r.descanso ?? '—',
        r.nivel_estres ?? '—',
      ])

      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 28,
        styles: {
          fontSize: 7,
          cellPadding: 2,
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
