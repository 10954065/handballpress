'use client'

import { useTransition } from 'react'
import { setSubscriberStatus } from '@/lib/newsletter/admin-actions'
import { SubscriberStatus } from '@/generated/prisma/enums'
import { formatDate } from '@/lib/format'

interface SubscriberRowProps {
  subscriber: {
    id: string
    email: string
    status: SubscriberStatus
    source: string | null
    subscribedAt: Date
  }
}

export function SubscriberRow({ subscriber }: SubscriberRowProps) {
  const [isPending, startTransition] = useTransition()
  const isSubscribed = subscriber.status === SubscriberStatus.SUBSCRIBED

  return (
    <tr className="border-line border-b last:border-0">
      <td className="px-4 py-3">{subscriber.email}</td>
      <td className="text-ink-soft px-4 py-3">{subscriber.source ?? '—'}</td>
      <td className="text-ink-soft px-4 py-3">{formatDate(subscriber.subscribedAt)}</td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold tracking-wide uppercase ${
            isSubscribed ? 'bg-success/10 text-success' : 'bg-ink/[0.06] text-muted'
          }`}
        >
          {subscriber.status}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(() =>
              setSubscriberStatus(
                subscriber.id,
                isSubscribed ? SubscriberStatus.UNSUBSCRIBED : SubscriberStatus.SUBSCRIBED
              )
            )
          }
          className="text-ink-soft hover:text-blue text-xs font-semibold disabled:opacity-60"
        >
          {isSubscribed ? 'Unsubscribe' : 'Resubscribe'}
        </button>
      </td>
    </tr>
  )
}
