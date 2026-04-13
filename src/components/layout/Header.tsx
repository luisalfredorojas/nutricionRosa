'use client'

import { LogOut, User, Menu } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <header className="bg-white border-b border-rosa-200 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-rosa-500 hover:bg-rosa-50 hover:text-rosa-700"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-rosa-600">
          <div className="w-7 h-7 rounded-full bg-rosa-100 flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-rosa-600" />
          </div>
          <span className="text-sm font-medium hidden sm:block">Nutricionista</span>
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
