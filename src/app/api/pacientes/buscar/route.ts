import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { escapeLikePattern } from '@/lib/utils'

// GET /api/pacientes/buscar?correo=...
// Busca un paciente existente por correo (case-insensitive) para evitar duplicados
// al crear una ficha nueva. Devuelve el paciente y su última ficha (para ofrecer
// registrar un seguimiento en vez de crear un paciente duplicado).
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const correo = (searchParams.get('correo') ?? '').trim().toLowerCase()

    if (!correo) {
      return NextResponse.json({ existe: false })
    }

    const { data: paciente, error } = await supabase
      .from('pacientes')
      .select('id, nombre, codigo')
      .ilike('correo', escapeLikePattern(correo))
      .limit(1)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!paciente) {
      return NextResponse.json({ existe: false })
    }

    // Última ficha del paciente (la más reciente por fecha de consulta),
    // para colgar el seguimiento de ella.
    const { data: ultimaFicha } = await supabase
      .from('fichas_nutricionales')
      .select('id')
      .eq('paciente_id', paciente.id)
      .order('fecha_consulta', { ascending: false })
      .limit(1)
      .maybeSingle()

    return NextResponse.json({
      existe: true,
      paciente: {
        id: paciente.id,
        nombre: paciente.nombre,
        codigo: paciente.codigo,
      },
      ultimaFicha: ultimaFicha ? { id: ultimaFicha.id } : null,
    })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
