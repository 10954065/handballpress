import { NextResponse, type NextRequest } from 'next/server'
import { unsubscribeByToken } from '@/lib/newsletter/unsubscribe'

// Mailbox providers (Gmail, Yahoo, ...) call this directly per RFC 8058
// when a subscriber uses their built-in "Unsubscribe" button — see the
// List-Unsubscribe / List-Unsubscribe-Post headers in templates.ts. No
// session or CSRF token is available in that context; the unguessable,
// per-recipient token in the URL is itself the authorization.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const result = await unsubscribeByToken(searchParams.get('email'), searchParams.get('token'))
  if (result === 'invalid') {
    return new NextResponse('Invalid or expired unsubscribe link.', { status: 400 })
  }
  return new NextResponse('OK', { status: 200 })
}
