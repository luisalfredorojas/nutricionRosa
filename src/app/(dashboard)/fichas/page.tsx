export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { FichasListClient } from '@/components/ficha/FichasListClient'

export default async function FichasPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('fichas_nutricionales')
    .select(`
      id, fecha_consulta, imc, riesgo_metabolico,
      pacientes ( nombre, codigo, empresas ( nombre ) )
    `)
    .order('fecha_consulta', { ascending: false })
    .limit(200)

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

  return <FichasListClient fichas={fichas} />
}
