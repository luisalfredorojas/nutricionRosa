'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface ExportFichaPDFProps {
  fichaId: string
  pacienteId: string
  pacienteNombre?: string
  targetId?: string
  label?: string
}

export function ExportFichaPDF({ fichaId, pacienteNombre, targetId, label = 'Exportar PDF' }: ExportFichaPDFProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const [{ jsPDF }, html2canvasMod] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])
      const html2canvas = (html2canvasMod as any).default ?? html2canvasMod

      const elementId = targetId ?? `ficha-export-${fichaId}`
      const el = document.getElementById(elementId)
      if (!el) {
        console.error('No se encontró el contenedor exportable:', elementId)
        return
      }

      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      })

      const imgData = canvas.toDataURL('image/png')
      const isLandscape = canvas.width > canvas.height
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10
      const usableWidth = pageWidth - margin * 2
      const ratio = canvas.height / canvas.width
      const imgWidth = usableWidth
      const imgHeight = imgWidth * ratio

      if (imgHeight <= pageHeight - margin * 2) {
        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight)
      } else {
        let position = 0
        const pageUsable = pageHeight - margin * 2
        const totalPages = Math.ceil(imgHeight / pageUsable)
        for (let p = 0; p < totalPages; p++) {
          if (p > 0) pdf.addPage()
          pdf.addImage(imgData, 'PNG', margin, margin - position, imgWidth, imgHeight)
          position += pageUsable
        }
      }

      const date = new Date().toISOString().split('T')[0]
      const safeName = pacienteNombre
        ? pacienteNombre.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
        : fichaId.slice(0, 8)
      const prefix = targetId ? 'tabla' : 'ficha'
      pdf.save(`${prefix}-${safeName}-${date}.pdf`)
    } catch (err) {
      console.error('Error exportando PDF:', err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={exporting} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      {exporting ? 'Exportando...' : label}
    </Button>
  )
}
