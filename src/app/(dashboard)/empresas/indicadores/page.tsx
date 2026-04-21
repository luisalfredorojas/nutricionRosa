export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { EmpresaIndicadoresSelector } from './EmpresaIndicadoresSelector'

interface Empresa {
  id: string
  nombre: string
}

export default async function EmpresasIndicadoresPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('empresas')
    .select('id, nombre')
    .order('nombre', { ascending: true })

  const empresas = (data ?? []) as Empresa[]

  return <EmpresaIndicadoresSelector empresas={empresas} />
}
