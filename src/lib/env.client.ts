import { z } from 'zod'

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
})

function parseClientEnv() {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
  })
  if (!parsed.success) {
    throw new Error(`Invalid client environment variables: ${parsed.error.message}`)
  }
  return parsed.data
}

export const clientEnv = parseClientEnv()
