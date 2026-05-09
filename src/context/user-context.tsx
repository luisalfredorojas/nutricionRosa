'use client'

import { createContext, useContext } from 'react'
import type { UserProfile } from '@/types/user'

const UserContext = createContext<UserProfile | null>(null)

export function UserProvider({
  profile,
  children,
}: {
  profile: UserProfile | null
  children: React.ReactNode
}) {
  return <UserContext.Provider value={profile}>{children}</UserContext.Provider>
}

export function useUserProfile() {
  return useContext(UserContext)
}

export function useIsAdmin() {
  const profile = useContext(UserContext)
  return profile?.role === 'admin'
}
