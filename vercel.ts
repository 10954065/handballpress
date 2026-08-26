import type { VercelConfig } from '@vercel/config/v1'

export const config: VercelConfig = {
  crons: [
    // Hobby plan caps cron frequency at once/day — the actual
    // near-real-time publishing happens via the lazy check on public read
    // paths. See src/lib/articles/scheduling.ts.
    { path: '/api/cron/publish-scheduled', schedule: '0 0 * * *' },
  ],
}
