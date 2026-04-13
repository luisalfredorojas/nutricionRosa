import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IndicadoresCalculadosDisplay } from '@/components/ficha/IndicadoresCalculados'
import type { IndicadoresCalculados } from '@/types/ficha'
import { formatDate, formatDecimal } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'

interface PageProps {
  params: { id: string }
}

export default async function FichaDetailPage({ params }: PageProps) {
  const supabase = await createClient()

  const { data: ficha } = await supabase
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

  if (!ficha) notFound()

  const paciente = ficha.pacientes as { nombre: string; sexo: string; fecha_nacimiento: string; correo: string | null; ciudad: string | null; empresas: { nombre: string } | null } | null

  const indicadores: IndicadoresCalculados = {
    imc: ficha.imc,
    clasificacionIMC: null,
    pesoIdeal: ficha.peso_ideal,
    indiceCC: ficha.indice_cc,
    clasificacionICC: null,
    dxGrasa: ficha.dx_grasa as IndicadoresCalculados['dxGrasa'],
    dxMusculo: ficha.dx_musculo as IndicadoresCalculados['dxMusculo'],
    riesgoMetabolico: ficha.riesgo_metabolico as IndicadoresCalculados['riesgoMetabolico'],
  }

  function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
    return (
      <div>
        <p className="text-xs text-rosa-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-rosa-800 mt-0.5">{value ?? '—'}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/fichas">
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Fichas
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-rosa-800">{paciente?.nombre ?? 'Ficha'}</h1>
          <p className="text-rosa-500 text-sm">
            Consulta del {ficha.fecha_consulta ? formatDate(ficha.fecha_consulta) : '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Datos personales */}
          <Card>
            <CardHeader><CardTitle>Datos Personales</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="Nombre" value={paciente?.nombre} />
                <Field label="Sexo" value={paciente?.sexo} />
                <Field label="Fecha nacimiento" value={paciente?.fecha_nacimiento ? formatDate(paciente.fecha_nacimiento) : null} />
                <Field label="Correo" value={paciente?.correo} />
                <Field label="Ciudad" value={paciente?.ciudad} />
                <Field label="Empresa" value={paciente?.empresas?.nombre} />
              </div>
            </CardContent>
          </Card>

          {/* Ficha nutricional */}
          <Card>
            <CardHeader><CardTitle>Ficha Nutricional</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="Diagnóstico clínico" value={ficha.diagnostico_clinico} />
                <Field label="Peso" value={ficha.peso_kg ? `${ficha.peso_kg} kg` : null} />
                <Field label="Talla" value={ficha.talla_m ? `${ficha.talla_m} m` : null} />
                <Field label="Cintura" value={ficha.circunferencia_cintura ? `${ficha.circunferencia_cintura} cm` : null} />
                <Field label="Cadera" value={ficha.circunferencia_cadera ? `${ficha.circunferencia_cadera} cm` : null} />
              </div>
              {ficha.motivo_consulta && (
                <div className="mt-4">
                  <p className="text-xs text-rosa-500 font-medium uppercase tracking-wide mb-1">Motivo de consulta</p>
                  <p className="text-sm text-rosa-800">{ficha.motivo_consulta}</p>
                </div>
              )}
              {ficha.comentarios && (
                <div className="mt-4">
                  <p className="text-xs text-rosa-500 font-medium uppercase tracking-wide mb-1">Comentarios</p>
                  <p className="text-sm text-rosa-800">{ficha.comentarios}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Datos balanza */}
          <Card>
            <CardHeader><CardTitle>Datos Balanza</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="% Masa grasa" value={ficha.porcentaje_masa_grasa != null ? `${ficha.porcentaje_masa_grasa}%` : null} />
                <Field label="% Masa muscular" value={ficha.porcentaje_masa_muscular != null ? `${ficha.porcentaje_masa_muscular}%` : null} />
                <Field label="Edad metabólica" value={ficha.edad_metabolica} />
                <Field label="Grasa visceral" value={ficha.grasa_visceral} />
              </div>
            </CardContent>
          </Card>

          {/* Hábitos */}
          <Card>
            <CardHeader><CardTitle>Hábitos</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="Digestión" value={ficha.digestion} />
                <Field label="Descanso" value={ficha.descanso} />
                <Field label="Nivel estrés" value={ficha.nivel_estres} />
                <Field label="Consumo agua" value={ficha.consumo_agua} />
                <Field label="Consumo frutas" value={ficha.consumo_frutas} />
                <Field label="Consumo vegetales" value={ficha.consumo_vegetales} />
                <Field label="Actividad física" value={ficha.actividad_fisica} />
                <Field label="Consumo café" value={ficha.consumo_cafe} />
                <Field label="Consumo alcohol" value={ficha.consumo_alcohol} />
                <Field label="Consumo tabaco" value={ficha.consumo_tabaco} />
              </div>
              {ficha.no_le_gusta_comer && (
                <div className="mt-4">
                  <p className="text-xs text-rosa-500 font-medium uppercase tracking-wide mb-1">No le gusta comer</p>
                  <p className="text-sm text-rosa-800">{ficha.no_le_gusta_comer}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Indicators */}
        <div className="space-y-4">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Indicadores</CardTitle>
            </CardHeader>
            <CardContent>
              <IndicadoresCalculadosDisplay indicadores={indicadores} />
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Badge variant={ficha.riesgo_metabolico === 'Bajo' ? 'success' : ficha.riesgo_metabolico === 'Moderado' ? 'warning' : 'danger'}>
              Riesgo: {ficha.riesgo_metabolico ?? '—'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
