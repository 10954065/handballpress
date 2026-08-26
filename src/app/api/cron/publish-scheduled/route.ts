import { NextResponse, type NextRequest } from 'next/server'
import { serverEnv } from '@/lib/env.server'
import { publishDueScheduledArticles } from '@/lib/articles/scheduling'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = serverEnv.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const published = await publishDueScheduledArticles()
  return NextResponse.json({ published })
}
