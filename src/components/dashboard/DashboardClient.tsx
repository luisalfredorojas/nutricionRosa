'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  FileText, Users, Building2, ArrowRight, User, Calendar,
} from 'lucide-react'
import { formatDate, formatDecimal } from '@/lib/utils'
import type { DashboardData } from '@/app/api/dashboard/route'

// ── Color palettes ────────────────────────────────────────────────────────────
const GRASA_COLORS = ['#a78bfa', '#fbbf24', '#14b8a6', '#f87171', '#34d399', '#818cf8', '#f97316']
const IMC_COLORS   = ['#a78bfa', '#fde68a', '#6ee7b7', '#fca5a5', '#34d399', '#818cf8']

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 my-12">
      <div className="flex-1 h-px bg-gray-200" />
      <h2 className="text-base font-semibold italic text-gray-600 whitespace-nowrap">{title}</h2>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}

function ColorStatCard({
  value, label, bg,
}: { value: string; label: string; bg: string }) {
  return (
    <div className={`rounded-2xl p-6 flex flex-col justify-between h-full min-h-[120px] ${bg}`}>
      <p className="text-4xl font-bold text-white leading-none">{value}</p>
      <p className="text-sm text-white/80 mt-3 leading-snug">{label}</p>
    </div>
  )
}

function RingChart({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 44
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={110} height={110} viewBox="0 0 110 110">
        <circle cx={55} cy={55} r={r} fill="none" stroke="#f3f4f6" strokeWidth={10} />
        <circle
          cx={55} cy={55} r={r} fill="none"
          stroke={color} strokeWidth={10}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 55 55)"
        />
        <text x={55} y={51} textAnchor="middle" fontSize={16} fontWeight="700" fill="#1f2937">
          {pct.toFixed(1)}%
        </text>
        <text x={55} y={67} textAnchor="middle" fontSize={10} fill="#6b7280">
          {label}
        </text>
      </svg>
    </div>
  )
}

function PatientHighlightCard({
  nombre, metric, accentColor,
}: { nombre: string; metric: string; accentColor: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col items-center gap-3 h-full">
      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
        <User className="h-6 w-6 text-gray-400" />
      </div>
      <p className="font-bold text-rosa-800 text-sm uppercase text-center leading-tight">
        {nombre}
      </p>
      <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: accentColor }} />
      <p className="text-xs text-gray-500 text-center leading-snug">{metric}</p>
    </div>
  )
}

function DonutChart({
  data, colors, height = 220,
}: {
  data: { label: string; count: number }[]
  colors: string[]
  height?: number
}) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-gray-400">Sin datos suficientes</p>
      </div>
    )
  }
  const chartData = data.map((d) => ({ name: d.label, value: d.count }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number, name: string) => [`${v} pacientes`, name]}
          contentStyle={{ borderRadius: 8, border: '1px solid #fbcfe8', fontSize: 12 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v) => (
            <span style={{ fontSize: 11, color: '#9d174d' }}>{v}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

function SkeletonBlock({ h = 'h-28' }: { h?: string }) {
  return <div className={`${h} rounded-2xl bg-gray-100 animate-pulse`} />
}

// ── Main component ────────────────────────────────────────────────────────────

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [applied, setApplied] = useState({ desde: '', hasta: '' })

  const fetchData = useCallback(async (d: string, h: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (d) params.set('desde', d)
      if (h) params.set('hasta', h)
      const res = await fetch(`/api/dashboard?${params.toString()}`)
      if (!res.ok) throw new Error('Error cargando datos')
      const json = await res.json()
      setData(json.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData('', '')
  }, [fetchData])

  const handleApply = () => {
    setApplied({ desde, hasta })
    fetchData(desde, hasta)
  }

  const handleClear = () => {
    setDesde('')
    setHasta('')
    setApplied({ desde: '', hasta: '' })
    fetchData('', '')
  }

  const hasFilter = applied.desde || applied.hasta

  return (
    <div className="space-y-0">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-rosa-800">Dashboard</h1>
          <p className="text-rosa-400 text-sm mt-0.5">Resumen general de la plataforma</p>
        </div>
        <Link
          href="/fichas/nueva"
          className="inline-flex items-center gap-2 bg-rosa-500 hover:bg-rosa-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors self-start sm:self-auto"
        >
          Nueva Ficha
        </Link>
      </div>

      {/* ── Date filter ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm mb-2">
        <Calendar className="h-4 w-4 text-rosa-400 shrink-0 mb-1.5" />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-rosa-600">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="h-8 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rosa-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-rosa-600">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="h-8 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rosa-400"
          />
        </div>
        <button
          onClick={handleApply}
          className="h-8 px-4 bg-rosa-500 hover:bg-rosa-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Aplicar
        </button>
        {hasFilter && (
          <button
            onClick={handleClear}
            className="h-8 px-3 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm rounded-lg transition-colors"
          >
            Limpiar
          </button>
        )}
        {hasFilter && (
          <span className="text-xs text-rosa-500 font-medium mb-1.5">
            Filtrado: {applied.desde || '...'} → {applied.hasta || '...'}
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mt-4">
          {error}
        </div>
      )}

      {/* ── Quick stats ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {[
          { label: 'Fichas Médicas', value: data?.totalFichas ?? 0, icon: FileText, href: '/fichas', color: 'bg-rosa-100 text-rosa-600' },
          { label: 'Pacientes',      value: data?.totalPacientes ?? 0, icon: Users, href: '/privados', color: 'bg-purple-100 text-purple-600' },
          { label: 'Empresas',       value: data?.totalEmpresas ?? 0, icon: Building2, href: '/empresas', color: 'bg-blue-100 text-blue-600' },
        ].map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href} className="group">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-rosa-500 uppercase tracking-wide">{label}</p>
                  <p className="text-3xl font-bold text-rosa-800 mt-1">
                    {loading ? <span className="inline-block h-8 w-16 bg-gray-100 rounded animate-pulse" /> : value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ═══ SECTION 1 — Mis pacientes ═══════════════════════════════════════ */}
      <SectionDivider title="Mis pacientes" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
        {/* Total pacientes */}
        {loading
          ? <SkeletonBlock h="h-36" />
          : <ColorStatCard
              value={String(data?.totalPacientes ?? 0)}
              label="Cantidad total de pacientes"
              bg="bg-slate-700"
            />
        }

        {/* Mujeres ring */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center justify-center">
          {loading
            ? <SkeletonBlock h="h-24" />
            : <RingChart pct={data?.mujeresPct ?? 0} color="#ec4899" label="Mujeres" />
          }
        </div>

        {/* Hombres ring */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center justify-center">
          {loading
            ? <SkeletonBlock h="h-24" />
            : <RingChart pct={data?.hombresPct ?? 0} color="#38bdf8" label="Hombres" />
          }
        </div>

        {/* Último paciente creado */}
        {loading
          ? <SkeletonBlock h="h-36" />
          : data?.ultimoPaciente
            ? <PatientHighlightCard
                nombre={data.ultimoPaciente.nombre}
                metric="Último paciente creado"
                accentColor="#9ca3af"
              />
            : <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center justify-center text-sm text-gray-400">Sin datos</div>
        }
      </div>

      {/* ═══ SECTION 2 — Peso ════════════════════════════════════════════════ */}
      <SectionDivider title="Peso de mis pacientes" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
        {loading ? (
          <>
            <SkeletonBlock h="h-36" />
            <SkeletonBlock h="h-36" />
            <SkeletonBlock h="h-36" />
            <SkeletonBlock h="h-36" />
          </>
        ) : (
          <>
            <ColorStatCard
              value={String(data?.totalMediciones ?? 0)}
              label="Cantidad total de mediciones"
              bg="bg-blue-500"
            />
            <ColorStatCard
              value={data?.pesoPromedio != null ? `${formatDecimal(data.pesoPromedio, 1)} Kg` : '—'}
              label="Peso promedio de mis pacientes"
              bg="bg-orange-500"
            />
            <ColorStatCard
              value={data?.sumaKilosPerdidos ? `${formatDecimal(data.sumaKilosPerdidos, 1)} Kg` : '0 Kg'}
              label="Suma de kilos perdidos de mis pacientes"
              bg="bg-green-500"
            />
            {data?.mayorPesoPerdido
              ? <PatientHighlightCard
                  nombre={data.mayorPesoPerdido.nombre}
                  metric={`Mayor descenso de peso (${formatDecimal(data.mayorPesoPerdido.kilos, 1)} Kg)`}
                  accentColor="#ec4899"
                />
              : <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center justify-center text-sm text-gray-400">Sin datos</div>
            }
          </>
        )}
      </div>

      {/* ═══ SECTION 3 — Porcentaje de grasa ════════════════════════════════ */}
      <SectionDivider title="Porcentaje de grasa" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 pb-4">
        {/* Promedio grasa */}
        <div className="lg:col-span-1">
          {loading
            ? <SkeletonBlock h="h-64" />
            : <ColorStatCard
                value={data?.promedioGrasa != null ? `${formatDecimal(data.promedioGrasa, 1)} %` : '—'}
                label="Promedio de porcentaje de grasa de mis pacientes"
                bg="bg-green-500"
              />
          }
        </div>

        {/* Donut chart grasa */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs font-semibold text-rosa-600 uppercase tracking-wide mb-3">
            Cantidad de pacientes clasificados por % de grasa
          </p>
          {loading
            ? <SkeletonBlock h="h-52" />
            : <DonutChart data={data?.distribucionGrasa ?? []} colors={GRASA_COLORS} />
          }
        </div>

        {/* Min/Max grasa patient cards */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {loading ? (
            <>
              <SkeletonBlock h="h-[7.5rem]" />
              <SkeletonBlock h="h-[7.5rem]" />
            </>
          ) : (
            <>
              {data?.menorGrasa
                ? <PatientHighlightCard
                    nombre={data.menorGrasa.nombre}
                    metric={`Menor % de grasa (${formatDecimal(data.menorGrasa.valor, 1)})`}
                    accentColor="#22c55e"
                  />
                : <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center justify-center text-sm text-gray-400 flex-1">Sin datos</div>
              }
              {data?.mayorGrasa
                ? <PatientHighlightCard
                    nombre={data.mayorGrasa.nombre}
                    metric={`Mayor % de grasa (${formatDecimal(data.mayorGrasa.valor, 1)})`}
                    accentColor="#22c55e"
                  />
                : <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center justify-center text-sm text-gray-400 flex-1">Sin datos</div>
              }
            </>
          )}
        </div>
      </div>

      {/* ═══ SECTION 4 — IMC ═════════════════════════════════════════════════ */}
      <SectionDivider title="IMC de mis pacientes" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 pb-4">
        {/* Promedio IMC */}
        <div className="lg:col-span-1">
          {loading
            ? <SkeletonBlock h="h-64" />
            : <ColorStatCard
                value={data?.promedioIMC != null ? formatDecimal(data.promedioIMC, 1) : '—'}
                label="Promedio de IMC de mis pacientes"
                bg="bg-sky-500"
              />
          }
        </div>

        {/* Donut chart IMC */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs font-semibold text-rosa-600 uppercase tracking-wide mb-3">
            Cantidad de pacientes clasificados por IMC
          </p>
          {loading
            ? <SkeletonBlock h="h-52" />
            : <DonutChart data={data?.distribucionIMC ?? []} colors={IMC_COLORS} />
          }
        </div>

        {/* Min/Max IMC patient cards */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {loading ? (
            <>
              <SkeletonBlock h="h-[7.5rem]" />
              <SkeletonBlock h="h-[7.5rem]" />
            </>
          ) : (
            <>
              {data?.menorIMC
                ? <PatientHighlightCard
                    nombre={data.menorIMC.nombre}
                    metric={`Menor IMC (${formatDecimal(data.menorIMC.valor, 1)})`}
                    accentColor="#38bdf8"
                  />
                : <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center justify-center text-sm text-gray-400 flex-1">Sin datos</div>
              }
              {data?.mayorIMC
                ? <PatientHighlightCard
                    nombre={data.mayorIMC.nombre}
                    metric={`Mayor IMC (${formatDecimal(data.mayorIMC.valor, 1)})`}
                    accentColor="#38bdf8"
                  />
                : <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center justify-center text-sm text-gray-400 flex-1">Sin datos</div>
              }
            </>
          )}
        </div>
      </div>

      {/* ═══ Últimas fichas registradas ══════════════════════════════════════ */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-rosa-800 text-sm">Últimas fichas registradas</h2>
          <Link
            href="/fichas"
            className="text-xs text-rosa-500 hover:text-rosa-700 flex items-center gap-1 transition-colors"
          >
            Ver todas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !data?.ultimasFichas?.length ? (
          <div className="py-10 text-center text-rosa-300">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No hay fichas registradas aún</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.ultimasFichas.map((ficha) => (
              <li key={ficha.id}>
                <Link
                  href={`/fichas/${ficha.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-rosa-800">{ficha.nombre ?? '—'}</p>
                    <p className="text-xs text-rosa-400 mt-0.5">{ficha.empresa ?? 'Paciente privado'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {ficha.fecha_consulta && (
                      <span className="text-xs text-rosa-400 hidden sm:block">
                        {formatDate(ficha.fecha_consulta)}
                      </span>
                    )}
                    {ficha.imc != null && (
                      <span className="text-xs bg-rosa-50 text-rosa-600 px-2 py-0.5 rounded-full font-medium">
                        IMC {Number(ficha.imc).toFixed(1)}
                      </span>
                    )}
                    <ArrowRight className="h-3.5 w-3.5 text-rosa-300 group-hover:text-rosa-500 transition-colors" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
