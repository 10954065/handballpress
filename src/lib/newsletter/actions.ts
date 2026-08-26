'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { SubscriberStatus } from '@/generated/prisma/enums'

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

  return { success: true }
}
