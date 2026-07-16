export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IndicadoresCalculadosDisplay } from '@/components/ficha/IndicadoresCalculados'
import { TablaComparativa } from '@/components/ficha/TablaComparativa'
import { ExportFichaPDF } from '@/components/ficha/ExportFichaPDF'
import { ExportFichasPacientePDF } from '@/components/ficha/ExportFichasPacientePDF'
import { FichaExportView } from '@/components/ficha/FichaExportView'
import type { IndicadoresCalculados } from '@/types/ficha'
import { formatDate, formatDecimal } from '@/lib/utils'
import { ChevronLeft, Pencil, Plus } from 'lucide-react'
import { DeleteFichaButton } from '@/components/ficha/DeleteFichaButton'

interface PageProps {
  params: { id: string }
}

// Etiqueta de cada ficha dentro del PDF (fichas ordenadas de la más antigua a la
// más reciente): la primera es la inicial, la última es el último control y las
// intermedias se numeran como "Control número N".
function tagForFicha(index: number, total: number): string {
  if (index === 0) return 'Ficha Inicial'
  if (index === total - 1) return 'Último control'
  return `Control número ${index}`
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

  // Fetch seguimientos (fichas where ficha_padre_id = this ficha's id)
  const { data: seguimientos } = await supabase
    .from('fichas_nutricionales')
    .select('id, fecha_consulta, peso_kg, imc, dx_grasa, riesgo_metabolico')
    .eq('ficha_padre_id' as any, params.id)
    .order('fecha_consulta', { ascending: false })

  const pacienteId: string = (ficha as any).paciente_id ?? ''

  // Todas las fichas del paciente (inicial + controles) ordenadas de la más
  // antigua a la más reciente, para exportarlas juntas en un solo PDF.
  const { data: todasLasFichas } = await supabase
    .from('fichas_nutricionales')
    .select(`
      *,
      pacientes (
        *,
        empresas (*)
      )
    `)
    .eq('paciente_id', pacienteId)
    .order('fecha_consulta', { ascending: true })
    .order('created_at', { ascending: true })

  const fichasParaPDF = (todasLasFichas ?? []) as any[]

  const paciente = ficha.pacientes as {
    nombre: string
    sexo: string
    fecha_nacimiento: string
    correo: string | null
    ciudad: string | null
    codigo?: string | null
    tipo_paciente?: string | null
    empresa_id?: string | null
    empresas: { id?: string; nombre: string } | null
  } | null

  const backHref =
    paciente?.tipo_paciente === 'privado'
      ? '/privados'
      : paciente?.empresas
        ? `/empresas/${paciente.empresa_id}/fichas`
        : '/fichas'

  const fichaAny = ficha as any
  const numeroFicha: string | null = fichaAny.numero_ficha ?? null
  const tipoBadge: string | null = fichaAny.tipo ?? null
  const pacienteCodigo: string | null = paciente?.codigo ?? null

  const indicadores: IndicadoresCalculados = {
    imc: ficha.imc,
    clasificacionIMC: null,
    pesoIdeal: ficha.peso_ideal,
    indiceCC: ficha.indice_cc,
    clasificacionICC: null,
    dxGrasa: ficha.dx_grasa as IndicadoresCalculados['dxGrasa'],
    dxMusculo: ficha.dx_musculo as IndicadoresCalculados['dxMusculo'],
    dxGrasaVisceral: null,
    riesgoMetabolico: ficha.riesgo_metabolico as IndicadoresCalculados['riesgoMetabolico'],
  }

  // Solo para el PDF: si una tarjeta no tiene ningún dato se oculta por completo
  // (en la web siempre se muestra). 0 y null cuentan como vacío en las medidas.
  const hasBalanza =
    !!ficha.porcentaje_masa_grasa ||
    !!ficha.porcentaje_masa_muscular ||
    !!ficha.edad_metabolica ||
    !!ficha.grasa_visceral

  const hasHabitos =
    !!ficha.digestion ||
    !!ficha.descanso ||
    !!ficha.nivel_estres ||
    !!ficha.consumo_agua ||
    !!ficha.consumo_frutas ||
    !!ficha.consumo_vegetales ||
    !!ficha.actividad_fisica ||
    !!ficha.consumo_cafe ||
    !!ficha.consumo_alcohol ||
    !!ficha.consumo_tabaco ||
    !!ficha.no_le_gusta_comer ||
    !!(ficha as any).le_gusta_comer

  function Field({
    label,
    value,
    pdfEmpty,
  }: {
    label: string
    value: string | number | null | undefined
    pdfEmpty?: boolean
  }) {
    // El campo SIEMPRE se muestra en la web. Si está vacío se marca con
    // data-pdf-hide para removerlo únicamente al exportar el PDF
    // (ver ExportFichaPDF → html2canvas onclone). `pdfEmpty` permite tratar
    // como vacíos valores numéricos en 0 (ej: % masa grasa 0%).
    const isEmpty = pdfEmpty ?? (value === null || value === undefined || value === '')
    return (
      <div data-pdf-hide={isEmpty ? '' : undefined}>
        <p className="text-xs text-rosa-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-rosa-800 mt-0.5">{value ?? '—'}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link href={backHref}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            {paciente?.tipo_paciente === 'privado' ? 'Privados' : 'Fichas'}
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-rosa-800">{paciente?.nombre ?? 'Ficha'}</h1>
            {pacienteCodigo && (
              <span className="text-sm text-rosa-400 font-mono">{pacienteCodigo}</span>
            )}
            {numeroFicha && (
              <Badge variant="default" className="bg-rosa-100 text-rosa-700 border border-rosa-200">
                {numeroFicha}
              </Badge>
            )}
            {tipoBadge === 'seguimiento' && (
              <Badge variant="warning">Seguimiento</Badge>
            )}
          </div>
          <p className="text-rosa-500 text-sm">
            Consulta del {ficha.fecha_consulta ? formatDate(ficha.fecha_consulta) : '—'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ExportFichasPacientePDF
            containerId={`fichas-export-all-${pacienteId}`}
            pacienteNombre={paciente?.nombre}
            label="Descargar Fichas"
          />
          <ExportFichaPDF
            fichaId={params.id}
            pacienteId={pacienteId}
            pacienteNombre={paciente?.nombre}
            targetId={`tabla-comparativa-${pacienteId}`}
            label="Descargar Tabla"
          />
          <DeleteFichaButton
            fichaId={params.id}
            pacienteNombre={paciente?.nombre}
            redirectTo={backHref}
            variant="full"
          />
          <Link href={`/fichas/${params.id}/editar`}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          </Link>
          <Link href={`/fichas/${params.id}/seguimiento`}>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Crear Seguimiento
            </Button>
          </Link>
        </div>
      </div>

      <div id={`ficha-export-${params.id}`} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
                {(fichaAny.circunferencia_brazo != null) && (
                  <Field
                    label="Brazo"
                    value={`${fichaAny.circunferencia_brazo} cm`}
                    pdfEmpty={!fichaAny.circunferencia_brazo}
                  />
                )}
                {paciente?.sexo === 'Femenino' && (
                  <Field
                    label="Última menstruación"
                    value={fichaAny.fecha_ultima_menstruacion ? formatDate(fichaAny.fecha_ultima_menstruacion) : null}
                  />
                )}
              </div>
              {ficha.motivo_consulta && (
                <div className="mt-4">
                  <p className="text-xs text-rosa-500 font-medium uppercase tracking-wide mb-1">Motivo de consulta</p>
                  <p className="text-sm text-rosa-800">{ficha.motivo_consulta}</p>
                </div>
              )}
              {ficha.recordatorio_24h && (
                <div className="mt-4">
                  <p className="text-xs text-rosa-500 font-medium uppercase tracking-wide mb-1">Recordatorio 24h</p>
                  <p className="text-sm text-rosa-800 whitespace-pre-wrap">{ficha.recordatorio_24h}</p>
                </div>
              )}
              {ficha.comentarios && (
                <div className="mt-4">
                  <p className="text-xs text-rosa-500 font-medium uppercase tracking-wide mb-1">Comentarios</p>
                  <p className="text-sm text-rosa-800 whitespace-pre-wrap">{ficha.comentarios}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Datos balanza */}
          <Card data-pdf-hide={hasBalanza ? undefined : ''}>
            <CardHeader><CardTitle>Datos Balanza</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="% Masa grasa" value={ficha.porcentaje_masa_grasa != null ? `${ficha.porcentaje_masa_grasa}%` : null} pdfEmpty={!ficha.porcentaje_masa_grasa} />
                <Field label="% Masa muscular" value={ficha.porcentaje_masa_muscular != null ? `${ficha.porcentaje_masa_muscular}%` : null} pdfEmpty={!ficha.porcentaje_masa_muscular} />
                <Field label="Edad metabólica" value={ficha.edad_metabolica} pdfEmpty={!ficha.edad_metabolica} />
                <Field label="Grasa visceral" value={ficha.grasa_visceral} pdfEmpty={!ficha.grasa_visceral} />
              </div>
            </CardContent>
          </Card>

          {/* Hábitos */}
          <Card data-pdf-hide={hasHabitos ? undefined : ''}>
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
              {(ficha as any).le_gusta_comer && (
                <div className="mt-4">
                  <p className="text-xs text-rosa-500 font-medium uppercase tracking-wide mb-1">Le gusta comer</p>
                  <p className="text-sm text-rosa-800">{(ficha as any).le_gusta_comer}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historial de seguimientos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Historial de Seguimientos</CardTitle>
                <Link href={`/fichas/${params.id}/seguimiento`}>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    Nuevo Seguimiento
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {!seguimientos || seguimientos.length === 0 ? (
                <p className="text-sm text-rosa-400">Sin seguimientos aún</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left pb-2 text-xs font-semibold text-rosa-600 uppercase tracking-wide">Fecha</th>
                        <th className="text-left pb-2 text-xs font-semibold text-rosa-600 uppercase tracking-wide">Peso</th>
                        <th className="text-left pb-2 text-xs font-semibold text-rosa-600 uppercase tracking-wide">IMC</th>
                        <th className="text-left pb-2 text-xs font-semibold text-rosa-600 uppercase tracking-wide">Dx Grasa</th>
                        <th className="pb-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {(seguimientos as any[]).map((seg) => (
                        <tr key={seg.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors">
                          <td className="py-2.5 text-rosa-700">
                            {seg.fecha_consulta ? formatDate(seg.fecha_consulta) : '—'}
                          </td>
                          <td className="py-2.5 text-rosa-700">
                            {seg.peso_kg != null ? `${seg.peso_kg} kg` : '—'}
                          </td>
                          <td className="py-2.5 text-rosa-700 font-semibold">
                            {formatDecimal(seg.imc, 1)}
                          </td>
                          <td className="py-2.5 text-rosa-700">
                            {seg.dx_grasa ?? '—'}
                          </td>
                          <td className="py-2.5 text-right">
                            <Link href={`/fichas/${seg.id}`}>
                              <Button variant="ghost" size="sm" className="text-xs">Ver →</Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

      {/* Tabla comparativa de todas las consultas del paciente */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-rosa-800 mb-3">Tabla Comparativa</h2>
        <TablaComparativa
          pacienteId={pacienteId}
          currentFichaId={params.id}
        />
      </div>

      {/* Contenedor OCULTO: todas las fichas del paciente (inicial + controles)
          renderadas para exportarlas juntas en un único PDF. Se posiciona fuera
          de la pantalla; no se ve en la web pero html2canvas sí puede capturarlo. */}
      <div
        id={`fichas-export-all-${pacienteId}`}
        aria-hidden="true"
        style={{ position: 'fixed', left: '-10000px', top: 0, width: '780px', background: '#ffffff', zIndex: -1 }}
      >
        {fichasParaPDF.map((f, i) => (
          <div
            key={f.id}
            data-ficha-block
            style={{ width: '780px', background: '#ffffff' }}
            className="p-6"
          >
            <FichaExportView
              ficha={f}
              tag={tagForFicha(i, fichasParaPDF.length)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
