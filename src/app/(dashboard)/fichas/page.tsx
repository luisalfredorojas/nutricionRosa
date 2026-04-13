export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { FichasListClient } from '@/components/ficha/FichasListClient'

export default async function FichasPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('fichas_nutricionales')
    .select(`
      id, fecha_consulta, imc, riesgo_metabolico,
      pacientes ( nombre, empresas ( nombre ) )
    `)
    .order('fecha_consulta', { ascending: false })
    .limit(200)

  const fichas = (data ?? []).map((f) => {
    const p = f.pacientes as unknown as {
      nombre: string
      empresas: { nombre: string } | null
    } | null
    return {
      id: f.id,
      fecha_consulta: f.fecha_consulta,
      imc: f.imc,
      riesgo_metabolico: f.riesgo_metabolico,
      nombre: p?.nombre ?? null,
      empresa: p?.empresas?.nombre ?? null,
    }
  })

  return <FichasListClient fichas={fichas} />
}
