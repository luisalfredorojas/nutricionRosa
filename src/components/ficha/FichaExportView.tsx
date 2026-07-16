import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IndicadoresCalculadosDisplay } from '@/components/ficha/IndicadoresCalculados'
import type { IndicadoresCalculados } from '@/types/ficha'
import { formatDate } from '@/lib/utils'

interface FichaExportViewProps {
  // Fila completa de fichas_nutricionales con el join de pacientes/empresas.
  ficha: any
  // Etiqueta que diferencia la ficha dentro del PDF: "Ficha Inicial", "Control 1"...
  tag: string
}

// Campo simple: en la vista de exportación los valores vacíos se omiten por
// completo (a diferencia de la página web, que siempre los muestra).
function Field({
  label,
  value,
}: {
  label: string
  value: string | number | null | undefined
}) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div>
      <p className="text-xs text-rosa-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm text-rosa-800 mt-0.5">{value}</p>
    </div>
  )
}

/**
 * Vista de UNA ficha pensada exclusivamente para exportar a PDF (se renderiza en
 * un contenedor oculto). Cada ficha lleva una etiqueta (`tag`) que la distingue
 * de las demás: la inicial y las de control ("Control 1", "Control 2", ...).
 */
export function FichaExportView({ ficha, tag }: FichaExportViewProps) {
  const paciente = ficha.pacientes ?? null
  const numeroFicha: string | null = ficha.numero_ficha ?? null

  const indicadores: IndicadoresCalculados = {
    imc: ficha.imc ?? null,
    clasificacionIMC: null,
    pesoIdeal: ficha.peso_ideal ?? null,
    indiceCC: ficha.indice_cc ?? null,
    clasificacionICC: null,
    dxGrasa: ficha.dx_grasa ?? null,
    dxMusculo: ficha.dx_musculo ?? null,
    dxGrasaVisceral: null,
    riesgoMetabolico: ficha.riesgo_metabolico ?? null,
  }

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
    !!ficha.le_gusta_comer

  return (
    <div className="space-y-4">
      {/* Encabezado con la etiqueta que diferencia esta ficha de las demás */}
      <div className="border-b-2 border-rosa-300 pb-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-rosa-800">{paciente?.nombre ?? 'Paciente'}</h2>
          <span className="rounded-full bg-rosa-500 px-3 py-1 text-sm font-semibold text-white whitespace-nowrap">
            {tag}
          </span>
        </div>
        <p className="text-sm text-rosa-500 mt-1">
          {numeroFicha ? `${numeroFicha} · ` : ''}
          Consulta del {ficha.fecha_consulta ? formatDate(ficha.fecha_consulta) : '—'}
        </p>
      </div>

      {/* Datos personales */}
      <Card>
        <CardHeader><CardTitle>Datos Personales</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
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
          <div className="grid grid-cols-3 gap-4">
            <Field label="Diagnóstico clínico" value={ficha.diagnostico_clinico} />
            <Field label="Peso" value={ficha.peso_kg ? `${ficha.peso_kg} kg` : null} />
            <Field label="Talla" value={ficha.talla_m ? `${ficha.talla_m} m` : null} />
            <Field label="Cintura" value={ficha.circunferencia_cintura ? `${ficha.circunferencia_cintura} cm` : null} />
            <Field label="Cadera" value={ficha.circunferencia_cadera ? `${ficha.circunferencia_cadera} cm` : null} />
            <Field label="Brazo" value={ficha.circunferencia_brazo ? `${ficha.circunferencia_brazo} cm` : null} />
            {paciente?.sexo === 'Femenino' && (
              <Field
                label="Última menstruación"
                value={ficha.fecha_ultima_menstruacion ? formatDate(ficha.fecha_ultima_menstruacion) : null}
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

      {/* Datos balanza (solo si hay algún dato) */}
      {hasBalanza && (
        <Card>
          <CardHeader><CardTitle>Datos Balanza</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <Field label="% Masa grasa" value={ficha.porcentaje_masa_grasa ? `${ficha.porcentaje_masa_grasa}%` : null} />
              <Field label="% Masa muscular" value={ficha.porcentaje_masa_muscular ? `${ficha.porcentaje_masa_muscular}%` : null} />
              <Field label="Edad metabólica" value={ficha.edad_metabolica || null} />
              <Field label="Grasa visceral" value={ficha.grasa_visceral || null} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hábitos (solo si hay algún dato) */}
      {hasHabitos && (
        <Card>
          <CardHeader><CardTitle>Hábitos</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
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
            {ficha.le_gusta_comer && (
              <div className="mt-4">
                <p className="text-xs text-rosa-500 font-medium uppercase tracking-wide mb-1">Le gusta comer</p>
                <p className="text-sm text-rosa-800">{ficha.le_gusta_comer}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Indicadores calculados */}
      <Card>
        <CardHeader><CardTitle>Indicadores</CardTitle></CardHeader>
        <CardContent>
          <IndicadoresCalculadosDisplay indicadores={indicadores} />
        </CardContent>
      </Card>
    </div>
  )
}
