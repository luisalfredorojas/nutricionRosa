import type { IndicadoresCalculados } from '@/types/ficha'
import { Badge } from '@/components/ui/badge'
import { formatDecimal } from '@/lib/utils'

interface IndicadoresCalculadosProps {
  indicadores: IndicadoresCalculados
}

const riesgoColor: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  Bajo: 'success',
  Moderado: 'warning',
  Alto: 'danger',
  'Muy alto': 'danger',
}

const imcColor: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  'Bajo peso': 'warning',
  Normal: 'success',
  Sobrepeso: 'warning',
  'Obesidad grado I': 'danger',
  'Obesidad grado II': 'danger',
  'Obesidad grado III': 'danger',
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
  if (value === null && badge === null) return null

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-rosa-100 last:border-0">
      <span className="text-xs text-rosa-600">{label}</span>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm font-semibold text-rosa-800">{value}</span>}
        {badge && (
          <Badge variant={badgeVariant ?? 'default'} className="text-xs">
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
    indicadores.riesgoMetabolico !== null

  if (!hasAny) {
    return (
      <div className="text-center py-6 text-rosa-300">
        <p className="text-sm">Completa los datos antropométricos</p>
        <p className="text-xs mt-1">para ver los indicadores</p>
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
        badgeVariant={
          indicadores.dxGrasa === 'Atletico' || indicadores.dxGrasa === 'Fitness' ? 'success' :
          indicadores.dxGrasa === 'Promedio' ? 'warning' : 'danger'
        }
      />
      <IndicadorRow
        label="Diagnóstico músculo"
        value={null}
        badge={indicadores.dxMusculo}
        badgeVariant={
          indicadores.dxMusculo === 'Alto' || indicadores.dxMusculo === 'Muy alto' ? 'success' :
          indicadores.dxMusculo === 'Normal' ? 'default' : 'warning'
        }
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
