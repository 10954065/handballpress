import { timingSafeEqual } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { serverEnv } from '@/lib/env.server'
import { publishDueScheduledArticles } from '@/lib/articles/scheduling'

function isAuthorized(authHeader: string | null, cronSecret: string | undefined): boolean {
  if (!cronSecret) return false
  const expected = Buffer.from(`Bearer ${cronSecret}`)
  const actual = Buffer.from(authHeader ?? '')
  // Constant-time comparison: a plain `!==` leaks how many leading bytes
  // matched via response timing, letting an attacker recover the secret
  // one byte at a time. Length must match first — timingSafeEqual throws
  // on mismatched buffer lengths rather than returning false.
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request.headers.get('authorization'), serverEnv.CRON_SECRET)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const published = await publishDueScheduledArticles()
  return NextResponse.json({ published })
}
