'use client'

import { useEffect, useState, useTransition } from 'react'
import { Users, Loader2, ShieldCheck, UserCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { updateUserRole } from '@/app/(dashboard)/usuarios/actions'
import type { UserProfile, UserRole } from '@/types/user'
import { useUserProfile } from '@/context/user-context'

const supabase = createClient()

const roleConfig: Record<UserRole, { label: string; icon: typeof ShieldCheck; className: string }> = {
  admin: {
    label: 'Admin',
    icon: ShieldCheck,
    className: 'bg-rosa-100 text-rosa-700 border border-rosa-200',
  },
  asistente: {
    label: 'Asistente',
    icon: UserCircle2,
    className: 'bg-gray-100 text-gray-600 border border-gray-200',
  },
}

export function UsuariosManager() {
  const currentUser = useUserProfile()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function fetchUsers() {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at')

    if (err) {
      setError(err.message)
    } else {
      setUsers((data as unknown as UserProfile[]) ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  function handleRoleChange(user: UserProfile, newRole: UserRole) {
    setUpdatingId(user.id)
    setError(null)
    startTransition(async () => {
      const result = await updateUserRole(user.id, newRole)
      if (result.error) {
        setError(result.error)
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
        )
      }
      setUpdatingId(null)
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
        <Loader2 className="h-6 w-6 text-rosa-400 animate-spin mx-auto" />
        <p className="text-sm text-rosa-400 mt-2">Cargando usuarios...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <Users className="h-5 w-5 text-rosa-500" />
        <div>
          <h2 className="font-semibold text-rosa-800 text-sm">Gestión de Usuarios</h2>
          <p className="text-xs text-rosa-400">Cambia el rol de cada usuario. El rol Admin permite gestionar usuarios.</p>
        </div>
      </div>

      {error && (
        <div className="mx-5 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {users.length === 0 ? (
        <div className="py-10 text-center text-rosa-300">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No hay usuarios registrados</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {users.map((user) => {
            const isSelf = user.id === currentUser?.id
            const isUpdating = updatingId === user.id && isPending
            const { label, icon: RoleIcon, className } = roleConfig[user.role]

            return (
              <li key={user.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-rosa-50 flex items-center justify-center shrink-0">
                  <RoleIcon className="h-4 w-4 text-rosa-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-rosa-800 truncate">
                    {user.nombre ?? user.email}
                    {isSelf && (
                      <span className="ml-2 text-xs text-rosa-300">(tú)</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin text-rosa-400" />
                  ) : (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${className}`}>
                      {label}
                    </span>
                  )}

                  {/* Role toggle — admins can change others' roles, not their own */}
                  {!isSelf && (
                    <select
                      value={user.role}
                      disabled={isUpdating}
                      onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                      className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 bg-white hover:border-rosa-300 focus:outline-none focus:ring-1 focus:ring-rosa-300 disabled:opacity-50"
                    >
                      <option value="admin">Admin</option>
                      <option value="asistente">Asistente</option>
                    </select>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div className="px-5 py-3 border-t border-gray-100 text-xs text-rosa-300">
        {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
