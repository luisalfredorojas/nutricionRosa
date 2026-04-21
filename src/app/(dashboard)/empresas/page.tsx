import Link from 'next/link'
import { FilePlus, Table2, BarChart3, ChevronRight, FileText } from 'lucide-react'

export default function EmpresasPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-rosa-800">Empresas</h1>
        <p className="text-rosa-400 text-sm mt-0.5">Gestión de pacientes empresariales</p>
      </div>

      {/* Main action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <Link href="/fichas/nueva?tipo=empresa" className="group">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4 hover:border-rosa-300 hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-rosa-100 flex items-center justify-center group-hover:bg-rosa-200 transition-colors">
              <FilePlus className="h-6 w-6 text-rosa-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-rosa-800 mb-1">Nueva Ficha</h2>
              <p className="text-sm text-gray-500">Registrar una nueva consulta de paciente empresarial</p>
            </div>
            <div className="flex items-center text-rosa-500 text-sm font-medium">
              Crear ficha <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        </Link>

        <Link href="/tabla" className="group">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4 hover:border-rosa-300 hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-rosa-100 flex items-center justify-center group-hover:bg-rosa-200 transition-colors">
              <Table2 className="h-6 w-6 text-rosa-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-rosa-800 mb-1">Matriz</h2>
              <p className="text-sm text-gray-500">Ver y analizar todos los pacientes en tabla interactiva</p>
            </div>
            <div className="flex items-center text-rosa-500 text-sm font-medium">
              Abrir matriz <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        </Link>

        <Link href="/empresas/fichas" className="group">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4 hover:border-rosa-300 hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-rosa-100 flex items-center justify-center group-hover:bg-rosa-200 transition-colors">
              <FileText className="h-6 w-6 text-rosa-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-rosa-800 mb-1">Fichas</h2>
              <p className="text-sm text-gray-500">Listado de fichas agrupadas por empresa</p>
            </div>
            <div className="flex items-center text-rosa-500 text-sm font-medium">
              Ver fichas <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        </Link>
      </div>

      {/* Indicadores link */}
      <Link href="/empresas/indicadores" className="group">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-5 hover:border-rosa-300 hover:shadow-md transition-all duration-200">
          <div className="w-11 h-11 rounded-xl bg-rosa-100 flex items-center justify-center group-hover:bg-rosa-200 transition-colors shrink-0">
            <BarChart3 className="h-5 w-5 text-rosa-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-rosa-800">Indicadores</h2>
            <p className="text-sm text-gray-500">Indicadores y métricas nutricionales por empresa</p>
          </div>
          <ChevronRight className="h-5 w-5 text-rosa-300 group-hover:text-rosa-500 transition-colors" />
        </div>
      </Link>
    </div>
  )
}
