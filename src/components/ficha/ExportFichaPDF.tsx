'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface ExportFichaPDFProps {
  fichaId: string
  pacienteId: string
}

export function ExportFichaPDF({ fichaId }: ExportFichaPDFProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const [{ jsPDF }, html2canvasMod] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])
      const html2canvas = (html2canvasMod as any).default ?? html2canvasMod

      const el = document.getElementById(`ficha-export-${fichaId}`)
      if (!el) {
        console.error('No se encontró el contenedor exportable')
        return
      }

      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10
      const usableWidth = pageWidth - margin * 2
      const imgProps = (canvas.width && canvas.height) ? { w: canvas.width, h: canvas.height } : { w: 1, h: 1 }
      const ratio = imgProps.h / imgProps.w
      const imgWidth = usableWidth
      const imgHeight = imgWidth * ratio

      if (imgHeight <= pageHeight - margin * 2) {
        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight)
      } else {
        // Multi-page slicing
        let position = 0
        const pageUsable = pageHeight - margin * 2
        const totalPages = Math.ceil(imgHeight / pageUsable)
        for (let p = 0; p < totalPages; p++) {
          if (p > 0) pdf.addPage()
          pdf.addImage(
            imgData,
            'PNG',
            margin,
            margin - position,
            imgWidth,
            imgHeight
          )
          position += pageUsable
        }
      }

      const date = new Date().toISOString().split('T')[0]
      pdf.save(`ficha-${fichaId.slice(0, 8)}-${date}.pdf`)
    } catch (err) {
      console.error('Error exportando ficha PDF:', err)
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
