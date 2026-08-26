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
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
