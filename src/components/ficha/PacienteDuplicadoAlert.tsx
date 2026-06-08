'use client'

import Link from 'next/link'
import { AlertTriangle, X } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'

interface PacienteDuplicadoAlertProps {
  paciente: { nombre: string; codigo: string }
  /** Última ficha del paciente. Si existe, se ofrece registrar un seguimiento.
   *  Si es null (paciente sin fichas), se ofrece reutilizar el paciente. */
  ultimaFichaId: string | null
  /** Callback para el caso huérfano: reutilizar el paciente existente. */
  onUsarPaciente?: () => void
  onDismiss?: () => void
  usando?: boolean
}

export function PacienteDuplicadoAlert({
  paciente,
  ultimaFichaId,
  onUsarPaciente,
  onDismiss,
  usando,
}: PacienteDuplicadoAlertProps) {
  return (
    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-amber-800">
            Ya existe un paciente con ese correo:{' '}
            <span className="font-semibold">{paciente.nombre}</span>{' '}
            <span className="text-amber-700">({paciente.codigo})</span>.
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            {ultimaFichaId
              ? 'Para registrar un control usa el seguimiento de su última ficha, en vez de crear un paciente nuevo.'
              : 'Este paciente aún no tiene fichas. Puedes crear esta ficha para él sin duplicarlo.'}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {ultimaFichaId ? (
              <Link
                href={`/fichas/${ultimaFichaId}/seguimiento`}
                className={buttonVariants({ size: 'sm' })}
              >
                Registrar seguimiento
              </Link>
            ) : (
              onUsarPaciente && (
                <Button type="button" size="sm" onClick={onUsarPaciente} disabled={usando}>
                  {usando ? 'Guardando...' : 'Usar este paciente'}
                </Button>
              )
            )}
          </div>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Descartar aviso"
            className="text-amber-600 hover:text-amber-800 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
