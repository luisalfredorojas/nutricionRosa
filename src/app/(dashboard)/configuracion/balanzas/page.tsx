export const dynamic = 'force-dynamic'

import { BalanzasManager } from '@/components/configuracion/BalanzasManager'

export default function BalanzasConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-rosa-800">Balanzas</h1>
        <p className="text-rosa-400 text-sm mt-0.5">
          Configura las balanzas disponibles y los campos que cada una registra
        </p>
      </div>

      <BalanzasManager />
    </div>
  )
}
