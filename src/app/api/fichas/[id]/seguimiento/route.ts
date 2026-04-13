import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fichaCompletaSchema } from '@/lib/validators/ficha'
import { calcularTodosLosIndicadores } from '@/lib/formulas/indicadores'
import type { SexoType } from '@/types/ficha'

interface RouteParams {
  params: { id: string }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validate with partial schema (no personal data required)
    const partialSchema = fichaCompletaSchema.partial()
    const parseResult = partialSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = parseResult.data

    // Fetch parent ficha to get paciente_id and sexo
    const { data: fichapadre, error: fichapadreError } = await supabase
      .from('fichas_nutricionales')
      .select('paciente_id, pacientes ( sexo )')
      .eq('id', params.id)
      .single()

    if (fichapadreError || !fichapadre) {
      return NextResponse.json(
        { error: 'Ficha padre no encontrada' },
        { status: 404 }
      )
    }

    const pacienteId = fichapadre.paciente_id
    const paciente = fichapadre.pacientes as unknown as { sexo: string } | null
    const sexo = (paciente?.sexo ?? data.sexo ?? 'Femenino') as SexoType

    // Calculate indicators
    const indicadores = calcularTodosLosIndicadores({
      pesoKg: data.peso_kg ?? null,
      tallaM: data.talla_m ?? null,
      cintura: data.circunferencia_cintura ?? null,
      cadera: data.circunferencia_cadera ?? null,
      porcentajeGrasa: data.porcentaje_masa_grasa ?? null,
      porcentajeMusculo: data.porcentaje_masa_muscular ?? null,
      grasaVisceral: data.grasa_visceral ?? null,
      sexo,
    })

    // Insert seguimiento ficha
    const { data: ficha, error: fichaError } = await supabase
      .from('fichas_nutricionales')
      .insert({
        paciente_id: pacienteId,
        ficha_padre_id: params.id,
        tipo: 'seguimiento',
        fecha_consulta: data.fecha_consulta ?? new Date().toISOString().split('T')[0],
        motivo_consulta: data.motivo_consulta ?? null,
        diagnostico_clinico: data.diagnostico_clinico ?? null,
        peso_kg: data.peso_kg ?? null,
        talla_m: data.talla_m ?? null,
        circunferencia_cintura: data.circunferencia_cintura ?? null,
        circunferencia_cadera: data.circunferencia_cadera ?? null,
        recordatorio_24h: data.recordatorio_24h ?? null,
        comentarios: data.comentarios ?? null,
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
        no_le_gusta_comer: data.no_le_gusta_comer ?? null,
        peso_ideal: indicadores.pesoIdeal,
        dx_grasa: indicadores.dxGrasa,
        dx_musculo: indicadores.dxMusculo,
        riesgo_metabolico: indicadores.riesgoMetabolico,
      } as any)
      .select('id, paciente_id')
      .single()

    if (fichaError || !ficha) {
      return NextResponse.json(
        { error: fichaError?.message ?? 'Error creando seguimiento' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { data: { id: (ficha as any).id, paciente_id: (ficha as any).paciente_id } },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
