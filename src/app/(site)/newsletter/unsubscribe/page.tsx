import type { Metadata } from 'next'
import { unsubscribeByToken } from '@/lib/newsletter/unsubscribe'

export const metadata: Metadata = { title: 'Unsubscribe', robots: { index: false, follow: false } }

interface UnsubscribePageProps {
  searchParams: Promise<{ email?: string; token?: string }>
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const { email, token } = await searchParams
  const result = await unsubscribeByToken(email ?? null, token ?? null)

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <p className="text-crimson text-xs font-bold tracking-[0.16em] uppercase">Newsletter</p>
      {result === 'unsubscribed' ? (
        <>
          <h1 className="mt-1 font-serif text-4xl font-semibold sm:text-5xl">
            You&apos;re unsubscribed
          </h1>
          <p className="text-ink-soft mt-6 leading-relaxed">
            {email} won&apos;t receive any more newsletter emails from Handball Press GH. You can
            resubscribe any time from the homepage.
          </p>
        </>
      ) : (
        <>
          <h1 className="mt-1 font-serif text-4xl font-semibold sm:text-5xl">Link not valid</h1>
          <p className="text-ink-soft mt-6 leading-relaxed">
            This unsubscribe link is invalid or has expired. If you&apos;d still like to stop
            receiving emails, contact us and we&apos;ll remove you directly.
          </p>
        </>
      )}
    </div>
  )
}
