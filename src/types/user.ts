export type UserRole = 'admin' | 'asistente'

export interface UserProfile {
  id: string
  email: string
  nombre: string | null
  role: UserRole
  created_at: string
  updated_at: string
}
