export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { FichaForm } from '@/components/ficha/FichaForm'
import { ChevronLeft } from 'lucide-react'
import type { FichaCompletaInput } from '@/lib/validators/ficha'

interface PageProps {
  params: { id: string }
}

export default async function EditFichaPage({ params }: PageProps) {
  const supabase = await createClient()

  const { data: ficha } = await supabase
    .from('fichas_nutricionales')
    .select(`
      *,
      pacientes (
        *,
        empresas (*)
      )
    `)
    .eq('id', params.id)
    .single()

  if (!ficha) notFound()

  const f = ficha as any
  const paciente = f.pacientes as any

  const initialValues: Partial<FichaCompletaInput> = {
    // Patient fields
    nombre: paciente?.nombre ?? '',
    fecha_nacimiento: paciente?.fecha_nacimiento ?? '',
    sexo: paciente?.sexo ?? undefined,
    correo: paciente?.correo ?? '',
    ciudad: paciente?.ciudad ?? '',
    tipo_paciente: paciente?.tipo_paciente ?? 'empresa',
    empresa_id: paciente?.empresa_id ?? '',

    // Ficha nutricional
    fecha_consulta: f.fecha_consulta ?? '',
    motivo_consulta: f.motivo_consulta ?? '',
    diagnostico_clinico: f.diagnostico_clinico ?? '',
    peso_kg: f.peso_kg ?? undefined,
    talla_m: f.talla_m ?? undefined,
    circunferencia_cintura: f.circunferencia_cintura ?? undefined,
    circunferencia_cadera: f.circunferencia_cadera ?? undefined,
    circunferencia_brazo: f.circunferencia_brazo ?? undefined,
    fecha_ultima_menstruacion: f.fecha_ultima_menstruacion ?? '',
    recordatorio_24h: f.recordatorio_24h ?? '',
    comentarios: f.comentarios ?? '',

    // Balanza
    balanza_id: f.balanza_id ?? '',
    porcentaje_masa_grasa: f.porcentaje_masa_grasa ?? undefined,
    porcentaje_masa_muscular: f.porcentaje_masa_muscular ?? undefined,
    edad_metabolica: f.edad_metabolica ?? undefined,
    grasa_visceral: f.grasa_visceral ?? undefined,

    // Hábitos
    digestion: f.digestion ?? undefined,
    descanso: f.descanso ?? undefined,
    nivel_estres: f.nivel_estres ?? undefined,
    consumo_agua: f.consumo_agua ?? undefined,
    consumo_frutas: f.consumo_frutas ?? undefined,
    consumo_vegetales: f.consumo_vegetales ?? undefined,
    actividad_fisica: f.actividad_fisica ?? undefined,
    consumo_cafe: f.consumo_cafe ?? undefined,
    consumo_alcohol: f.consumo_alcohol ?? undefined,
    consumo_tabaco: f.consumo_tabaco ?? undefined,
    no_le_gusta_comer: f.no_le_gusta_comer ?? '',
    le_gusta_comer: f.le_gusta_comer ?? '',
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/fichas/${params.id}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Volver a la ficha
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-rosa-800">Editar Ficha</h1>
          <p className="text-rosa-500 text-sm">{paciente?.nombre}</p>
        </div>
      </div>

      <FichaForm
        fichaId={params.id}
        initialValues={initialValues}
        defaultTipoPaciente={paciente?.tipo_paciente ?? 'empresa'}
        redirectTo={`/fichas/${params.id}`}
      />
    </div>
  )
}
