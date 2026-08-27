import { clientEnv } from '@/lib/env.client'
import { createUnsubscribeToken } from '@/lib/newsletter/unsubscribe-token'

export interface NewsletterEmail {
  subject: string
  html: string
  headers: Record<string, string>
}

export function buildNewsletterWelcomeEmail(email: string): NewsletterEmail {
  const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL
  const token = createUnsubscribeToken(email)
  const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
  const unsubscribeApiUrl = `${siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`

  return {
    subject: "You're on the list — Handball Press GH",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 20px;">Welcome to Handball Press GH</h1>
        <p>Thanks for subscribing. You'll get the week's biggest handball headlines from Ghana and beyond, straight to your inbox.</p>
        <p><a href="${siteUrl}">Visit the site</a></p>
        <p style="margin-top: 32px; color: #666; font-size: 12px;">
          <a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe</a> at any time.
        </p>
      </div>
    `,
    // RFC 8058 one-click unsubscribe: mailbox providers (Gmail, Yahoo, etc.)
    // render their own "Unsubscribe" affordance next to the sender and POST
    // here directly, without the subscriber ever opening the email.
    headers: {
      'List-Unsubscribe': `<${unsubscribeApiUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  }
}
