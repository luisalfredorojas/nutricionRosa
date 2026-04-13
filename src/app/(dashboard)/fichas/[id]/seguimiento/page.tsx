export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { SeguimientoForm } from '@/components/ficha/SeguimientoForm'

interface PageProps {
  params: { id: string }
}

export default async function SeguimientoPage({ params }: PageProps) {
  const supabase = await createClient()

  const { data: ficha } = await supabase
    .from('fichas_nutricionales')
    .select(`
      id,
      paciente_id,
      pacientes (
        nombre,
        sexo,
        fecha_nacimiento,
        correo,
        ciudad,
        empresas ( nombre )
      )
    `)
    .eq('id', params.id)
    .single()

  if (!ficha) notFound()

  const paciente = ficha.pacientes as unknown as {
    nombre: string
    sexo: string
    fecha_nacimiento: string
    correo: string | null
    ciudad: string | null
    codigo?: string | null
    empresas: { nombre: string } | null
  } | null

  const fichaAny = ficha as any
  const pacienteCodigo: string | null = paciente?.codigo ?? null

  function Field({ label, value }: { label: string; value: string | null | undefined }) {
    return (
      <div>
        <p className="text-xs text-rosa-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-rosa-800 mt-0.5">{value ?? '—'}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/fichas/${params.id}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Volver a Ficha
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-rosa-800">
            Seguimiento — {paciente?.nombre ?? 'Paciente'}
            {pacienteCodigo && (
              <span className="ml-2 text-base text-rosa-400 font-mono font-normal">
                ({pacienteCodigo})
              </span>
            )}
          </h1>
          <p className="text-rosa-500 text-sm">Registrar nueva consulta de seguimiento</p>
        </div>
      </div>

      {/* Patient info card (read-only) */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Datos del Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Nombre" value={paciente?.nombre} />
            <Field label="Sexo" value={paciente?.sexo} />
            <Field label="Fecha nacimiento" value={paciente?.fecha_nacimiento ? formatDate(paciente.fecha_nacimiento) : null} />
            <Field label="Empresa" value={paciente?.empresas?.nombre} />
          </div>
        </CardContent>
      </Card>

      <SeguimientoForm fichaId={params.id} sexo={paciente?.sexo ?? 'Femenino'} />
    </div>
  )
}
