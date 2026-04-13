export const dynamic = 'force-dynamic'

import { EmpresasManager } from '@/components/configuracion/EmpresasManager'

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-rosa-800">Configuración</h1>
        <p className="text-rosa-400 text-sm mt-0.5">Administra los datos base de la plataforma</p>
      </div>

      <EmpresasManager />
    </div>
  )
}
