export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { FichasListClient } from '@/components/ficha/FichasListClient'

export default async function EmpresasPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('fichas_nutricionales')
    .select(`
      id, fecha_consulta, imc, riesgo_metabolico,
      pacientes!inner( nombre, codigo, tipo_paciente, empresas( nombre ) )
    `)
    .eq('pacientes.tipo_paciente', 'empresa')
    .order('fecha_consulta', { ascending: false })
    .limit(200)

  const fichas = (data ?? []).map((f) => {
    const p = f.pacientes as unknown as {
      nombre: string
      codigo?: string | null
      tipo_paciente: string
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
    <FichasListClient
      fichas={fichas}
      titulo="Pacientes de Empresas"
      showEmpresa={true}
      nuevaFichaHref="/fichas/nueva?tipo=empresa"
    />
  )
}
