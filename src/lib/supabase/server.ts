import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// TODO: Add <Database> generic after running: pnpm supabase gen types typescript --project-id <id>
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: Parameters<typeof cookieStore.set>[2]) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Server component — cookies are set via middleware
          }
        },
        remove(name: string, options: Parameters<typeof cookieStore.set>[2]) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Server component — cookies are removed via middleware
          }
        },
      },
    }
  )
}
