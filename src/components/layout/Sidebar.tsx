'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Table2,
  BarChart3,
  Settings,
  X,
} from 'lucide-react'

const navItems = [
  { href: '/inicio', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/fichas', label: 'Fichas Médicas', icon: FileText },
  { href: '/tabla', label: 'Tabla / Matriz', icon: Table2 },
  { href: '/kpis', label: 'KPIs', icon: BarChart3 },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shrink-0">
      <div className="p-5 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-rosa-800">NutricionRosa</h1>
          <p className="text-xs text-rosa-400 mt-0.5">Plataforma Nutricional</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-rosa-400 hover:text-rosa-600 hover:bg-rosa-50"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-rosa-50 text-rosa-800'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-rosa-700'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-rosa-600' : 'text-rosa-400'}`} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-rosa-300 text-center">v0.1.0</p>
      </div>
    </aside>
  )
}
