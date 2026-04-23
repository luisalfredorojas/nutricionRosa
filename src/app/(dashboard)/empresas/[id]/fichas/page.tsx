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

  const { data } = await supabase
    .from('fichas_nutricionales')
    .select(`
      id, fecha_consulta, imc, riesgo_metabolico, tipo,
      pacientes!inner( nombre, codigo, empresa_id, empresas( nombre ) )
    `)
    .eq('pacientes.empresa_id', params.id)
    .eq('tipo', 'inicial')
    .order('fecha_consulta', { ascending: false })
    .limit(500)

  const fichas = (data ?? []).map((f) => {
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
