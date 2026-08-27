import 'server-only'
import { Resend } from 'resend'
import { serverEnv } from '@/lib/env.server'

let client: Resend | null = null

function getClient(): Resend | null {
  if (!serverEnv.RESEND_API_KEY) return null
  client ??= new Resend(serverEnv.RESEND_API_KEY)
  return client
}

export interface SendEmailInput {
  to: string
  subject: string
  html: string
}

export interface SendEmailResult {
  sent: boolean
  error?: string
}

// Best-effort by design: RESEND_API_KEY/EMAIL_FROM are optional env vars
// (see env.server.ts) since this newsroom may not have a Resend account
// provisioned yet. Callers should treat a failed send as non-fatal for
// anything that isn't itself an email-sending feature — e.g. a newsletter
// signup should still succeed even if the welcome email can't go out.
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const resend = getClient()
  if (!resend || !serverEnv.EMAIL_FROM) {
    return {
      sent: false,
      error: 'Email provider not configured (RESEND_API_KEY/EMAIL_FROM unset).',
    }
  }

  const result = await resend.emails.send({
    from: serverEnv.EMAIL_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
  })

  if (result.error) {
    return { sent: false, error: result.error.message }
  }
  return { sent: true }
}
