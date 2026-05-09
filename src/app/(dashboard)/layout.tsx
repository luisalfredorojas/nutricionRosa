import { DashboardShell } from '@/components/layout/DashboardShell'
import { getUserProfile } from '@/lib/supabase/get-user-profile'
import { UserProvider } from '@/context/user-context'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()

  return (
    <UserProvider profile={profile}>
      <DashboardShell>{children}</DashboardShell>
    </UserProvider>
  )
}
