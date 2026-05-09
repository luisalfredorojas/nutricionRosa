import { createClient } from './server'
import type { UserProfile } from '@/types/user'

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (data as unknown as UserProfile) ?? null
}
