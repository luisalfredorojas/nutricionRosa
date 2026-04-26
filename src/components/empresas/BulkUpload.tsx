'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import { Download, Upload, Loader2, CheckCircle2, XCircle } from 'lucide-react'

interface BulkUploadProps {
  empresaId: string
  empresaNombre: string
}

interface RowResult {
  fila: number
  estado: 'creado' | 'error'
  mensaje?: string
  nombre?: string
  correo?: string
  tipo?: 'inicial' | 'seguimiento'
}

interface Resumen {
  total: number
  nuevos: number
  seguimientos: number
  errores: number
}

const TEMPLATE_COLUMNS = [
  'Paciente',
  'Empresa',
  'Fecha',
  'Sexo',
  'Fecha Nac.',
  'Correo',
  'Peso',
  'Talla',
  'IMC',
  'Cintura',
  'Cadera',
  'ICC',
  '% Grasa',
  '% Músculo',
  'Edad Met.',
  'Gr. Visceral',
  'Dx Grasa',
  'Dx Músculo',
  'Riesgo Met.',
  'Actividad',
  'Descanso',
  'Estrés',
  'Digestión',
  'Agua',
  'Frutas',
  'Vegetales',
  'Café',
  'Alcohol',
  'Tabaco',
]

const TEMPLATE_EXAMPLE: Record<string, string | number> = {
  'Paciente': 'Ana Pérez',
  'Fecha': new Date().toISOString().slice(0, 10),
  'Sexo': 'Femenino',
  'Fecha Nac.': '1990-05-15',
  'Correo': 'ana.perez@ejemplo.com',
  'Peso': '68.5 kg',
  'Talla': '1.65 m',
  'IMC': '',
  'Cintura': '80 cm',
  'Cadera': '98 cm',
  'ICC': '',
  '% Grasa': '28.5%',
  '% Músculo': '32.0%',
  'Edad Met.': 35,
  'Gr. Visceral': 8,
  'Dx Grasa': '',
  'Dx Músculo': '',
  'Riesgo Met.': '',
  'Actividad': 'Moderado (3 a 4 veces por semana)',
  'Descanso': '5-7 horas',
  'Estrés': 'Medio',
  'Digestión': 'Normal',
  'Agua': 'Entre 1 - 1,5 lts',
  'Frutas': '> 4 veces por semana',
  'Vegetales': '> 3 veces por semana',
  'Café': 'Irregular',
  'Alcohol': 'No consume',
  'Tabaco': 'No consume',
}

export function BulkUpload({ empresaId, empresaNombre }: BulkUploadProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [resumen, setResumen] = useState<Resumen | null>(null)
  const [resultados, setResultados] = useState<RowResult[]>([])
  const [error, setError] = useState<string | null>(null)

  function descargarPlantilla() {
    const example = { ...TEMPLATE_EXAMPLE, Empresa: empresaNombre }
    const ws = XLSX.utils.json_to_sheet([example], { header: TEMPLATE_COLUMNS })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Pacientes')
    const safeNombre = empresaNombre.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    XLSX.writeFile(wb, `plantilla_bulk_${safeNombre}.xlsx`)
  }

  async function handleFile(file: File) {
    setLoading(true)
    setError(null)
    setResumen(null)
    setResultados([])

    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null, raw: false })

      if (rows.length === 0) {
        setError('El archivo no contiene filas')
        setLoading(false)
        return
      }

      const res = await fetch(`/api/empresas/${empresaId}/bulk-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? 'Error procesando archivo')
        setLoading(false)
        return
      }

      setResumen(data.resumen)
      setResultados(data.resultados ?? [])
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error procesando archivo')
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-rosa-800">Carga masiva por Excel</h2>
          <p className="text-xs text-rosa-400 mt-0.5">
            El correo identifica al paciente. Múltiples filas por correo = seguimientos. Correo obligatorio.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={descargarPlantilla} disabled={loading}>
            <Download className="h-4 w-4 mr-1.5" />
            Plantilla
          </Button>
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-1.5" />
            )}
            {loading ? 'Procesando...' : 'Subir Excel'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={onFileChange}
            className="hidden"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
          <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {resumen && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
              <div className="font-semibold text-rosa-800">{resumen.total}</div>
              <div className="text-xs text-rosa-400">Total filas</div>
            </div>
            <div className="p-2 rounded-lg bg-green-50 border border-green-200">
              <div className="font-semibold text-green-700">{resumen.nuevos}</div>
              <div className="text-xs text-green-600">Nuevos pacientes</div>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
              <div className="font-semibold text-blue-700">{resumen.seguimientos}</div>
              <div className="text-xs text-blue-600">Seguimientos</div>
            </div>
            <div className="p-2 rounded-lg bg-red-50 border border-red-200">
              <div className="font-semibold text-red-700">{resumen.errores}</div>
              <div className="text-xs text-red-600">Errores</div>
            </div>
          </div>

          {resultados.length > 0 && (
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-semibold text-rosa-600">Fila</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-rosa-600">Estado</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-rosa-600">Tipo</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-rosa-600">Nombre</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-rosa-600">Correo</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-rosa-600">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((r, idx) => (
                    <tr key={idx} className="border-t border-gray-100">
                      <td className="px-2 py-1.5 text-rosa-500">{r.fila}</td>
                      <td className="px-2 py-1.5">
                        {r.estado === 'creado' && (
                          <span className="inline-flex items-center gap-1 text-green-700">
                            <CheckCircle2 className="h-3 w-3" /> OK
                          </span>
                        )}
                        {r.estado === 'error' && (
                          <span className="inline-flex items-center gap-1 text-red-700">
                            <XCircle className="h-3 w-3" /> Error
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        {r.tipo === 'inicial' && <span className="text-green-700 font-medium">Inicial</span>}
                        {r.tipo === 'seguimiento' && <span className="text-blue-700 font-medium">Seguimiento</span>}
                        {!r.tipo && '—'}
                      </td>
                      <td className="px-2 py-1.5 text-rosa-700">{r.nombre ?? '—'}</td>
                      <td className="px-2 py-1.5 text-rosa-500">{r.correo ?? '—'}</td>
                      <td className="px-2 py-1.5 text-rosa-500">{r.mensaje ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
