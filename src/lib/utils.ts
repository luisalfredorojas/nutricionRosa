import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  if (typeof date === 'string') {
    const [y, m, d] = date.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('es-CL', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    })
  }
  return date.toLocaleDateString('es-CL', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
}

export function formatDecimal(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return '—'
  return value.toFixed(decimals)
}

// Escapa los comodines de SQL LIKE/ILIKE (\ % _) para que un valor con esos
// caracteres (p. ej. un correo con guion bajo) haga match literal y no por patrón.
export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`)
}

// Normaliza el nombre de una ciudad a MAYÚSCULAS sin espacios sobrantes, para
// evitar duplicados como "Guayaquil" / "GUAYAQUIL" / " guayaquil ". Vacío → null.
export function normalizeCiudad(ciudad: string | null | undefined): string | null {
  const v = (ciudad ?? '').trim().replace(/\s+/g, ' ').toUpperCase()
  return v || null
}
