import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// A plain server-rendered <a href> can't record a click itself, so the ad
// link points here first: increment the counter, then 302 on to the real
// destination. No JS required, works identically with ad blockers that
// only strip script-based trackers.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ad = await db.advertisement.findUnique({ where: { id } })
  if (!ad?.linkUrl) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  await db.advertisement.update({ where: { id }, data: { clicks: { increment: 1 } } })
  return NextResponse.redirect(ad.linkUrl)
}
