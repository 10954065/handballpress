import 'server-only'
import { randomBytes, createHash } from 'node:crypto'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import type { UserRole } from '@/generated/prisma/enums'

const SESSION_COOKIE_NAME = 'session'
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30 // 30 days
const SESSION_RENEWAL_THRESHOLD_MS = 1000 * 60 * 60 * 24 * 15 // renew once <15 days remain

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function generateSessionToken(): string {
  return randomBytes(20).toString('base64url')
}

export async function createSession(
  token: string,
  userId: string,
  meta: { ipAddress?: string; userAgent?: string } = {}
): Promise<{ id: string; expiresAt: Date }> {
  const id = hashToken(token)
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
  await db.session.create({
    data: { id, userId, expiresAt, ipAddress: meta.ipAddress, userAgent: meta.userAgent },
  })
  return { id, expiresAt }
}

export async function validateSessionToken(
  token: string
): Promise<{ session: { id: string; expiresAt: Date }; user: SessionUser } | null> {
  const id = hashToken(token)
  const result = await db.session.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true, isActive: true } },
    },
  })
  if (!result || !result.user.isActive) return null

  if (Date.now() >= result.expiresAt.getTime()) {
    await db.session.delete({ where: { id } })
    return null
  }

  let { expiresAt } = result
  if (Date.now() >= expiresAt.getTime() - SESSION_RENEWAL_THRESHOLD_MS) {
    expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
    await db.session.update({ where: { id }, data: { expiresAt } })
  }

  const { user } = result
  return {
    session: { id, expiresAt },
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  }
}

export function invalidateSession(sessionId: string): Promise<unknown> {
  return db.session.delete({ where: { id: sessionId } }).catch(() => undefined)
}

export function invalidateSessionByToken(token: string): Promise<unknown> {
  return invalidateSession(hashToken(token))
}

export function invalidateAllUserSessions(userId: string): Promise<unknown> {
  return db.session.deleteMany({ where: { userId } })
}

export async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
}

export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getSessionTokenFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value
}

export { SESSION_COOKIE_NAME }
