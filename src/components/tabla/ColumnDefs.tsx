import { createColumnHelper } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatDecimal } from '@/lib/utils'

export interface FichaRow {
  id: string
  nombre: string
  empresa: string | null
  fecha_consulta: string
  sexo: string | null
  ciudad: string | null
  correo: string | null
  edad: number | null
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
}

const col = createColumnHelper<FichaRow>()

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

export const columnDefs = [
  // ── STICKY COLUMNS (first 3) ─────────────────────────────────
  col.accessor('nombre', {
    id: 'nombre',
    header: 'Paciente',
    size: 180,
    enableSorting: true,
    meta: { sticky: true, stickyLeft: 0 },
    cell: (info) => (
      <span className="font-medium text-rosa-800">{info.getValue() ?? '—'}</span>
    ),
  }),
  col.accessor('empresa', {
    id: 'empresa',
    header: 'Empresa',
    size: 160,
    enableSorting: true,
    meta: { sticky: true, stickyLeft: 180 },
    cell: (info) => (
      <span className="text-rosa-600">{info.getValue() ?? '—'}</span>
    ),
  }),
  col.accessor('fecha_consulta', {
    id: 'fecha_consulta',
    header: 'Fecha',
    size: 120,
    enableSorting: true,
    meta: { sticky: true, stickyLeft: 340 },
    cell: (info) => (
      <span className="text-rosa-600 whitespace-nowrap">
        {info.getValue() ? formatDate(info.getValue()) : '—'}
      </span>
    ),
  }),

  // ── SCROLLABLE COLUMNS ────────────────────────────────────────
  col.accessor('sexo', {
    header: 'Sexo',
    size: 90,
    cell: (info) => info.getValue() ?? '—',
  }),
  col.accessor('edad', {
    header: 'Edad',
    size: 70,
    enableSorting: true,
    cell: (info) => info.getValue() ?? '—',
  }),
  col.accessor('ciudad', {
    header: 'Ciudad',
    size: 120,
    cell: (info) => info.getValue() ?? '—',
  }),
  col.accessor('peso_kg', {
    header: 'Peso (kg)',
    size: 90,
    enableSorting: true,
    cell: (info) => formatDecimal(info.getValue(), 1),
  }),
  col.accessor('talla_m', {
    header: 'Talla (m)',
    size: 90,
    enableSorting: true,
    cell: (info) => formatDecimal(info.getValue(), 2),
  }),
  col.accessor('imc', {
    header: 'IMC',
    size: 90,
    enableSorting: true,
    cell: (info) => {
      const v = info.getValue()
      return v ? (
        <Badge variant={imcVariant(v)} className="font-mono">
          {formatDecimal(v, 1)}
        </Badge>
      ) : '—'
    },
  }),
  col.accessor('circunferencia_cintura', {
    header: 'Cintura (cm)',
    size: 110,
    cell: (info) => formatDecimal(info.getValue(), 1),
  }),
  col.accessor('circunferencia_cadera', {
    header: 'Cadera (cm)',
    size: 110,
    cell: (info) => formatDecimal(info.getValue(), 1),
  }),
  col.accessor('indice_cc', {
    header: 'ICC',
    size: 80,
    cell: (info) => formatDecimal(info.getValue(), 2),
  }),
  col.accessor('porcentaje_masa_grasa', {
    header: '% Grasa',
    size: 90,
    enableSorting: true,
    cell: (info) => {
      const v = info.getValue()
      return v != null ? `${formatDecimal(v, 1)}%` : '—'
    },
  }),
  col.accessor('porcentaje_masa_muscular', {
    header: '% Músculo',
    size: 100,
    enableSorting: true,
    cell: (info) => {
      const v = info.getValue()
      return v != null ? `${formatDecimal(v, 1)}%` : '—'
    },
  }),
  col.accessor('edad_metabolica', {
    header: 'Edad Met.',
    size: 95,
    cell: (info) => info.getValue() ?? '—',
  }),
  col.accessor('grasa_visceral', {
    header: 'Gr. Visceral',
    size: 100,
    cell: (info) => formatDecimal(info.getValue(), 1),
  }),
  col.accessor('peso_ideal', {
    header: 'Peso Ideal',
    size: 100,
    cell: (info) => {
      const v = info.getValue()
      return v != null ? `${formatDecimal(v, 1)} kg` : '—'
    },
  }),
  col.accessor('dx_grasa', {
    header: 'Dx Grasa',
    size: 140,
    cell: (info) => {
      const v = info.getValue()
      if (!v) return '—'
      const variant: 'success' | 'warning' | 'danger' | 'default' =
        v === 'Normal' ? 'success' :
        v === 'Elevado' || v === 'Bajo' ? 'warning' :
        v === 'Obesidad' ? 'danger' : 'default'
      return <Badge variant={variant}>{v}</Badge>
    },
  }),
  col.accessor('dx_musculo', {
    header: 'Dx Músculo',
    size: 120,
    cell: (info) => {
      const v = info.getValue()
      if (!v) return '—'
      const variant: 'success' | 'warning' | 'danger' | 'default' =
        v === 'Bueno' || v === 'Muy bueno' ? 'success' :
        v === 'Normal' ? 'default' :
        v === 'Bajo' ? 'warning' : 'danger'
      return <Badge variant={variant}>{v}</Badge>
    },
  }),
  col.accessor('riesgo_metabolico', {
    header: 'Riesgo Met.',
    size: 120,
    cell: (info) => {
      const v = info.getValue()
      if (!v) return '—'
      return <Badge variant={riesgoVariant(v)}>{v}</Badge>
    },
  }),
  col.accessor('digestion', {
    header: 'Digestión',
    size: 110,
    cell: (info) => info.getValue() ?? '—',
  }),
  col.accessor('descanso', {
    header: 'Descanso',
    size: 120,
    cell: (info) => info.getValue() ?? '—',
  }),
  col.accessor('nivel_estres', {
    header: 'Estrés',
    size: 90,
    cell: (info) => info.getValue() ?? '—',
  }),
  col.accessor('consumo_agua', {
    header: 'Agua',
    size: 160,
    cell: (info) => info.getValue() ?? '—',
  }),
  col.accessor('actividad_fisica', {
    header: 'Act. Física',
    size: 220,
    cell: (info) => info.getValue() ?? '—',
  }),
  col.accessor('consumo_alcohol', {
    header: 'Alcohol',
    size: 100,
    cell: (info) => info.getValue() ?? '—',
  }),
  col.accessor('consumo_tabaco', {
    header: 'Tabaco',
    size: 100,
    cell: (info) => info.getValue() ?? '—',
  }),
]
