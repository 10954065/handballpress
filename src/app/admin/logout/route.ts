import { NextResponse } from 'next/server'
import {
  deleteSessionCookie,
  getSessionTokenFromCookies,
  invalidateSessionByToken,
} from '@/lib/auth/session'

// A plain Route Handler + HTML form POST rather than a Server Action bound
// to <form action={fn}> — that pattern redirects unreliably when the form
// submits before hydration completes (observed on WebKit): the follow-up
// request preserves the original action reference but lands on a route
// whose bundle doesn't include it. A conventional POST endpoint has no such
// ambiguity and needs no client JS at all.
export async function POST(request: Request) {
  const token = await getSessionTokenFromCookies()
  if (token) {
    await invalidateSessionByToken(token)
  }
  await deleteSessionCookie()
  return NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 })
}
