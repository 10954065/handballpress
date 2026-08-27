'use server'

import { after } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { SubscriberStatus } from '@/generated/prisma/enums'
import { sendEmail } from '@/lib/email/resend'
import { buildNewsletterWelcomeEmail } from '@/lib/email/templates'
import { getClientIp } from '@/lib/http/client-ip'
import {
  isNewsletterSignupRateLimited,
  recordNewsletterSignupAttempt,
} from '@/lib/newsletter/rate-limit'

export interface NewsletterActionState {
  error?: string
  success?: boolean
}

const emailSchema = z.string().trim().toLowerCase().email()

export async function subscribeToNewsletter(
  _prevState: NewsletterActionState,
  formData: FormData
): Promise<NewsletterActionState> {
  const parsed = emailSchema.safeParse(formData.get('email'))
  if (!parsed.success) {
    return { error: 'Enter a valid email address.' }
  }
  const email = parsed.data
  const ipAddress = await getClientIp()

  if (await isNewsletterSignupRateLimited(ipAddress)) {
    return { error: 'Too many signups from this network. Try again later.' }
  }
  await recordNewsletterSignupAttempt(email, ipAddress)

  const existing = await db.newsletterSubscriber.findUnique({ where: { email } })
  if (existing?.status === SubscriberStatus.SUBSCRIBED) {
    return { success: true }
  }

  if (existing) {
    await db.newsletterSubscriber.update({
      where: { email },
      data: { status: SubscriberStatus.SUBSCRIBED, unsubscribedAt: null },
    })
  } else {
    await db.newsletterSubscriber.create({
      data: { email, source: 'website_footer' },
    })
  }

  // Best-effort and non-blocking: a missing/misconfigured email provider
  // (see sendEmail's contract) should never fail the signup itself, and
  // `after()` keeps the send from delaying the form response.
  after(async () => {
    const { subject, html, headers } = buildNewsletterWelcomeEmail(email)
    const result = await sendEmail({ to: email, subject, html, headers })
    if (!result.sent) {
      console.warn(`Newsletter welcome email not sent to ${email}: ${result.error}`)
    }
  })

  return { success: true }
}
