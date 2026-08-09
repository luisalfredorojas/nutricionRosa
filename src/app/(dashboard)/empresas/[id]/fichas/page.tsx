export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FichasListClient } from '@/components/ficha/FichasListClient'
import { BulkUpload } from '@/components/empresas/BulkUpload'
import { BackButton } from '@/components/layout/BackButton'

interface PageProps {
  params: { id: string }
}

export default async function EmpresaFichasPage({ params }: PageProps) {
  const supabase = await createClient()

  const { data: empresa } = await supabase
    .from('empresas')
    .select('id, nombre')
    .eq('id', params.id)
    .single()

  if (!empresa) notFound()

  // Traemos todas las fichas de los pacientes de la empresa (no solo la inicial)
  // ordenadas de la más reciente a la más antigua, para quedarnos con la ÚLTIMA
  // consulta de cada paciente como fila representativa.
  const { data } = await supabase
    .from('fichas_nutricionales')
    .select(`
      id, fecha_consulta, imc, riesgo_metabolico, tipo, paciente_id, created_at,
      pacientes!inner( nombre, codigo, empresa_id, empresas( nombre ) )
    `)
    .eq('pacientes.empresa_id', params.id)
    .order('fecha_consulta', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(2000)

  // Como las filas vienen ordenadas de más reciente a más antigua, la primera que
  // aparece por paciente es su última consulta.
  const latestByPaciente = new Map<string, NonNullable<typeof data>[number]>()
  for (const f of data ?? []) {
    const pid = (f as any).paciente_id as string
    if (!latestByPaciente.has(pid)) latestByPaciente.set(pid, f)
  }

  const fichas = Array.from(latestByPaciente.values()).map((f) => {
    const p = f.pacientes as unknown as {
      nombre: string
      codigo?: string | null
      empresas: { nombre: string } | null
    } | null
    const fAny = f as any
    return {
      id: f.id,
      fecha_consulta: f.fecha_consulta,
      imc: f.imc,
      riesgo_metabolico: f.riesgo_metabolico,
      nombre: p?.nombre ?? null,
      empresa: p?.empresas?.nombre ?? null,
      codigo: p?.codigo ?? null,
      tipo: fAny.tipo ?? null,
    }
  })

  return (
    <>
      <BackButton href="/empresas/fichas" />
      <BulkUpload empresaId={empresa.id} empresaNombre={empresa.nombre} />
      <FichasListClient
        fichas={fichas}
        titulo={`Fichas — ${empresa.nombre}`}
        showEmpresa={false}
        nuevaFichaHref={`/fichas/nueva?tipo=empresa&empresa_id=${params.id}`}
      />
    </>
  )
}
