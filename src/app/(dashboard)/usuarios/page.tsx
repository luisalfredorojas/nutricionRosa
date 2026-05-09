export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/supabase/get-user-profile'
import { UsuariosManager } from '@/components/usuarios/UsuariosManager'

export default async function UsuariosPage() {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    redirect('/inicio')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-rosa-800">Usuarios</h1>
        <p className="text-rosa-400 text-sm mt-0.5">Gestiona los usuarios y sus roles</p>
      </div>
      <UsuariosManager />
    </div>
  )
}
