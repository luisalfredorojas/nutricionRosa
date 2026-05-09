'use client'

import { LogOut, User, Menu } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUserProfile } from '@/context/user-context'

interface HeaderProps {
  onMenuClick?: () => void
}

const roleBadge: Record<string, { label: string; className: string }> = {
  admin: {
    label: 'Admin',
    className: 'bg-rosa-100 text-rosa-700 border border-rosa-200',
  },
  asistente: {
    label: 'Asistente',
    className: 'bg-gray-100 text-gray-600 border border-gray-200',
  },
}

export function Header({ onMenuClick }: HeaderProps) {
  const profile = useUserProfile()
  const badge = profile ? (roleBadge[profile.role] ?? roleBadge.asistente) : null

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-rosa-700"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-rosa-100 flex items-center justify-center shrink-0">
            <User className="h-3.5 w-3.5 text-rosa-600" />
          </div>
          <div className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-sm font-medium text-rosa-800 max-w-[180px] truncate">
              {profile?.email ?? 'Usuario'}
            </span>
            {badge && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${badge.className}`}>
                {badge.label}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-rosa-400 hover:text-rosa-600 text-sm transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:block">Salir</span>
        </button>
      </div>
    </header>
  )
}
