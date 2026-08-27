import { clientEnv } from '@/lib/env.client'

export function buildNewsletterWelcomeEmail(): { subject: string; html: string } {
  const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL
  return {
    subject: "You're on the list — Handball Press GH",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 20px;">Welcome to Handball Press GH</h1>
        <p>Thanks for subscribing. You'll get the week's biggest handball headlines from Ghana and beyond, straight to your inbox.</p>
        <p><a href="${siteUrl}">Visit the site</a></p>
      </div>
    `,
  }
}
