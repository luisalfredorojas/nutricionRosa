export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { PrivadosListClient, type PrivadoItem } from '@/components/ficha/PrivadosListClient'

export default async function PrivadosPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('fichas_nutricionales')
    .select(`
      id, fecha_consulta, imc, riesgo_metabolico, paciente_id, tipo,
      pacientes!inner( nombre, codigo, tipo_paciente )
    `)
    .eq('pacientes.tipo_paciente', 'privado')
    .order('fecha_consulta', { ascending: true })
    .limit(1000)

  type Row = {
    id: string
    fecha_consulta: string | null
    imc: number | null
    riesgo_metabolico: string | null
    paciente_id: string
    tipo?: string | null
    pacientes: { nombre: string; codigo?: string | null; tipo_paciente: string } | null
  }

  const rows = (data ?? []) as unknown as Row[]

  // Group by paciente_id
  const byPaciente = new Map<string, { original: Row; count: number }>()

  for (const r of rows) {
    const rAny = r as any
    const existing = byPaciente.get(r.paciente_id)
    if (!existing) {
      byPaciente.set(r.paciente_id, { original: r, count: 1 })
    } else {
      existing.count += 1
      // Prefer a ficha with tipo === 'inicial'
      const existingTipo = (existing.original as any).tipo
      if (rAny.tipo === 'inicial' && existingTipo !== 'inicial') {
        existing.original = r
      } else if (existingTipo !== 'inicial') {
        // Otherwise keep oldest (rows are ordered asc, so existing is already older)
        // no-op
      }
    }
  }

  const items: PrivadoItem[] = Array.from(byPaciente.values())
    .map(({ original, count }) => {
      const p = original.pacientes
      return {
        id: original.id,
        fecha_consulta: original.fecha_consulta,
        imc: original.imc,
        riesgo_metabolico: original.riesgo_metabolico,
        nombre: p?.nombre ?? null,
        codigo: p?.codigo ?? null,
        consultas: count,
      }
    })
    .sort((a, b) => (a.nombre ?? '').localeCompare(b.nombre ?? ''))

  return (
    <PrivadosListClient
      items={items}
      titulo="Pacientes Privados"
      nuevaFichaHref="/fichas/nueva?tipo=privado"
    />
  )
}
