import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/auth/session'
import { db } from '@/lib/db'

// WordPress's date-prefixed permalink shape (e.g. /2026/08/15/some-post/).
// Nothing in this app produces URLs shaped like this, so it's safe to gate
// a DB lookup behind it — normal traffic to /news/*, /category/*, etc.
// never reaches this branch.
const LEGACY_POST_PATH = /^\/\d{4}\/\d{2}\/\d{2}\/.+/

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (LEGACY_POST_PATH.test(pathname)) {
    const redirect = await db.redirect.findUnique({
      where: { oldUrl: pathname.replace(/\/+$/, '') },
    })
    if (redirect) {
      return NextResponse.redirect(new URL(redirect.newUrl, request.url), redirect.statusCode)
    }
    return NextResponse.next()
  }

  // Optimistic, cookie-presence-only check to bounce obviously-signed-out
  // visitors before they render the admin shell. This is NOT the security
  // boundary — every /admin layout/page still does its own DB-backed
  // requireUser()/requireRole() check, since a cookie can be forged or stale.
  const isLoginRoute = pathname === '/admin/login'
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME)
  if (pathname.startsWith('/admin') && !isLoginRoute && !hasSessionCookie) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug*'],
}
