import 'server-only'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'
import { serverEnv } from '@/lib/env.server'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const adapter = new PrismaPg({ connectionString: serverEnv.DATABASE_URL })

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
