'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { createSession, generateSessionToken, setSessionCookie } from '@/lib/auth/session'
import { isLoginRateLimited, recordLoginFailure, recordLoginSuccess } from '@/lib/auth/rate-limit'
import { getClientIp } from '@/lib/http/client-ip'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export interface LoginActionState {
  error?: string
}

async function getUserAgent(): Promise<string | undefined> {
  return (await headers()).get('user-agent') ?? undefined
}

// Computed once per server instance and reused so a lookup for a
// nonexistent email still pays a real Argon2 verify — timing stays
// indistinguishable from a wrong-password attempt against a real account.
let dummyHashPromise: Promise<string> | null = null
function getDummyHash(): Promise<string> {
  if (!dummyHashPromise) dummyHashPromise = hashPassword('not-a-real-password')
  return dummyHashPromise
}

export async function login(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { error: 'Enter a valid email and password.' }
  }

  const { email, password } = parsed.data
  const ipAddress = await getClientIp()

  if (await isLoginRateLimited(email, ipAddress)) {
    return { error: 'Too many failed attempts. Try again in 15 minutes.' }
  }

  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })
  const isPasswordValid = await verifyPassword(
    user?.passwordHash ?? (await getDummyHash()),
    password
  )

  if (!user || !user.isActive || !isPasswordValid) {
    await recordLoginFailure(email, ipAddress)
    return { error: 'Invalid email or password.' }
  }

  const token = generateSessionToken()
  const { expiresAt } = await createSession(token, user.id, {
    ipAddress,
    userAgent: await getUserAgent(),
  })
  await setSessionCookie(token, expiresAt)
  await recordLoginSuccess(user.id, ipAddress)
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

  redirect('/admin')
}
