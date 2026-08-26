import { config as loadEnv } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// Next.js reads .env.local itself, but the standalone Prisma CLI does not —
// load it explicitly here. Deployed environments (Vercel) inject
// DATABASE_URL directly, so a missing file is a no-op there.
loadEnv({ path: '.env.local', quiet: true })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    // Neon's pooled DATABASE_URL (pgbouncer) doesn't support the advisory
    // locks Migrate needs — the CLI must use the direct/unpooled connection.
    // The app runtime (src/lib/db.ts) still uses the pooled DATABASE_URL.
    url: env('DATABASE_URL_UNPOOLED'),
  },
})
