import 'server-only'
import { db } from '@/lib/db'

// Vercel Cron on the Hobby plan only runs once per day (hour-level
// precision, not exact) — see https://vercel.com/docs/cron-jobs/usage-and-pricing.
// A daily cron alone can't satisfy "publishes at the scheduled time," so
// this same check also runs inline on public read paths (article/homepage
// queries) for near-real-time accuracy under normal traffic. The cron is
// only the once-a-day safety net for low-traffic periods.
export async function publishDueScheduledArticles(): Promise<number> {
  return db.$executeRaw`
    UPDATE "Article"
    SET status = 'PUBLISHED', "publishedAt" = "scheduledFor", "scheduledFor" = NULL
    WHERE status = 'SCHEDULED' AND "scheduledFor" <= NOW()
  `
}
