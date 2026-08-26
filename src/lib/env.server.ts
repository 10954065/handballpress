import 'server-only'
import { z } from 'zod'

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  WORDPRESS_SITE_URL: z.string().url().optional(),
})

function parseServerEnv() {
  const parsed = serverEnvSchema.safeParse(process.env)
  if (!parsed.success) {
    throw new Error(`Invalid server environment variables: ${parsed.error.message}`)
  }
  return parsed.data
}

export const serverEnv = parseServerEnv()
