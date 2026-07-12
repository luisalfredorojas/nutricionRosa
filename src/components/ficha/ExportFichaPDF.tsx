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
        // html2canvas trabaja sobre un clon del DOM: removemos aquí los campos y
        // tarjetas vacíos (marcados con data-pdf-hide) para que NO aparezcan en el
        // PDF, sin alterar lo que se ve en la página web.
        onclone: (clonedDoc: Document) => {
          const clonedTarget = clonedDoc.getElementById(elementId)
          clonedTarget
            ?.querySelectorAll('[data-pdf-hide]')
            .forEach((node) => node.remove())
        },
      })

      const isLandscape = canvas.width > canvas.height
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10
      const imgWidth = pageWidth - margin * 2
      // Escala uniforme: el ancho del canvas se ajusta a imgWidth (mm).
      const pxPerMm = canvas.width / imgWidth
      const pageUsableHeightPx = Math.floor((pageHeight - margin * 2) * pxPerMm)

      // Cortamos el canvas en franjas del alto de una página y agregamos cada
      // franja a su propia página, siempre desde el margen superior. Esto evita
      // que el contenido se solape o se duplique entre páginas.
      let renderedPx = 0
      let pageIndex = 0
      while (renderedPx < canvas.height) {
        const sliceHeightPx = Math.min(pageUsableHeightPx, canvas.height - renderedPx)

        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = canvas.width
        pageCanvas.height = sliceHeightPx
        const ctx = pageCanvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
          ctx.drawImage(
            canvas,
            0, renderedPx, canvas.width, sliceHeightPx,
            0, 0, canvas.width, sliceHeightPx,
          )
        }

        const sliceImgData = pageCanvas.toDataURL('image/png')
        const sliceHeightMm = sliceHeightPx / pxPerMm

        if (pageIndex > 0) pdf.addPage()
        pdf.addImage(sliceImgData, 'PNG', margin, margin, imgWidth, sliceHeightMm)

        renderedPx += sliceHeightPx
        pageIndex++
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
