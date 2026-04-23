export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { TablaClientWrapper } from '@/components/tabla/TablaClientWrapper'

export default async function TablaPage() {
  const supabase = await createClient()

  const { data: fichasRaw } = await supabase
    .from('fichas_nutricionales')
    .select(`
      id,
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
    .eq('tipo', 'inicial')
    .order('fecha_consulta', { ascending: false })

  function calcularEdad(fechaNacimiento: string | null): number | null {
    if (!fechaNacimiento) return null
    const hoy = new Date()
    const nac = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nac.getFullYear()
    const mes = hoy.getMonth() - nac.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--
    return edad
  }

  // Transform to flat FichaRow format
  const rows = (fichasRaw ?? []).map((f) => {
    const p = f.pacientes as unknown as {
      nombre: string
      sexo: string
      correo: string | null
      ciudad: string | null
      fecha_nacimiento: string | null
      tipo_paciente: string
      empresas: { nombre: string } | null
    } | null

    return {
      id: f.id,
      nombre: p?.nombre ?? '—',
      empresa: p?.empresas?.nombre ?? null,
      fecha_consulta: f.fecha_consulta ?? '',
      sexo: p?.sexo ?? null,
      ciudad: p?.ciudad ?? null,
      correo: p?.correo ?? null,
      fecha_nacimiento: p?.fecha_nacimiento ?? null,
      edad: calcularEdad(p?.fecha_nacimiento ?? null),
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
      digestion: f.digestion,
      descanso: f.descanso,
      nivel_estres: f.nivel_estres,
      consumo_agua: f.consumo_agua,
      consumo_frutas: f.consumo_frutas,
      consumo_vegetales: f.consumo_vegetales,
      actividad_fisica: f.actividad_fisica,
      consumo_cafe: f.consumo_cafe,
      consumo_alcohol: f.consumo_alcohol,
      consumo_tabaco: f.consumo_tabaco,
    }
  })

  return <TablaClientWrapper initialData={rows} />
}
