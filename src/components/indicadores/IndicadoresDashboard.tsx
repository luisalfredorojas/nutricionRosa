'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import {
  Users,
  Scale,
  TrendingDown,
  Dumbbell,
  CalendarCheck,
} from 'lucide-react'
import { useIndicadores, type CambioMetric } from '@/hooks/useIndicadores'
import { formatDecimal } from '@/lib/utils'
import { DateRangeFilter } from './DateRangeFilter'
import { HabitoDistribucion } from './HabitoDistribucion'
import { MejoresCambios } from './MejoresCambios'
import { ExportIndicadoresPDF } from './ExportIndicadoresPDF'

interface IndicadoresDashboardProps {
  scope: 'empresa' | 'privado'
  entityId: string
  entityNombre?: string | null
}

const IMC_COLORS = [
  '#a78bfa',
  '#34d399',
  '#fbbf24',
  '#fb923c',
  '#f87171',
  '#ef4444',
]

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  extra?: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  valueClassName?: string
}

function StatCard({ title, value, subtitle, extra, icon: Icon, valueClassName }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-rosa-500 uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${valueClassName ?? 'text-rosa-800'}`}>{value}</p>
          {subtitle && <p className="text-xs text-rosa-400 mt-1">{subtitle}</p>}
          {extra && <div className="mt-1.5">{extra}</div>}
        </div>
        <div className="p-2.5 rounded-xl bg-rosa-100">
          <Icon className="h-5 w-5 text-rosa-600" />
        </div>
      </div>
    </div>
  )
}

/**
 * Color rule for body composition deltas:
 * - Grasa: lower is better → negative = green, positive = red
 * - Músculo: higher is better → positive = green, negative = red
 */
function deltaColorClass(delta: number | null | undefined, metric: 'grasa' | 'musculo'): string {
  if (delta == null || delta === 0) return 'text-rosa-800'
  const isImprovement = metric === 'musculo' ? delta > 0 : delta < 0
  return isImprovement ? 'text-green-600' : 'text-red-600'
}

interface CambioCard {
  value: string
  subtitle: string
  extra: React.ReactNode | null
  colorDelta: number | null
}

/**
 * Construye el contenido de las cards "Cambio % Grasa/Músculo".
 * - Empresa: valor = % de pacientes que mejoró; debajo, los promedios de subida y bajada.
 * - Privado: se mantiene el cambio individual (última − primera).
 */
function buildCambioCard(
  m: CambioMetric | undefined,
  metric: 'grasa' | 'musculo',
  scope: 'empresa' | 'privado'
): CambioCard {
  if (!m) return { value: '—', subtitle: '', extra: null, colorDelta: null }

  if (scope === 'privado') {
    const d = m.delta ?? null
    return {
      value: d != null ? `${d > 0 ? '+' : ''}${formatDecimal(d, 1)}%` : '—',
      subtitle: 'Primera vs última',
      extra: null,
      colorDelta: d,
    }
  }

  // Empresa
  const total = m.totalConDato ?? 0
  if (total === 0) {
    return { value: '—', subtitle: 'Sin datos de seguimiento', extra: null, colorDelta: null }
  }
  const verbo = metric === 'musculo' ? 'ganaron músculo' : 'bajaron grasa'

  // Promedios de subida (↑) y bajada (↓). El color marca si es mejora (verde) o no (rojo).
  const partes: React.ReactNode[] = []
  if (m.promedioSubida != null) {
    partes.push(
      <span key="sub" className={metric === 'musculo' ? 'text-green-600' : 'text-red-500'}>
        ↑ {formatDecimal(Math.abs(m.promedioSubida), 1)}%
      </span>
    )
  }
  if (m.promedioBajada != null) {
    partes.push(
      <span key="baj" className={metric === 'grasa' ? 'text-green-600' : 'text-red-500'}>
        ↓ {formatDecimal(Math.abs(m.promedioBajada), 1)}%
      </span>
    )
  }
  const extra =
    partes.length > 0 ? (
      <p className="text-xs text-gray-400">
        Prom.{' '}
        {partes.map((p, i) => (
          <span key={i}>
            {i > 0 && <span className="text-gray-300"> · </span>}
            {p}
          </span>
        ))}
      </p>
    ) : null

  return {
    value: `${m.mejoraronPct ?? 0}%`,
    subtitle: `${m.mejoraronCount ?? 0} de ${total} ${verbo}`,
    extra,
    colorDelta: null,
  }
}

export function IndicadoresDashboard({
  scope,
  entityId,
  entityNombre,
}: IndicadoresDashboardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [desde, setDesde] = useState<string | null>(searchParams.get('desde'))
  const [hasta, setHasta] = useState<string | null>(searchParams.get('hasta'))
  // Filtro de ciudad (solo empresa). No se persiste en URL: al cambiar de empresa
  // el dashboard se re-monta y vuelve a "Todas".
  const [ciudad, setCiudad] = useState<string | null>(null)

  const handleDateChange = useCallback(
    (d: string | null, h: string | null) => {
      setDesde(d)
      setHasta(h)
    },
    []
  )

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (desde) params.set('desde', desde)
    if (hasta) params.set('hasta', hasta)
    const qs = params.toString()
    router.replace(qs ? `?${qs}` : '?', { scroll: false })
  }, [desde, hasta, router])

  const { data, loading, error } = useIndicadores({
    scope,
    empresaId: scope === 'empresa' ? entityId : null,
    pacienteId: scope === 'privado' ? entityId : null,
    ciudad: scope === 'empresa' ? ciudad : null,
    fechaDesde: desde,
    fechaHasta: hasta,
  })

  const titulo =
    scope === 'empresa'
      ? `Indicadores — ${entityNombre ?? 'Empresa'}`
      : `Indicadores — ${entityNombre ?? 'Paciente'}`

  const pesoDisplay = useMemo(() => {
    if (!data) return '—'
    if (scope === 'privado') {
      return data.peso.actual != null ? `${formatDecimal(data.peso.actual, 1)} kg` : '—'
    }
    return data.peso.promedio != null ? `${formatDecimal(data.peso.promedio, 1)} kg` : '—'
  }, [data, scope])

  const pesoSubtitle = useMemo(() => {
    if (!data) return undefined
    if (scope === 'privado' && data.peso.delta != null) {
      return `${data.peso.delta > 0 ? '+' : ''}${formatDecimal(data.peso.delta, 1)} kg vs primera ficha`
    }
    if (scope === 'empresa') return 'Promedio última ficha'
    return undefined
  }, [data, scope])

  const grasaCard = useMemo(() => buildCambioCard(data?.grasa, 'grasa', scope), [data, scope])
  const musculoCard = useMemo(() => buildCambioCard(data?.musculo, 'musculo', scope), [data, scope])

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-rosa-800">{titulo}</h1>
          <p className="text-rosa-500 text-sm mt-1">
            {scope === 'empresa'
              ? 'Métricas agregadas por empresa'
              : 'Evolución individual del paciente'}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          {scope === 'empresa' && (data?.ciudadesDisponibles?.length ?? 0) > 0 && (
            <div>
              <label className="block text-xs font-medium text-rosa-600 mb-1">Ciudad</label>
              <Select
                value={ciudad ?? ''}
                onChange={(e) => setCiudad(e.target.value || null)}
                className="w-44"
              >
                <option value="">Todas las ciudades</option>
                {data?.ciudadesDisponibles?.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
          )}
          <DateRangeFilter desde={desde} hasta={hasta} onChange={handleDateChange} />
          <ExportIndicadoresPDF scope={scope} />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          Error cargando indicadores: {error}
        </div>
      )}

      <div id="indicadores-export" className="bg-rosa-50/30 p-4 rounded-2xl">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard
            title={scope === 'empresa' ? 'Total Pacientes' : 'Fichas'}
            value={loading ? '...' : String(data?.totalPacientes ?? 0)}
            icon={Users}
          />
          <StatCard
            title={scope === 'empresa' ? 'Peso Promedio' : 'Peso Actual'}
            value={loading ? '...' : pesoDisplay}
            subtitle={pesoSubtitle}
            icon={Scale}
          />
          <StatCard
            title="Cambio % Grasa"
            value={loading ? '...' : grasaCard.value}
            subtitle={loading ? undefined : grasaCard.subtitle}
            extra={loading ? null : grasaCard.extra}
            icon={TrendingDown}
            valueClassName={loading ? undefined : deltaColorClass(grasaCard.colorDelta, 'grasa')}
          />
          <StatCard
            title="Cambio % Músculo"
            value={loading ? '...' : musculoCard.value}
            subtitle={loading ? undefined : musculoCard.subtitle}
            extra={loading ? null : musculoCard.extra}
            icon={Dumbbell}
            valueClassName={loading ? undefined : deltaColorClass(musculoCard.colorDelta, 'musculo')}
          />
          <StatCard
            title="Citas Control"
            value={loading ? '...' : String(data?.citasControl ?? 0)}
            subtitle="Fichas seguimiento"
            icon={CalendarCheck}
          />
        </div>

        {/* Empresa-only: género y mejores cambios */}
        {scope === 'empresa' && data && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Distribución por Sexo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-around py-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-pink-600">
                      {data.totalMujeres ?? 0}
                    </p>
                    <p className="text-xs text-rosa-500 mt-1">Mujeres</p>
                  </div>
                  <div className="h-14 w-px bg-rosa-200" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {data.totalHombres ?? 0}
                    </p>
                    <p className="text-xs text-rosa-500 mt-1">Hombres</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="lg:col-span-2">
              <MejoresCambios data={data.mejoresCambios ?? []} />
            </div>
          </div>
        )}

        {/* IMC y atendidos por mes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Distribución IMC</CardTitle>
              <p className="text-xs text-rosa-400">Última ficha por paciente</p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-52 bg-gray-100 rounded-lg animate-pulse" />
              ) : !data || data.distribucionIMC.length === 0 ? (
                <div className="flex items-center justify-center h-52 text-rosa-300 text-sm">
                  Sin datos
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={data.distribucionIMC.map((d) => ({
                        name: d.categoria,
                        value: d.count,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {data.distribucionIMC.map((entry, i) => (
                        <Cell
                          key={entry.categoria}
                          fill={IMC_COLORS[i % IMC_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #fbcfe8',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(v) => (
                        <span style={{ fontSize: '11px', color: '#9d174d' }}>{v}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {scope === 'empresa' ? 'Pacientes Atendidos por Mes' : 'Consultas por Mes'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-52 bg-gray-100 rounded-lg animate-pulse" />
              ) : !data || data.atendidosPorMes.length === 0 ? (
                <div className="flex items-center justify-center h-52 text-rosa-300 text-sm">
                  Sin datos
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.atendidosPorMes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                    <XAxis
                      dataKey="mes"
                      tick={{ fontSize: 11, fill: '#9d174d' }}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#9d174d' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #fbcfe8',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" fill="#ec4899" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Hábitos */}
        <div>
          <h2 className="text-base font-semibold text-rosa-800 mb-3">
            {scope === 'empresa' ? 'Distribución de Hábitos' : 'Historial de Hábitos'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading || !data ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 bg-gray-100 rounded-xl animate-pulse" />
              ))
            ) : (
              <>
                <HabitoDistribucion titulo="Descanso" data={data.habitos.descanso} />
                <HabitoDistribucion
                  titulo="Nivel de Estrés"
                  data={data.habitos.nivel_estres}
                />
                <HabitoDistribucion
                  titulo="Consumo de Agua"
                  data={data.habitos.consumo_agua}
                />
                <HabitoDistribucion
                  titulo="Consumo de Frutas"
                  data={data.habitos.consumo_frutas}
                />
                <HabitoDistribucion
                  titulo="Consumo de Vegetales"
                  data={data.habitos.consumo_vegetales}
                />
                <HabitoDistribucion
                  titulo="Actividad Física"
                  data={data.habitos.actividad_fisica}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
