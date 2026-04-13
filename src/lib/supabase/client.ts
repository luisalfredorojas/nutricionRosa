import { createBrowserClient } from '@supabase/ssr'

// TODO: Add <Database> generic after running: pnpm supabase gen types typescript --project-id <id>
// import type { Database } from '@/types/database'
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
