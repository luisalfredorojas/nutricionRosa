'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet } from 'lucide-react'
import type { FichaRow } from './ColumnDefs'
import { formatDate, formatDecimal } from '@/lib/utils'

interface ExportExcelButtonProps {
  data: FichaRow[]
}

export function ExportExcelButton({ data }: ExportExcelButtonProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const XLSX = await import('xlsx')

      const headers = [
        'Paciente', 'Empresa', 'Fecha', 'Sexo', 'Fecha Nac.', 'Peso', 'Talla', 'IMC',
        'Cintura', 'Cadera', 'ICC', '% Grasa', '% Músculo',
        'Edad Met.', 'Gr. Visceral', 'Dx Grasa', 'Dx Músculo', 'Riesgo Met.',
        'Actividad', 'Descanso', 'Estrés',
      ]

      const rows = data.map((r) => [
        r.nombre,
        r.empresa ?? '—',
        r.fecha_consulta ? formatDate(r.fecha_consulta) : '—',
        r.sexo ?? '—',
        r.fecha_nacimiento ? formatDate(r.fecha_nacimiento) : '—',
        r.peso_kg != null ? `${formatDecimal(r.peso_kg, 1)} kg` : '—',
        r.talla_m != null ? `${r.talla_m} m` : '—',
        formatDecimal(r.imc, 1),
        r.circunferencia_cintura != null ? `${formatDecimal(r.circunferencia_cintura, 1)} cm` : '—',
        r.circunferencia_cadera != null ? `${formatDecimal(r.circunferencia_cadera, 1)} cm` : '—',
        formatDecimal(r.indice_cc, 2),
        r.porcentaje_masa_grasa != null ? `${formatDecimal(r.porcentaje_masa_grasa, 1)}%` : '—',
        r.porcentaje_masa_muscular != null ? `${formatDecimal(r.porcentaje_masa_muscular, 1)}%` : '—',
        r.edad_metabolica ?? '—',
        formatDecimal(r.grasa_visceral, 1),
        r.dx_grasa ?? '—',
        r.dx_musculo ?? '—',
        r.riesgo_metabolico ?? '—',
        r.actividad_fisica ?? '—',
        r.descanso ?? '—',
        r.nivel_estres ?? '—',
      ])

      const aoa = [headers, ...rows]
      const ws = XLSX.utils.aoa_to_sheet(aoa)

      // Freeze first row + first 3 columns
      ;(ws as any)['!views'] = [{ state: 'frozen', xSplit: 3, ySplit: 1 }]

      // Column widths for readability
      ;(ws as any)['!cols'] = headers.map((h) => ({ wch: Math.max(10, h.length + 2) }))

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
