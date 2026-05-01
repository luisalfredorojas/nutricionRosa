import { createColumnHelper } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatDecimal } from '@/lib/utils'

export interface FichaSnapshot {
  id: string
  tipo: 'inicial' | 'seguimiento' | null
  fecha_consulta: string
  peso_kg: number | null
  talla_m: number | null
  imc: number | null
  circunferencia_cintura: number | null
  circunferencia_cadera: number | null
  indice_cc: number | null
  porcentaje_masa_grasa: number | null
  porcentaje_masa_muscular: number | null
  edad_metabolica: number | null
  grasa_visceral: number | null
  peso_ideal: number | null
  dx_grasa: string | null
  dx_musculo: string | null
  riesgo_metabolico: string | null
}

export interface PacienteRow {
  paciente_id: string
  nombre: string
  empresa: string | null
  sexo: string | null
  ciudad: string | null
  correo: string | null
  fecha_nacimiento: string | null
  edad: number | null
  // hábitos (sólo última ficha)
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
  // fichas ordenadas ASC (índice 0 = inicial)
  fichas: FichaSnapshot[]
  num_fichas: number
  // fecha de última ficha (para sort/filtros)
  fecha_consulta: string
}

const col = createColumnHelper<PacienteRow>()

const riesgoVariant = (v: string | null): 'success' | 'warning' | 'danger' | 'default' => {
  if (v === 'Bajo') return 'success'
  if (v === 'Aumentado' || v === 'Moderado') return 'warning'
  if (v === 'Alto') return 'danger'
  return 'default'
}

const imcVariant = (v: number | null): 'success' | 'warning' | 'danger' | 'default' => {
  if (!v) return 'default'
  if (v < 18.5) return 'warning'
  if (v < 25) return 'success'
  if (v < 30) return 'warning'
  return 'danger'
}

type Numeric = 'peso_kg' | 'talla_m' | 'imc' | 'circunferencia_cintura' | 'circunferencia_cadera' | 'indice_cc' | 'porcentaje_masa_grasa' | 'porcentaje_masa_muscular' | 'edad_metabolica' | 'grasa_visceral' | 'peso_ideal'
type Text = 'dx_grasa' | 'dx_musculo' | 'riesgo_metabolico'

interface MetricSpec {
  key: Numeric | Text | 'fecha_consulta'
  label: string
  size: number
  render: (v: unknown) => React.ReactNode
  enableSorting?: boolean
}

const METRICS: MetricSpec[] = [
  {
    key: 'fecha_consulta',
    label: 'Fecha',
    size: 110,
    enableSorting: true,
    render: (v) => (typeof v === 'string' && v ? formatDate(v) : '—'),
  },
  { key: 'peso_kg', label: 'Peso (kg)', size: 90, enableSorting: true, render: (v) => formatDecimal(v as number | null, 1) },
  { key: 'talla_m', label: 'Talla (m)', size: 90, render: (v) => formatDecimal(v as number | null, 2) },
  {
    key: 'imc',
    label: 'IMC',
    size: 90,
    enableSorting: true,
    render: (v) => {
      const n = v as number | null
      return n ? <Badge variant={imcVariant(n)} className="font-mono">{formatDecimal(n, 1)}</Badge> : '—'
    },
  },
  { key: 'circunferencia_cintura', label: 'Cintura (cm)', size: 110, render: (v) => formatDecimal(v as number | null, 1) },
  { key: 'circunferencia_cadera', label: 'Cadera (cm)', size: 110, render: (v) => formatDecimal(v as number | null, 1) },
  { key: 'indice_cc', label: 'ICC', size: 80, render: (v) => formatDecimal(v as number | null, 2) },
  {
    key: 'porcentaje_masa_grasa',
    label: '% Grasa',
    size: 90,
    enableSorting: true,
    render: (v) => (v != null ? `${formatDecimal(v as number, 1)}%` : '—'),
  },
  {
    key: 'porcentaje_masa_muscular',
    label: '% Músculo',
    size: 100,
    enableSorting: true,
    render: (v) => (v != null ? `${formatDecimal(v as number, 1)}%` : '—'),
  },
  { key: 'edad_metabolica', label: 'Edad Met.', size: 95, render: (v) => (v ?? '—') as React.ReactNode },
  { key: 'grasa_visceral', label: 'Gr. Visceral', size: 100, render: (v) => formatDecimal(v as number | null, 1) },
  {
    key: 'peso_ideal',
    label: 'Peso Ideal',
    size: 100,
    render: (v) => (v != null ? `${formatDecimal(v as number, 1)} kg` : '—'),
  },
  {
    key: 'dx_grasa',
    label: 'Dx Grasa',
    size: 140,
    render: (v) => {
      const s = v as string | null
      if (!s) return '—'
      const variant: 'success' | 'warning' | 'danger' | 'default' =
        s === 'Normal' ? 'success' :
        s === 'Elevado' || s === 'Bajo' ? 'warning' :
        s === 'Obesidad' ? 'danger' : 'default'
      return <Badge variant={variant}>{s}</Badge>
    },
  },
  {
    key: 'dx_musculo',
    label: 'Dx Músculo',
    size: 120,
    render: (v) => {
      const s = v as string | null
      if (!s) return '—'
      const variant: 'success' | 'warning' | 'danger' | 'default' =
        s === 'Bueno' || s === 'Muy bueno' ? 'success' :
        s === 'Normal' ? 'default' :
        s === 'Bajo' ? 'warning' : 'danger'
      return <Badge variant={variant}>{s}</Badge>
    },
  },
  {
    key: 'riesgo_metabolico',
    label: 'Riesgo Met.',
    size: 120,
    render: (v) => {
      const s = v as string | null
      if (!s) return '—'
      return <Badge variant={riesgoVariant(s)}>{s}</Badge>
    },
  },
]

export const METRIC_KEYS = METRICS.map((m) => m.key)
export const METRIC_LABELS: Record<string, string> = Object.fromEntries(METRICS.map((m) => [m.key, m.label]))

// eslint-disable-next-line
type AnyCol = any // ColumnDef genérico de TanStack es invariante en TValue

export function buildColumnDefs(maxFichas: number): AnyCol[] {
  const safeMax = Math.max(1, maxFichas)
  const stickyCols: AnyCol[] = [
    col.accessor('nombre', {
      id: 'nombre',
      header: 'Paciente',
      size: 180,
      enableSorting: true,
      meta: { sticky: true, stickyLeft: 0 },
      cell: (info) => <span className="font-medium text-rosa-800">{info.getValue() ?? '—'}</span>,
    }),
    col.accessor('empresa', {
      id: 'empresa',
      header: 'Empresa',
      size: 160,
      enableSorting: true,
      meta: { sticky: true, stickyLeft: 180 },
      cell: (info) => <span className="text-rosa-600">{info.getValue() ?? '—'}</span>,
    }),
    col.accessor('num_fichas', {
      id: 'num_fichas',
      header: 'N° Fichas',
      size: 90,
      enableSorting: true,
      meta: { sticky: true, stickyLeft: 340 },
      cell: (info) => (
        <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full bg-rosa-100 text-rosa-700 text-xs font-semibold">
          {info.getValue()}
        </span>
      ),
    }),
  ]

  const identityCols: AnyCol[] = [
    col.accessor('sexo', { header: 'Sexo', size: 90, cell: (info) => info.getValue() ?? '—' }),
    col.accessor('edad', { header: 'Edad', size: 70, enableSorting: true, cell: (info) => info.getValue() ?? '—' }),
    col.accessor('ciudad', { header: 'Ciudad', size: 120, cell: (info) => info.getValue() ?? '—' }),
  ]

  const metricCols: AnyCol[] = []
  for (let i = 0; i < safeMax; i++) {
    for (const m of METRICS) {
      metricCols.push({
        id: `${m.key}_${i + 1}`,
        header: `${m.label} (${i + 1})`,
        size: m.size,
        enableSorting: m.enableSorting ?? false,
        accessorFn: (row: PacienteRow) => row.fichas[i]?.[m.key as keyof FichaSnapshot] ?? null,
        cell: (info: { getValue: () => unknown }) => m.render(info.getValue()),
      })
    }
  }

  const habitCols: AnyCol[] = [
    col.accessor('digestion', { header: 'Digestión (últ.)', size: 130, cell: (info) => info.getValue() ?? '—' }),
    col.accessor('descanso', { header: 'Descanso (últ.)', size: 130, cell: (info) => info.getValue() ?? '—' }),
    col.accessor('nivel_estres', { header: 'Estrés (últ.)', size: 110, cell: (info) => info.getValue() ?? '—' }),
    col.accessor('consumo_agua', { header: 'Agua (últ.)', size: 170, cell: (info) => info.getValue() ?? '—' }),
    col.accessor('actividad_fisica', { header: 'Act. Física (últ.)', size: 230, cell: (info) => info.getValue() ?? '—' }),
    col.accessor('consumo_alcohol', { header: 'Alcohol (últ.)', size: 110, cell: (info) => info.getValue() ?? '—' }),
    col.accessor('consumo_tabaco', { header: 'Tabaco (últ.)', size: 110, cell: (info) => info.getValue() ?? '—' }),
  ]

  return [...stickyCols, ...identityCols, ...metricCols, ...habitCols]
}
