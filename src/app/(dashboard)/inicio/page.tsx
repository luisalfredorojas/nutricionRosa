export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FileText, Users, Building2, Plus, ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [fichasRes, pacientesRes, empresasRes, ultimasFichas] = await Promise.all([
    supabase.from('fichas_nutricionales').select('id', { count: 'exact', head: true }),
    supabase.from('pacientes').select('id', { count: 'exact', head: true }),
    supabase.from('empresas').select('id', { count: 'exact', head: true }),
    supabase
      .from('fichas_nutricionales')
      .select(`
        id, fecha_consulta, imc, riesgo_metabolico,
        pacientes ( nombre, empresas ( nombre ) )
      `)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const totalFichas = fichasRes.count ?? 0
  const totalPacientes = pacientesRes.count ?? 0
  const totalEmpresas = empresasRes.count ?? 0

  const statCards = [
    {
      label: 'Fichas Médicas',
      value: totalFichas,
      icon: FileText,
      href: '/fichas',
      color: 'bg-rosa-100 text-rosa-600',
    },
    {
      label: 'Pacientes',
      value: totalPacientes,
      icon: Users,
      href: '/fichas',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Empresas',
      value: totalEmpresas,
      icon: Building2,
      href: '/kpis',
      color: 'bg-blue-100 text-blue-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-rosa-800">Dashboard</h1>
          <p className="text-rosa-400 text-sm mt-0.5">Resumen general de la plataforma</p>
        </div>
        <Link
          href="/fichas/nueva"
          className="inline-flex items-center gap-2 bg-rosa-500 hover:bg-rosa-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva Ficha
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href} className="group">
            <div className="bg-white rounded-xl border border-rosa-200 p-5 shadow-sm hover:shadow-md hover:border-rosa-300 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-rosa-500 uppercase tracking-wide">{label}</p>
                  <p className="text-3xl font-bold text-rosa-800 mt-1">{value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent fichas */}
      <div className="bg-white rounded-xl border border-rosa-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-rosa-100">
          <h2 className="font-semibold text-rosa-800 text-sm">Últimas fichas registradas</h2>
          <Link
            href="/fichas"
            className="text-xs text-rosa-500 hover:text-rosa-700 flex items-center gap-1 transition-colors"
          >
            Ver todas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {!ultimasFichas.data || ultimasFichas.data.length === 0 ? (
          <div className="py-10 text-center text-rosa-300">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No hay fichas registradas aún</p>
            <Link
              href="/fichas/nueva"
              className="inline-block mt-3 text-xs text-rosa-500 hover:text-rosa-700 underline"
            >
              Crear primera ficha
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-rosa-50">
            {ultimasFichas.data.map((ficha) => {
              const p = ficha.pacientes as unknown as { nombre: string; empresas: { nombre: string } | null } | null
              return (
                <li key={ficha.id}>
                  <Link
                    href={`/fichas/${ficha.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-rosa-50 transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-medium text-rosa-800">{p?.nombre ?? '—'}</p>
                      <p className="text-xs text-rosa-400 mt-0.5">{p?.empresas?.nombre ?? 'Sin empresa'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {ficha.imc != null && (
                        <span className="text-xs bg-rosa-50 text-rosa-600 px-2 py-0.5 rounded-full font-medium">
                          IMC {Number(ficha.imc).toFixed(1)}
                        </span>
                      )}
                      <ArrowRight className="h-3.5 w-3.5 text-rosa-300 group-hover:text-rosa-500 transition-colors" />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/tabla" className="group">
          <div className="bg-white rounded-xl border border-rosa-200 p-5 shadow-sm hover:shadow-md hover:border-rosa-300 transition-all flex items-center gap-4">
            <div className="p-3 bg-rosa-50 rounded-xl group-hover:bg-rosa-100 transition-colors">
              <FileText className="h-5 w-5 text-rosa-500" />
            </div>
            <div>
              <p className="font-semibold text-rosa-800 text-sm">Tabla Matriz</p>
              <p className="text-xs text-rosa-400 mt-0.5">Ver todos los datos con columnas fijas</p>
            </div>
            <ArrowRight className="h-4 w-4 text-rosa-300 ml-auto group-hover:text-rosa-500 transition-colors" />
          </div>
        </Link>
        <Link href="/kpis" className="group">
          <div className="bg-white rounded-xl border border-rosa-200 p-5 shadow-sm hover:shadow-md hover:border-rosa-300 transition-all flex items-center gap-4">
            <div className="p-3 bg-rosa-50 rounded-xl group-hover:bg-rosa-100 transition-colors">
              <Users className="h-5 w-5 text-rosa-500" />
            </div>
            <div>
              <p className="font-semibold text-rosa-800 text-sm">KPIs</p>
              <p className="text-xs text-rosa-400 mt-0.5">Indicadores nutricionales por empresa</p>
            </div>
            <ArrowRight className="h-4 w-4 text-rosa-300 ml-auto group-hover:text-rosa-500 transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  )
}
