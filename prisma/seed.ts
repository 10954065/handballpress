import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local', quiet: true })

import { hash } from '@node-rs/argon2'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { UserRole } from '../src/generated/prisma/enums'

// Deliberately standalone (not reusing src/lib/db.ts or src/lib/auth/password.ts):
// those are guarded with `import 'server-only'`, which throws unconditionally
// outside Next's bundler — this script runs under plain tsx.
const ARGON2_OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1 }
const MIN_SEED_PASSWORD_LENGTH = 12

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  const name = process.env.SEED_ADMIN_NAME ?? 'Super Admin'

  if (!email || !password) {
    console.log(
      'Skipping admin seed — set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env.local to create one.'
    )
    return
  }
  if (password.length < MIN_SEED_PASSWORD_LENGTH) {
    throw new Error(`SEED_ADMIN_PASSWORD must be at least ${MIN_SEED_PASSWORD_LENGTH} characters.`)
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const db = new PrismaClient({ adapter })

  try {
    const passwordHash = await hash(password, ARGON2_OPTIONS)
    const user = await db.user.upsert({
      where: { email: email.toLowerCase() },
      update: {},
      create: { email: email.toLowerCase(), name, passwordHash, role: UserRole.SUPER_ADMIN },
    })
    console.log(`Seeded SUPER_ADMIN user: ${user.email}`)
  } finally {
    await db.$disconnect()
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
