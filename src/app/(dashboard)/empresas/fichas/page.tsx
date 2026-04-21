export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Building2, ChevronRight } from 'lucide-react'

export default async function EmpresasFichasIndexPage() {
  const supabase = await createClient()

  const { data: empresas } = await supabase
    .from('empresas')
    .select('id, nombre')
    .order('nombre', { ascending: true })

  const list = empresas ?? []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-rosa-800">Fichas por Empresa</h1>
        <p className="text-rosa-400 text-sm mt-0.5">
          Selecciona una empresa para ver sus fichas
        </p>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-rosa-400">
          No hay empresas registradas
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((e) => (
            <Link key={e.id} href={`/empresas/${e.id}/fichas`} className="group">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4 hover:border-rosa-300 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-rosa-100 flex items-center justify-center group-hover:bg-rosa-200 transition-colors shrink-0">
                  <Building2 className="h-5 w-5 text-rosa-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-rosa-800 truncate">{e.nombre}</h2>
                  <p className="text-xs text-rosa-400">Ver fichas</p>
                </div>
                <ChevronRight className="h-4 w-4 text-rosa-300 group-hover:text-rosa-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
