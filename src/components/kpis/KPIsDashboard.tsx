'use client'

import { useMemo } from 'react'
import { useKPIs } from '@/hooks/useKPIs'
import { useEmpresaFilter } from '@/hooks/useEmpresaFilter'
import { KPICard } from './KPICard'
import { FiltroEmpresa } from './FiltroEmpresa'
import { GrasaChart } from './GrasaChart'
import { RiesgoChart } from './RiesgoChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  TrendingDown,
  Activity,
  AlertTriangle,
  Scale,
  Dumbbell,
} from 'lucide-react'
import { formatDecimal } from '@/lib/utils'

export function KPIsDashboard() {
  const { empresas, selectedEmpresaId, setSelectedEmpresaId, loading: loadingEmpresas } =
    useEmpresaFilter()

  const { kpis, loading: loadingKPIs, error } = useKPIs({
    empresaId: selectedEmpresaId,
  })

  const riesgoData = useMemo(() => kpis?.distribucionRiesgo ?? [], [kpis])

  const loading = loadingKPIs || loadingEmpresas

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-rosa-800">KPIs Nutricionales</h1>
          <p className="text-rosa-500 text-sm mt-1">
            Indicadores de progreso y salud de pacientes
          </p>
        </div>
        <FiltroEmpresa
          empresas={empresas}
          selectedId={selectedEmpresaId}
          onChange={setSelectedEmpresaId}
          loading={loadingEmpresas}
        />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          Error cargando KPIs: {error}
        </div>
      )}

      {/* KPI Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-8">
        <KPICard
          title="Total Pacientes"
          value={loading ? '...' : (kpis?.totalPacientes ?? 0)}
          subtitle={kpis ? `${kpis.totalFichas} consultas registradas` : undefined}
          icon={Users}
          loading={loading}
        />
        <KPICard
          title="IMC Promedio Actual"
          value={loading ? '...' : (kpis?.promedioIMC != null ? formatDecimal(kpis.promedioIMC, 1) : '—')}
          subtitle="Última ficha por paciente"
          icon={Scale}
          variant={
            kpis?.promedioIMC == null ? 'default' :
            kpis.promedioIMC < 25 ? 'success' :
            kpis.promedioIMC < 30 ? 'warning' : 'danger'
          }
          loading={loading}
        />
        <KPICard
          title="Pacientes Riesgo Alto"
          value={loading ? '...' : (kpis?.pacientesRiesgoAlto ?? 0)}
          subtitle={
            kpis && kpis.totalPacientes > 0
              ? `${Math.round((kpis.pacientesRiesgoAlto / kpis.totalPacientes) * 100)}% del total`
              : 'Sin datos'
          }
          icon={AlertTriangle}
          variant={
            !kpis || kpis.pacientesRiesgoAlto === 0 ? 'success' :
            kpis.pacientesRiesgoAlto <= 2 ? 'warning' : 'danger'
          }
          loading={loading}
        />
        <KPICard
          title="Δ % Grasa Promedio"
          value={
            loading ? '...' :
            kpis?.promedioGrasaBajada != null
              ? `${kpis.promedioGrasaBajada > 0 ? '+' : ''}${formatDecimal(kpis.promedioGrasaBajada, 1)}%`
              : '—'
          }
          subtitle="Primera vs. última ficha"
          icon={TrendingDown}
          variant={
            kpis?.promedioGrasaBajada == null ? 'default' :
            kpis.promedioGrasaBajada < 0 ? 'success' :
            kpis.promedioGrasaBajada === 0 ? 'default' : 'warning'
          }
          loading={loading}
        />
        <KPICard
          title="Δ % Músculo Promedio"
          value={
            loading ? '...' :
            kpis?.promedioMusculoCambiado != null
              ? `${kpis.promedioMusculoCambiado > 0 ? '+' : ''}${formatDecimal(kpis.promedioMusculoCambiado, 1)}%`
              : '—'
          }
          subtitle="Primera vs. última ficha"
          icon={Dumbbell}
          variant={
            kpis?.promedioMusculoCambiado == null ? 'default' :
            kpis.promedioMusculoCambiado > 0 ? 'success' :
            kpis.promedioMusculoCambiado === 0 ? 'default' : 'warning'
          }
          loading={loading}
        />
        <KPICard
          title="Peso Perdido Promedio"
          value={
            loading ? '...' :
            kpis?.promedioPesoPerdido != null
              ? `${formatDecimal(Math.abs(kpis.promedioPesoPerdido), 1)} kg`
              : '—'
          }
          subtitle={
            kpis?.promedioPesoPerdido != null
              ? kpis.promedioPesoPerdido < 0 ? 'Reducción promedio' : 'Aumento promedio'
              : 'Primera vs. última ficha'
          }
          icon={Activity}
          variant={
            kpis?.promedioPesoPerdido == null ? 'default' :
            kpis.promedioPesoPerdido < 0 ? 'success' :
            kpis.promedioPesoPerdido === 0 ? 'default' : 'warning'
          }
          loading={loading}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribución Diagnóstico de Grasa</CardTitle>
            <p className="text-xs text-rosa-400">Última ficha por paciente</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-52 bg-gray-100 rounded-lg animate-pulse" />
            ) : (
              <GrasaChart data={kpis?.distribucionGrasa ?? []} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribución Riesgo Metabólico</CardTitle>
            <p className="text-xs text-rosa-400">Última ficha por paciente</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-52 bg-gray-100 rounded-lg animate-pulse" />
            ) : (
              <RiesgoChart data={riesgoData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary table */}
      {kpis && kpis.distribucionGrasa.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resumen por Clasificación de Grasa</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-rosa-100">
                  <th className="text-left py-2 text-xs font-semibold text-rosa-600 uppercase">Clasificación</th>
                  <th className="text-right py-2 text-xs font-semibold text-rosa-600 uppercase">Pacientes</th>
                  <th className="text-right py-2 text-xs font-semibold text-rosa-600 uppercase">%</th>
                </tr>
              </thead>
              <tbody>
                {kpis.distribucionGrasa.map((d) => (
                  <tr key={d.clasificacion} className="border-b border-rosa-50 last:border-0">
                    <td className="py-2 text-rosa-700">{d.clasificacion}</td>
                    <td className="py-2 text-right font-medium text-rosa-800">{d.cantidad}</td>
                    <td className="py-2 text-right text-rosa-500">{d.porcentaje}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
