import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fichaCompletaSchema } from '@/lib/validators/ficha'
import { calcularTodosLosIndicadores } from '@/lib/formulas/indicadores'
import { normalizeCiudad } from '@/lib/utils'
import type { SexoType } from '@/types/ficha'
import type { Database } from '@/types/database'

function traducirErrorDB(msg: string): string {
  if (msg.includes('invalid input syntax for type date')) return 'Formato de fecha inválido. Verifica los campos de fecha.'
  if (msg.includes('invalid input syntax for type')) return 'Valor inválido en uno de los campos.'
  if (msg.includes('violates not-null constraint')) return 'Hay campos obligatorios vacíos.'
  if (msg.includes('duplicate key') || msg.includes('already exists')) return 'Ya existe un registro con esos datos.'
  if (msg.includes('foreign key')) return 'Referencia inválida. El registro relacionado no existe.'
  if (msg.includes('violates check constraint')) return 'Valor fuera del rango permitido en uno de los campos.'
  return 'Error al guardar. Verifica los datos e intenta nuevamente.'
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('fichas_nutricionales')
      .select(`
        *,
        pacientes (
          *,
          empresas (*)
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Ficha no encontrada.' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const parseResult = fichaCompletaSchema.partial().safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = parseResult.data
    const sexo = data.sexo as SexoType | undefined

    // Recalculate indicators if relevant fields changed
    const indicadores = calcularTodosLosIndicadores({
      pesoKg: data.peso_kg,
      tallaM: data.talla_m,
      cintura: data.circunferencia_cintura,
      cadera: data.circunferencia_cadera,
      porcentajeGrasa: data.porcentaje_masa_grasa,
      porcentajeMusculo: data.porcentaje_masa_muscular,
      grasaVisceral: data.grasa_visceral,
      sexo: sexo ?? null,
    })

    // Build update payload explicitly
    const payload: Database['public']['Tables']['fichas_nutricionales']['Update'] = {}

    if (data.fecha_consulta !== undefined) payload.fecha_consulta = data.fecha_consulta || undefined
    if (data.motivo_consulta !== undefined) payload.motivo_consulta = data.motivo_consulta || null
    if (data.diagnostico_clinico !== undefined) payload.diagnostico_clinico = data.diagnostico_clinico || null
    if (data.peso_kg !== undefined) payload.peso_kg = data.peso_kg
    if (data.talla_m !== undefined) payload.talla_m = data.talla_m
    if (data.circunferencia_cintura !== undefined) payload.circunferencia_cintura = data.circunferencia_cintura
    if (data.circunferencia_cadera !== undefined) payload.circunferencia_cadera = data.circunferencia_cadera
    if (data.circunferencia_brazo !== undefined) payload.circunferencia_brazo = data.circunferencia_brazo
    if (data.fecha_ultima_menstruacion !== undefined) payload.fecha_ultima_menstruacion = data.fecha_ultima_menstruacion || null
    if (data.balanza_id !== undefined) payload.balanza_id = data.balanza_id || null
    if (data.recordatorio_24h !== undefined) payload.recordatorio_24h = data.recordatorio_24h || null
    if (data.comentarios !== undefined) payload.comentarios = data.comentarios || null
    if (data.porcentaje_masa_grasa !== undefined) payload.porcentaje_masa_grasa = data.porcentaje_masa_grasa
    if (data.porcentaje_masa_muscular !== undefined) payload.porcentaje_masa_muscular = data.porcentaje_masa_muscular
    if (data.edad_metabolica !== undefined) payload.edad_metabolica = data.edad_metabolica
    if (data.grasa_visceral !== undefined) payload.grasa_visceral = data.grasa_visceral
    if (data.digestion !== undefined) payload.digestion = data.digestion
    if (data.descanso !== undefined) payload.descanso = data.descanso
    if (data.nivel_estres !== undefined) payload.nivel_estres = data.nivel_estres
    if (data.consumo_agua !== undefined) payload.consumo_agua = data.consumo_agua
    if (data.consumo_frutas !== undefined) payload.consumo_frutas = data.consumo_frutas
    if (data.consumo_vegetales !== undefined) payload.consumo_vegetales = data.consumo_vegetales
    if (data.actividad_fisica !== undefined) payload.actividad_fisica = data.actividad_fisica
    if (data.consumo_cafe !== undefined) payload.consumo_cafe = data.consumo_cafe
    if (data.consumo_alcohol !== undefined) payload.consumo_alcohol = data.consumo_alcohol
    if (data.consumo_tabaco !== undefined) payload.consumo_tabaco = data.consumo_tabaco
    if (data.no_le_gusta_comer !== undefined) payload.no_le_gusta_comer = data.no_le_gusta_comer || null
    if (data.le_gusta_comer !== undefined) payload.le_gusta_comer = data.le_gusta_comer || null
    if (indicadores.pesoIdeal !== null) payload.peso_ideal = indicadores.pesoIdeal
    if (indicadores.dxGrasa !== null) payload.dx_grasa = indicadores.dxGrasa
    if (indicadores.dxMusculo !== null) payload.dx_musculo = indicadores.dxMusculo
    if (indicadores.riesgoMetabolico !== null) payload.riesgo_metabolico = indicadores.riesgoMetabolico

    const { data: updated, error } = await supabase
      .from('fichas_nutricionales')
      .update(payload)
      .eq('id', params.id)
      .select('id, paciente_id')
      .single()

    if (error || !updated) {
      return NextResponse.json({ error: traducirErrorDB(error?.message ?? '') }, { status: 500 })
    }

    // Update patient fields if any personal data was sent
    const pacientePayload: Record<string, unknown> = {}
    if (data.nombre !== undefined) pacientePayload.nombre = data.nombre
    if (data.fecha_nacimiento !== undefined) pacientePayload.fecha_nacimiento = data.fecha_nacimiento
    if (data.sexo !== undefined) pacientePayload.sexo = data.sexo
    if (data.correo !== undefined) pacientePayload.correo = data.correo
    if (data.ciudad !== undefined) pacientePayload.ciudad = normalizeCiudad(data.ciudad)
    if (data.tipo_paciente !== undefined) pacientePayload.tipo_paciente = data.tipo_paciente
    if (data.empresa_id !== undefined) pacientePayload.empresa_id = data.empresa_id || null

    if (Object.keys(pacientePayload).length > 0 && (updated as any).paciente_id) {
      await supabase
        .from('pacientes')
        .update(pacientePayload)
        .eq('id', (updated as any).paciente_id)
    }

    return NextResponse.json({ data: { id: updated.id } })
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

    // Requiere sesión activa: si no hay usuario, RLS oculta la fila y el delete
    // afecta 0 filas sin error, dando la sensación de que "no elimina".
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) {
      return NextResponse.json({ error: 'No autenticado. Vuelve a iniciar sesión.' }, { status: 401 })
    }

    // Desvincula seguimientos hijos antes de borrar la ficha padre.
    await supabase
      .from('fichas_nutricionales')
      .update({ ficha_padre_id: null })
      .eq('ficha_padre_id', params.id)

    const { data: deleted, error } = await supabase
      .from('fichas_nutricionales')
      .delete()
      .eq('id', params.id)
      .select('id')

    if (error) {
      return NextResponse.json({ error: traducirErrorDB(error.message) }, { status: 500 })
    }

    if (!deleted || deleted.length === 0) {
      return NextResponse.json(
        { error: 'No se encontró la ficha o no tienes permisos para eliminarla.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, deleted: deleted.length })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
