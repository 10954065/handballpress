import type { Metadata } from 'next'
import { requireRole } from '@/lib/auth/rbac'
import { UserRole, SubscriberStatus } from '@/generated/prisma/enums'
import { db } from '@/lib/db'
import { SubscriberRow } from './SubscriberRow'
import { EmptyState } from '@/components/admin/EmptyState'
import { NewsletterIcon } from '@/components/admin/icons'

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
        <p className="text-gold-dark text-xs font-bold tracking-[0.16em] uppercase">Growth</p>
        <h1 className="text-ink mt-1 font-serif text-3xl font-semibold">Newsletter</h1>
        <p className="text-muted mt-2 max-w-2xl text-sm">
          Sign-ups are captured from the site&apos;s footer form. Sending campaigns isn&apos;t wired
          up yet — see RESEND_API_KEY in the environment for the email provider this is built
          against.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="border-line bg-paper-raised rounded-sm border p-4">
          <p className="text-muted text-xs font-medium tracking-wide uppercase">Subscribed</p>
          <p className="text-ink mt-1 text-2xl font-bold tabular-nums">{subscribedCount}</p>
        </div>
        <div className="border-line bg-paper-raised rounded-sm border p-4">
          <p className="text-muted text-xs font-medium tracking-wide uppercase">Unsubscribed</p>
          <p className="text-ink mt-1 text-2xl font-bold tabular-nums">{unsubscribedCount}</p>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <EmptyState
          icon={NewsletterIcon}
          title="No subscribers yet"
          description="Sign-ups from the site's footer form will appear here."
        />
      ) : (
        <div className="border-line bg-paper-raised overflow-x-auto rounded-sm border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-line text-muted border-b text-left text-xs uppercase">
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Since</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <SubscriberRow key={subscriber.id} subscriber={subscriber} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {subscribers.length === SUBSCRIBER_DISPLAY_LIMIT && (
        <p className="text-muted text-xs">Showing the most recent {SUBSCRIBER_DISPLAY_LIMIT}.</p>
      )}
    </div>
  )
}
