'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface ExportIndicadoresPDFProps {
  scope: 'empresa' | 'privado'
  targetId?: string
}

export function ExportIndicadoresPDF({
  scope,
  targetId = 'indicadores-export',
}: ExportIndicadoresPDFProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const el = document.getElementById(targetId)
      if (!el) throw new Error('No se encontró el contenido a exportar')

      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      })
      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 10
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight - 20

      while (heightLeft > 0) {
        pdf.addPage()
        position = heightLeft - imgHeight + 10
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight - 20
      }

      const fecha = new Date().toISOString().split('T')[0]
      pdf.save(`indicadores-${scope}-${fecha}.pdf`)
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
