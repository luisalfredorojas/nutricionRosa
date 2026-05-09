'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface DeleteFichaButtonProps {
  fichaId: string
  pacienteNombre?: string | null
  redirectTo?: string
  variant?: 'icon' | 'full'
}

export function DeleteFichaButton({
  fichaId,
  pacienteNombre,
  redirectTo,
  variant = 'icon',
}: DeleteFichaButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/fichas/${fichaId}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Error al eliminar la ficha')
        setLoading(false)
        return
      }
      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.refresh()
        setOpen(false)
      }
    } catch {
      setError('Error de conexión. Intenta nuevamente.')
      setLoading(false)
    }
  }

  return (
    <>
      {variant === 'icon' ? (
        <button
          onClick={() => setOpen(true)}
          title="Eliminar ficha"
          className="p-1.5 rounded text-rosa-300 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
        >
          <Trash2 className="h-4 w-4" />
          Eliminar
        </Button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base">Eliminar ficha</h3>
                <p className="text-sm text-gray-500 mt-1">
                  ¿Seguro que quieres eliminar la ficha
                  {pacienteNombre ? ` de ${pacienteNombre}` : ''}?
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setOpen(false); setError(null) }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white border-0"
              >
                {loading ? 'Eliminando…' : 'Sí, eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
