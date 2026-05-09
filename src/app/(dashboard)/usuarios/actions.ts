'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/supabase/get-user-profile'
import type { UserRole } from '@/types/user'

export async function updateUserRole(userId: string, role: UserRole): Promise<{ error?: string }> {
  const caller = await getUserProfile()
  if (!caller || caller.role !== 'admin') {
    return { error: 'Sin permisos para realizar esta acción.' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('user_profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return { error: error.message }
  return {}
}
