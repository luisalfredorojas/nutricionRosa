import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fichaCompletaSchema } from '@/lib/validators/ficha'
import { calcularTodosLosIndicadores } from '@/lib/formulas/indicadores'
import type { SexoType } from '@/types/ficha'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const empresaId = searchParams.get('empresa_id')
    const pacienteId = searchParams.get('paciente_id')

    let query = supabase
      .from('fichas_nutricionales')
      .select(`
        *,
        pacientes (
          id,
          nombre,
          fecha_nacimiento,
          sexo,
          correo,
          ciudad,
          empresa_id,
          empresas (
            id,
            nombre
          )
        )
      `)
      .order('fecha_consulta', { ascending: false })

    if (pacienteId) {
      query = query.eq('paciente_id', pacienteId)
    }

    if (empresaId) {
      query = query.eq('pacientes.empresa_id', empresaId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validate with Zod
    const parseResult = fichaCompletaSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = parseResult.data
    const sexo = data.sexo as SexoType

    // Upsert or create paciente
    let pacienteId: string = body.paciente_id

    if (!pacienteId) {
      const { data: paciente, error: pacienteError } = await supabase
        .from('pacientes')
        .insert({
          nombre: data.nombre,
          fecha_nacimiento: data.fecha_nacimiento,
          sexo,
          correo: data.correo || null,
          ciudad: data.ciudad || null,
          tipo_paciente: data.tipo_paciente ?? 'empresa',
          empresa_id: data.tipo_paciente === 'privado' ? null : (data.empresa_id || null),
        })
        .select('id')
        .single()

      if (pacienteError || !paciente) {
        return NextResponse.json(
          { error: pacienteError?.message ?? 'Error creando paciente' },
          { status: 500 }
        )
      }
      pacienteId = paciente.id
    }

    // Calculate indicators
    const indicadores = calcularTodosLosIndicadores({
      pesoKg: data.peso_kg,
      tallaM: data.talla_m,
      cintura: data.circunferencia_cintura,
      cadera: data.circunferencia_cadera,
      porcentajeGrasa: data.porcentaje_masa_grasa,
      porcentajeMusculo: data.porcentaje_masa_muscular,
      grasaVisceral: data.grasa_visceral,
      sexo,
    })

    // Insert ficha
    const { data: ficha, error: fichaError } = await supabase
      .from('fichas_nutricionales')
      .insert({
        paciente_id: pacienteId,
        fecha_consulta: data.fecha_consulta,
        motivo_consulta: data.motivo_consulta || null,
        diagnostico_clinico: data.diagnostico_clinico || null,
        peso_kg: data.peso_kg ?? null,
        talla_m: data.talla_m ?? null,
        circunferencia_cintura: data.circunferencia_cintura ?? null,
        circunferencia_cadera: data.circunferencia_cadera ?? null,
        circunferencia_brazo: data.circunferencia_brazo ?? null,
        fecha_ultima_menstruacion: data.fecha_ultima_menstruacion || null,
        recordatorio_24h: data.recordatorio_24h || null,
        comentarios: data.comentarios || null,
        balanza_id: data.balanza_id || null,
        porcentaje_masa_grasa: data.porcentaje_masa_grasa ?? null,
        porcentaje_masa_muscular: data.porcentaje_masa_muscular ?? null,
        edad_metabolica: data.edad_metabolica ?? null,
        grasa_visceral: data.grasa_visceral ?? null,
        digestion: data.digestion ?? null,
        descanso: data.descanso ?? null,
        nivel_estres: data.nivel_estres ?? null,
        consumo_agua: data.consumo_agua ?? null,
        consumo_frutas: data.consumo_frutas ?? null,
        consumo_vegetales: data.consumo_vegetales ?? null,
        actividad_fisica: data.actividad_fisica ?? null,
        consumo_cafe: data.consumo_cafe ?? null,
        consumo_alcohol: data.consumo_alcohol ?? null,
        consumo_tabaco: data.consumo_tabaco ?? null,
        no_le_gusta_comer: data.no_le_gusta_comer || null,
        le_gusta_comer: data.le_gusta_comer || null,
        peso_ideal: indicadores.pesoIdeal,
        dx_grasa: indicadores.dxGrasa,
        dx_musculo: indicadores.dxMusculo,
        riesgo_metabolico: indicadores.riesgoMetabolico,
      })
      .select('id')
      .single()

    if (fichaError || !ficha) {
      return NextResponse.json(
        { error: fichaError?.message ?? 'Error creando ficha' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { id: ficha.id, paciente_id: pacienteId } }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
