import type { IndicadoresCalculados } from '@/types/ficha'
import { Badge } from '@/components/ui/badge'
import { formatDecimal } from '@/lib/utils'

interface IndicadoresCalculadosProps {
  indicadores: IndicadoresCalculados
}

const riesgoColor: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  Bajo: 'success',
  Aumentado: 'warning',
  Alto: 'danger',
}

const imcColor: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  'Bajo peso': 'warning',
  Normal: 'success',
  Sobrepeso: 'warning',
  'Obesidad grado I': 'danger',
  'Obesidad grado II': 'danger',
  'Obesidad grado III': 'danger',
}

const grasaColor: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  Bajo: 'warning',
  Normal: 'success',
  Elevado: 'warning',
  Obesidad: 'danger',
}

const musculoColor: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  'Muy bajo': 'danger',
  Bajo: 'warning',
  Normal: 'default',
  Bueno: 'success',
  'Muy bueno': 'success',
}

const visceralColor: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  Normal: 'success',
  Elevada: 'warning',
  'Muy elevada': 'danger',
}

function IndicadorRow({
  label,
  value,
  badge,
  badgeVariant,
}: {
  label: string
  value: string | null
  badge?: string | null
  badgeVariant?: 'success' | 'warning' | 'danger' | 'default'
}) {
  if (value === null && !badge) return null

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-rosa-100 last:border-0">
      <span className="text-sm text-rosa-600">{label}</span>
      <div className="flex items-center gap-2">
        {value && <span className="text-base font-semibold text-rosa-800">{value}</span>}
        {badge && (
          <Badge variant={badgeVariant ?? 'default'} className="text-sm">
            {badge}
          </Badge>
        )}
      </div>
    </div>
  )
}

export function IndicadoresCalculadosDisplay({ indicadores }: IndicadoresCalculadosProps) {
  const hasAny =
    indicadores.imc !== null ||
    indicadores.pesoIdeal !== null ||
    indicadores.indiceCC !== null ||
    indicadores.dxGrasa !== null ||
    indicadores.dxMusculo !== null ||
    indicadores.dxGrasaVisceral !== null ||
    indicadores.riesgoMetabolico !== null

  if (!hasAny) {
    return (
      <div className="text-center py-6 text-rosa-300">
        <p className="text-base">Completa los datos antropométricos</p>
        <p className="text-sm mt-1">para ver los indicadores</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      <IndicadorRow
        label="IMC"
        value={formatDecimal(indicadores.imc, 1)}
        badge={indicadores.clasificacionIMC}
        badgeVariant={indicadores.clasificacionIMC ? imcColor[indicadores.clasificacionIMC] : 'default'}
      />
      <IndicadorRow
        label="Peso ideal"
        value={indicadores.pesoIdeal !== null ? `${formatDecimal(indicadores.pesoIdeal, 1)} kg` : null}
      />
      <IndicadorRow
        label="Índice C/C"
        value={formatDecimal(indicadores.indiceCC, 2)}
        badge={indicadores.clasificacionICC}
        badgeVariant={
          indicadores.clasificacionICC === 'Bajo' ? 'success' :
          indicadores.clasificacionICC === 'Moderado' ? 'warning' : 'danger'
        }
      />
      <IndicadorRow
        label="Diagnóstico grasa"
        value={null}
        badge={indicadores.dxGrasa}
        badgeVariant={indicadores.dxGrasa ? grasaColor[indicadores.dxGrasa] : 'default'}
      />
      <IndicadorRow
        label="Diagnóstico músculo"
        value={null}
        badge={indicadores.dxMusculo}
        badgeVariant={indicadores.dxMusculo ? musculoColor[indicadores.dxMusculo] : 'default'}
      />
      <IndicadorRow
        label="Grasa visceral"
        value={null}
        badge={indicadores.dxGrasaVisceral}
        badgeVariant={indicadores.dxGrasaVisceral ? visceralColor[indicadores.dxGrasaVisceral] : 'default'}
      />
      <IndicadorRow
        label="Riesgo metabólico"
        value={null}
        badge={indicadores.riesgoMetabolico}
        badgeVariant={indicadores.riesgoMetabolico ? riesgoColor[indicadores.riesgoMetabolico] : 'default'}
      />
    </div>
  )
}
