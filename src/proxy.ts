import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/auth/session'

// Optimistic, cookie-presence-only check to bounce obviously-signed-out
// visitors before they render the admin shell. This is NOT the security
// boundary — every /admin layout/page still does its own DB-backed
// requireUser()/requireRole() check, since a cookie can be forged or stale.
export function proxy(request: NextRequest) {
  const isLoginRoute = request.nextUrl.pathname === '/admin/login'
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME)

  if (!isLoginRoute && !hasSessionCookie) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
