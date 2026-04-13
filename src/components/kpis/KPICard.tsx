import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
  }
  variant?: 'default' | 'success' | 'warning' | 'danger'
  loading?: boolean
}

const variantStyles = {
  default: {
    bg: 'bg-white',
    iconBg: 'bg-rosa-100',
    iconColor: 'text-rosa-600',
    valueColor: 'text-rosa-800',
    border: 'border-rosa-200',
  },
  success: {
    bg: 'bg-white',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    valueColor: 'text-green-700',
    border: 'border-green-200',
  },
  warning: {
    bg: 'bg-white',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    valueColor: 'text-yellow-700',
    border: 'border-yellow-200',
  },
  danger: {
    bg: 'bg-white',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    valueColor: 'text-red-700',
    border: 'border-red-200',
  },
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  loading = false,
}: KPICardProps) {
  const styles = variantStyles[variant]

  if (loading) {
    return (
      <div className={cn('rounded-xl border p-6 shadow-sm animate-pulse', styles.bg, styles.border)}>
        <div className="h-4 bg-rosa-100 rounded w-2/3 mb-3" />
        <div className="h-8 bg-rosa-100 rounded w-1/2 mb-2" />
        <div className="h-3 bg-rosa-50 rounded w-1/3" />
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border p-6 shadow-sm', styles.bg, styles.border)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-rosa-500 uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className={cn('text-3xl font-bold mt-1', styles.valueColor)}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-rosa-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.value < 0 ? 'text-green-600' : trend.value > 0 ? 'text-red-500' : 'text-rosa-400'
                )}
              >
                {trend.value > 0 ? '+' : ''}{trend.value.toFixed(1)}%
              </span>
              <span className="text-xs text-rosa-400">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', styles.iconBg)}>
          <Icon className={cn('h-6 w-6', styles.iconColor)} />
        </div>
      </div>
    </div>
  )
}
