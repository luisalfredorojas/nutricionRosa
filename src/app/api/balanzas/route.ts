import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { BalanzaCampo, BalanzaConfig } from '@/types/database'

type Unidad = '%' | 'kg' | 'lb'

interface CampoInput {
  nombre_campo: string
  unidad: Unidad
  orden?: number
}

const VALID_UNIDADES: Unidad[] = ['%', 'kg', 'lb']

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: balanzas, error: balanzasError } = await supabase
      .from('balanza_configs')
      .select('*')
      .order('nombre')

    if (balanzasError) {
      return NextResponse.json({ error: balanzasError.message }, { status: 500 })
    }

    const { data: campos, error: camposError } = await supabase
      .from('balanza_campos')
      .select('*')
      .order('orden')

    if (camposError) {
      return NextResponse.json({ error: camposError.message }, { status: 500 })
    }

    const balanzasList = (balanzas ?? []) as BalanzaConfig[]
    const camposList = (campos ?? []) as BalanzaCampo[]

    const result = balanzasList.map((b) => ({
      ...b,
      campos: camposList.filter((c) => c.balanza_id === b.id),
    }))

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const nombre = (body.nombre ?? '').trim()
    const campos: CampoInput[] = Array.isArray(body.campos) ? body.campos : []

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    for (const c of campos) {
      if (!c.nombre_campo || !String(c.nombre_campo).trim()) {
        return NextResponse.json({ error: 'Todos los campos deben tener un nombre' }, { status: 400 })
      }
      if (!VALID_UNIDADES.includes(c.unidad)) {
        return NextResponse.json({ error: 'Unidad inválida' }, { status: 400 })
      }
    }

    const { data: balanza, error: insertError } = await supabase
      .from('balanza_configs')
      .insert({ nombre })
      .select()
      .single()

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'Ya existe una balanza con ese nombre' }, { status: 409 })
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    const balanzaRow = balanza as BalanzaConfig

    let insertedCampos: BalanzaCampo[] = []
    if (campos.length > 0) {
      const rows = campos.map((c, idx) => ({
        balanza_id: balanzaRow.id,
        nombre_campo: c.nombre_campo.trim(),
        unidad: c.unidad,
        orden: typeof c.orden === 'number' ? c.orden : idx,
      }))

      const { data: camposData, error: camposError } = await supabase
        .from('balanza_campos')
        .insert(rows)
        .select()

      if (camposError) {
        // Rollback the balanza if campos insert fails
        await supabase.from('balanza_configs').delete().eq('id', balanzaRow.id)
        return NextResponse.json({ error: camposError.message }, { status: 500 })
      }

      insertedCampos = (camposData ?? []) as BalanzaCampo[]
    }

    return NextResponse.json({ ...balanzaRow, campos: insertedCampos }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
