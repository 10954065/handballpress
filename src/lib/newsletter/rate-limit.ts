import 'server-only'
import { db } from '@/lib/db'

const SIGNUP_RATE_LIMIT_WINDOW_MS = 1000 * 60 * 60 // 1 hour
const MAX_SIGNUPS_PER_IP_PER_WINDOW = 10

const NEWSLETTER_SIGNUP_ACTION = 'NEWSLETTER_SIGNUP'

// IP-based (not email-based): the abuse this guards against is a caller
// submitting many different strangers' addresses to trigger unwanted
// welcome emails, so limiting by the attempted email would not help.
export async function isNewsletterSignupRateLimited(ipAddress?: string): Promise<boolean> {
  if (!ipAddress) return false

  const since = new Date(Date.now() - SIGNUP_RATE_LIMIT_WINDOW_MS)
  const count = await db.auditLog.count({
    where: { action: NEWSLETTER_SIGNUP_ACTION, ipAddress, createdAt: { gte: since } },
  })
  return count >= MAX_SIGNUPS_PER_IP_PER_WINDOW
}

export function recordNewsletterSignupAttempt(email: string, ipAddress?: string): Promise<unknown> {
  return db.auditLog.create({
    data: {
      action: NEWSLETTER_SIGNUP_ACTION,
      entityType: 'NewsletterSubscriber',
      entityId: email,
      ipAddress,
    },
  })
}
