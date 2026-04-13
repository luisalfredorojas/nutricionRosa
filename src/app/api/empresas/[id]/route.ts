import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const nombre = (body.nombre ?? '').trim()

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('empresas')
      .update({ nombre })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Ya existe una empresa con ese nombre' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('empresas')
      .delete()
      .eq('id', params.id)

    if (error) {
      if (error.code === '23503') {
        return NextResponse.json(
          { error: 'No se puede eliminar: hay pacientes asociados a esta empresa' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
