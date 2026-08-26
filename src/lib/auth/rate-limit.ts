import 'server-only'
import { db } from '@/lib/db'

const LOGIN_RATE_LIMIT_WINDOW_MS = 1000 * 60 * 15 // 15 minutes
const MAX_FAILED_ATTEMPTS_PER_WINDOW = 5

const LOGIN_FAILED_ACTION = 'LOGIN_FAILED'

export async function isLoginRateLimited(email: string, ipAddress?: string): Promise<boolean> {
  const since = new Date(Date.now() - LOGIN_RATE_LIMIT_WINDOW_MS)

  const [byEmail, byIp] = await Promise.all([
    db.auditLog.count({
      where: {
        action: LOGIN_FAILED_ACTION,
        entityId: email.toLowerCase(),
        createdAt: { gte: since },
      },
    }),
    ipAddress
      ? db.auditLog.count({
          where: { action: LOGIN_FAILED_ACTION, ipAddress, createdAt: { gte: since } },
        })
      : Promise.resolve(0),
  ])

  return byEmail >= MAX_FAILED_ATTEMPTS_PER_WINDOW || byIp >= MAX_FAILED_ATTEMPTS_PER_WINDOW
}

export function recordLoginFailure(email: string, ipAddress?: string): Promise<unknown> {
  return db.auditLog.create({
    data: {
      action: LOGIN_FAILED_ACTION,
      entityType: 'User',
      entityId: email.toLowerCase(),
      ipAddress,
    },
  })
}

export function recordLoginSuccess(userId: string, ipAddress?: string): Promise<unknown> {
  return db.auditLog.create({
    data: { userId, action: 'LOGIN_SUCCESS', entityType: 'User', entityId: userId, ipAddress },
  })
}
