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
    <tr className="border-b border-neutral-100 dark:border-neutral-900">
      <td className="py-2 pr-4">{subscriber.email}</td>
      <td className="py-2 pr-4 text-neutral-500">{subscriber.source ?? '—'}</td>
      <td className="py-2 pr-4 text-neutral-500">{formatDate(subscriber.subscribedAt)}</td>
      <td className="py-2 pr-4">
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${
            isSubscribed
              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
              : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
          }`}
        >
          {subscriber.status}
        </span>
      </td>
      <td className="py-2 text-right">
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
          className="text-xs underline underline-offset-2 disabled:opacity-60"
        >
          {isSubscribed ? 'Unsubscribe' : 'Resubscribe'}
        </button>
      </td>
    </tr>
  )
}
