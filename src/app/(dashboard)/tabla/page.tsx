export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { TablaClientWrapper } from '@/components/tabla/TablaClientWrapper'
import { BackButton } from '@/components/layout/BackButton'
import type { PacienteRow, FichaSnapshot } from '@/components/tabla/ColumnDefs'

export default async function TablaPage() {
  const supabase = await createClient()

  const { data: fichasRaw } = await supabase
    .from('fichas_nutricionales')
    .select(`
      id,
      tipo,
      fecha_consulta,
      imc,
      indice_cc,
      circunferencia_cintura,
      circunferencia_cadera,
      peso_kg,
      talla_m,
      porcentaje_masa_grasa,
      porcentaje_masa_muscular,
      edad_metabolica,
      grasa_visceral,
      peso_ideal,
      dx_grasa,
      dx_musculo,
      riesgo_metabolico,
      digestion,
      descanso,
      nivel_estres,
      consumo_agua,
      consumo_frutas,
      consumo_vegetales,
      actividad_fisica,
      consumo_cafe,
      consumo_alcohol,
      consumo_tabaco,
      pacientes!inner (
        id,
        nombre,
        sexo,
        correo,
        ciudad,
        fecha_nacimiento,
        tipo_paciente,
        empresa_id,
        empresas (
          nombre
        )
      )
    `)
    .eq('pacientes.tipo_paciente', 'empresa')
    .order('fecha_consulta', { ascending: true })

  function calcularEdad(fechaNacimiento: string | null): number | null {
    if (!fechaNacimiento) return null
    const hoy = new Date()
    const nac = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nac.getFullYear()
    const mes = hoy.getMonth() - nac.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--
    return edad
  }

  type RawFicha = {
    id: string
    tipo: 'inicial' | 'seguimiento' | null
    fecha_consulta: string | null
    imc: number | null
    indice_cc: number | null
    circunferencia_cintura: number | null
    circunferencia_cadera: number | null
    peso_kg: number | null
    talla_m: number | null
    porcentaje_masa_grasa: number | null
    porcentaje_masa_muscular: number | null
    edad_metabolica: number | null
    grasa_visceral: number | null
    peso_ideal: number | null
    dx_grasa: string | null
    dx_musculo: string | null
    riesgo_metabolico: string | null
    digestion: string | null
    descanso: string | null
    nivel_estres: string | null
    consumo_agua: string | null
    consumo_frutas: string | null
    consumo_vegetales: string | null
    actividad_fisica: string | null
    consumo_cafe: string | null
    consumo_alcohol: string | null
    consumo_tabaco: string | null
    pacientes: {
      id: string
      nombre: string
      sexo: string | null
      correo: string | null
      ciudad: string | null
      fecha_nacimiento: string | null
      tipo_paciente: string
      empresa_id: string | null
      empresas: { nombre: string } | null
    } | null
  }

  const grouped = new Map<string, PacienteRow>()

  for (const f of (fichasRaw ?? []) as unknown as RawFicha[]) {
    const p = f.pacientes
    if (!p) continue

    const snapshot: FichaSnapshot = {
      id: f.id,
      tipo: f.tipo,
      fecha_consulta: f.fecha_consulta ?? '',
      peso_kg: f.peso_kg,
      talla_m: f.talla_m,
      imc: f.imc,
      circunferencia_cintura: f.circunferencia_cintura,
      circunferencia_cadera: f.circunferencia_cadera,
      indice_cc: f.indice_cc,
      porcentaje_masa_grasa: f.porcentaje_masa_grasa,
      porcentaje_masa_muscular: f.porcentaje_masa_muscular,
      edad_metabolica: f.edad_metabolica,
      grasa_visceral: f.grasa_visceral,
      peso_ideal: f.peso_ideal,
      dx_grasa: f.dx_grasa,
      dx_musculo: f.dx_musculo,
      riesgo_metabolico: f.riesgo_metabolico,
    }

    let row = grouped.get(p.id)
    if (!row) {
      row = {
        paciente_id: p.id,
        nombre: p.nombre,
        empresa: p.empresas?.nombre ?? null,
        sexo: p.sexo,
        ciudad: p.ciudad,
        correo: p.correo,
        fecha_nacimiento: p.fecha_nacimiento,
        edad: calcularEdad(p.fecha_nacimiento),
        digestion: null,
        descanso: null,
        nivel_estres: null,
        consumo_agua: null,
        consumo_frutas: null,
        consumo_vegetales: null,
        actividad_fisica: null,
        consumo_cafe: null,
        consumo_alcohol: null,
        consumo_tabaco: null,
        fichas: [],
        num_fichas: 0,
        fecha_consulta: '',
      }
      grouped.set(p.id, row)
    }
    row.fichas.push(snapshot)

    // hábitos: tomar los de la ficha más reciente disponible
    const isLatestSoFar =
      !row.fecha_consulta || (snapshot.fecha_consulta && snapshot.fecha_consulta >= row.fecha_consulta)
    if (isLatestSoFar) {
      row.fecha_consulta = snapshot.fecha_consulta
      row.digestion = f.digestion
      row.descanso = f.descanso
      row.nivel_estres = f.nivel_estres
      row.consumo_agua = f.consumo_agua
      row.consumo_frutas = f.consumo_frutas
      row.consumo_vegetales = f.consumo_vegetales
      row.actividad_fisica = f.actividad_fisica
      row.consumo_cafe = f.consumo_cafe
      row.consumo_alcohol = f.consumo_alcohol
      row.consumo_tabaco = f.consumo_tabaco
    }
  }

  for (const row of grouped.values()) {
    row.fichas.sort((a, b) => (a.fecha_consulta < b.fecha_consulta ? -1 : a.fecha_consulta > b.fecha_consulta ? 1 : 0))
    row.num_fichas = row.fichas.length
  }

  const rows = Array.from(grouped.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))

  return (
    <>
      <BackButton href="/empresas" />
      <TablaClientWrapper initialData={rows} />
    </>
  )
}
