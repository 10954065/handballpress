import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { serverEnv } from '@/lib/env.server'

// Domain-separated HMAC rather than a stored per-subscriber column: it's
// stateless (verifiable without a DB round-trip) and reuses SESSION_SECRET
// under a distinct label instead of requiring another provisioned secret,
// matching this project's pattern of keeping optional-integration surface
// area (RESEND_API_KEY, CRON_SECRET, ...) additive rather than mandatory.
const TOKEN_LABEL = 'newsletter-unsubscribe:'

export function createUnsubscribeToken(email: string): string {
  return createHmac('sha256', serverEnv.SESSION_SECRET)
    .update(TOKEN_LABEL + email.toLowerCase())
    .digest('base64url')
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = Buffer.from(createUnsubscribeToken(email))
  const actual = Buffer.from(token)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}
