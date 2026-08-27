import 'server-only'
import { db } from '@/lib/db'
import { SubscriberStatus } from '@/generated/prisma/enums'
import { verifyUnsubscribeToken } from '@/lib/newsletter/unsubscribe-token'

export type UnsubscribeResult = 'unsubscribed' | 'invalid'

// Shared by the human-facing confirmation page and the RFC 8058 one-click
// API route so token verification and the DB write have one implementation.
export async function unsubscribeByToken(
  email: string | null,
  token: string | null
): Promise<UnsubscribeResult> {
  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return 'invalid'
  }

  // Idempotent: re-clicking an already-processed link (or a mail client
  // retrying the one-click POST) should not error.
  await db.newsletterSubscriber.updateMany({
    where: { email },
    data: { status: SubscriberStatus.UNSUBSCRIBED, unsubscribedAt: new Date() },
  })
  return 'unsubscribed'
}
