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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const { data: updated, error: updateError } = await supabase
      .from('balanza_configs')
      .update({ nombre, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      if (updateError.code === '23505') {
        return NextResponse.json({ error: 'Ya existe una balanza con ese nombre' }, { status: 409 })
      }
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Replace campos: delete existing then insert
    const { error: deleteError } = await supabase
      .from('balanza_campos')
      .delete()
      .eq('balanza_id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    let insertedCampos: BalanzaCampo[] = []
    if (campos.length > 0) {
      const rows = campos.map((c, idx) => ({
        balanza_id: id,
        nombre_campo: c.nombre_campo.trim(),
        unidad: c.unidad,
        orden: typeof c.orden === 'number' ? c.orden : idx,
      }))

      const { data: camposData, error: insertError } = await supabase
        .from('balanza_campos')
        .insert(rows)
        .select()

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      insertedCampos = (camposData ?? []) as BalanzaCampo[]
    }

    return NextResponse.json({ ...(updated as BalanzaConfig), campos: insertedCampos })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('balanza_configs')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
