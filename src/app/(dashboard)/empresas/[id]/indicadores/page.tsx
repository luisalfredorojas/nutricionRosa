export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { IndicadoresDashboard } from '@/components/indicadores/IndicadoresDashboard'

interface PageProps {
  params: { id: string }
}

export default async function EmpresaIndicadoresPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('empresas')
    .select('nombre')
    .eq('id', params.id)
    .maybeSingle()

  const nombre = (data as { nombre?: string } | null)?.nombre ?? null

  return (
    <IndicadoresDashboard
      scope="empresa"
      entityId={params.id}
      entityNombre={nombre}
    />
  )
}
