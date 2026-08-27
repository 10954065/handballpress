import type { Metadata } from 'next'
import { requireRole } from '@/lib/auth/rbac'
import { UserRole, SubscriberStatus } from '@/generated/prisma/enums'
import { db } from '@/lib/db'
import { SubscriberRow } from './SubscriberRow'

export const metadata: Metadata = { title: 'Newsletter' }

const SUBSCRIBER_DISPLAY_LIMIT = 200

export default async function NewsletterPage() {
  await requireRole(UserRole.EDITOR)

  const [subscribedCount, unsubscribedCount, subscribers] = await Promise.all([
    db.newsletterSubscriber.count({ where: { status: SubscriberStatus.SUBSCRIBED } }),
    db.newsletterSubscriber.count({ where: { status: SubscriberStatus.UNSUBSCRIBED } }),
    db.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' },
      take: SUBSCRIBER_DISPLAY_LIMIT,
    }),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Newsletter</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Sign-ups are captured from the site&apos;s footer form. Sending campaigns isn&apos;t wired
          up yet — see RESEND_API_KEY in the environment for the email provider this is built
          against.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-xs tracking-wide text-neutral-500 uppercase">Subscribed</p>
          <p className="mt-1 text-2xl font-semibold">{subscribedCount}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-xs tracking-wide text-neutral-500 uppercase">Unsubscribed</p>
          <p className="mt-1 text-2xl font-semibold">{unsubscribedCount}</p>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500 uppercase dark:border-neutral-800">
            <th className="pb-2 font-medium">Email</th>
            <th className="pb-2 font-medium">Source</th>
            <th className="pb-2 font-medium">Since</th>
            <th className="pb-2 font-medium">Status</th>
            <th className="pb-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {subscribers.map((subscriber) => (
            <SubscriberRow key={subscriber.id} subscriber={subscriber} />
          ))}
        </tbody>
      </table>
      {subscribers.length === 0 && <p className="text-sm text-neutral-500">No subscribers yet.</p>}
      {subscribers.length === SUBSCRIBER_DISPLAY_LIMIT && (
        <p className="text-xs text-neutral-500">
          Showing the most recent {SUBSCRIBER_DISPLAY_LIMIT}.
        </p>
      )}
    </div>
  )
}
