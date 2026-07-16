'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface ExportFichasPacientePDFProps {
  // Id del contenedor oculto que agrupa todas las fichas del paciente.
  // Cada ficha debe estar marcada con el atributo `data-ficha-block`.
  containerId: string
  pacienteNombre?: string
  label?: string
}

/**
 * Exporta TODAS las fichas de un paciente (la inicial y las de control) en un
 * único archivo PDF. Cada ficha se captura por separado con html2canvas y se
 * agrega empezando siempre en una página nueva, de modo que cada ficha (con su
 * etiqueta "Ficha Inicial" / "Control N") quede claramente diferenciada.
 */
export function ExportFichasPacientePDF({
  containerId,
  pacienteNombre,
  label = 'Descargar Fichas',
}: ExportFichasPacientePDFProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const [{ jsPDF }, html2canvasMod] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])
      const html2canvas = (html2canvasMod as any).default ?? html2canvasMod

      const container = document.getElementById(containerId)
      if (!container) {
        console.error('No se encontró el contenedor exportable:', containerId)
        return
      }

      const blocks = Array.from(
        container.querySelectorAll<HTMLElement>('[data-ficha-block]')
      )
      if (blocks.length === 0) {
        console.error('No hay fichas para exportar en:', containerId)
        return
      }

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10
      const imgWidth = pageWidth - margin * 2

      // Cada ficha (bloque) empieza en una página nueva. Dentro de una ficha, si
      // el contenido no cabe, se corta en franjas del alto de una página.
      let firstPageWritten = false

      for (const block of blocks) {
        const canvas = await html2canvas(block, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
        })

        const pxPerMm = canvas.width / imgWidth
        const pageUsableHeightPx = Math.floor((pageHeight - margin * 2) * pxPerMm)

        let renderedPx = 0
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

          // Nueva página salvo la primera franja de la primera ficha.
          if (firstPageWritten) pdf.addPage()
          firstPageWritten = true

          pdf.addImage(sliceImgData, 'PNG', margin, margin, imgWidth, sliceHeightMm)
          renderedPx += sliceHeightPx
        }
      }

      const date = new Date().toISOString().split('T')[0]
      const safeName = pacienteNombre
        ? pacienteNombre.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
        : 'paciente'
      pdf.save(`fichas-${safeName}-${date}.pdf`)
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
