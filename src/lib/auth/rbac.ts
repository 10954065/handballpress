import 'server-only'
import { redirect } from 'next/navigation'
import {
  getSessionTokenFromCookies,
  validateSessionToken,
  type SessionUser,
} from '@/lib/auth/session'
import { UserRole } from '@/generated/prisma/enums'

// Higher index = more privilege. Never trust a client-supplied role — this
// hierarchy only governs server-side checks against the session's DB role.
const ROLE_RANK: Record<UserRole, number> = {
  [UserRole.AUTHOR]: 0,
  [UserRole.EDITOR]: 1,
  [UserRole.ADMIN]: 2,
  [UserRole.SUPER_ADMIN]: 3,
}

export function hasRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[minimumRole]
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = await getSessionTokenFromCookies()
  if (!token) return null
  const result = await validateSessionToken(token)
  return result?.user ?? null
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/admin/login')
  return user
}

export async function requireRole(minimumRole: UserRole): Promise<SessionUser> {
  const user = await requireUser()
  if (!hasRole(user.role, minimumRole)) redirect('/admin')
  return user
}
