export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { IndicadoresDashboard } from '@/components/indicadores/IndicadoresDashboard'

interface PageProps {
  params: { id: string }
}

export default async function PrivadoIndicadoresPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('pacientes')
    .select('nombre')
    .eq('id', params.id)
    .maybeSingle()

  const nombre = (data as { nombre?: string } | null)?.nombre ?? null

  return (
    <IndicadoresDashboard
      scope="privado"
      entityId={params.id}
      entityNombre={nombre}
    />
  )
}
