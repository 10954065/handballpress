'use client'

import { useState, useTransition } from 'react'
import { deleteAdvertisement, toggleAdvertisementActive } from '@/lib/advertisements/actions'
import { AdvertisementForm } from './AdvertisementForm'
import type { AdPlacement } from '@/generated/prisma/enums'
import { formatDate } from '@/lib/format'

interface AdvertisementRowProps {
  advertisement: {
    id: string
    name: string
    placement: AdPlacement
    imageUrl: string | null
    linkUrl: string | null
    embedHtml: string | null
    startDate: Date
    endDate: Date
    isActive: boolean
    impressions: number
    clicks: number
  }
}

export function AdvertisementRow({ advertisement }: AdvertisementRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (isEditing) {
    return (
      <tr>
        <td colSpan={7} className="py-3">
          <AdvertisementForm advertisement={advertisement} onDone={() => setIsEditing(false)} />
        </td>
      </tr>
    )
  }

  const now = new Date()
  const isExpired = advertisement.endDate < now
  const isScheduled = advertisement.startDate > now

  return (
    <tr className="border-line border-b last:border-0">
      <td className="px-4 py-3 font-medium">{advertisement.name}</td>
      <td className="text-ink-soft px-4 py-3">{advertisement.placement.replaceAll('_', ' ')}</td>
      <td className="text-ink-soft px-4 py-3">
        {formatDate(advertisement.startDate)} – {formatDate(advertisement.endDate)}
        {isExpired && <span className="text-error ml-1">(expired)</span>}
        {isScheduled && <span className="text-blue ml-1">(scheduled)</span>}
      </td>
      <td className="text-ink-soft px-4 py-3">{advertisement.impressions}</td>
      <td className="text-ink-soft px-4 py-3">{advertisement.clicks}</td>
      <td className="px-4 py-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              setError(null)
              try {
                await toggleAdvertisementActive(advertisement.id, !advertisement.isActive)
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Could not update.')
              }
            })
          }
          className={`rounded-full px-2.5 py-1 text-xs font-bold tracking-wide uppercase ${
            advertisement.isActive ? 'bg-success/10 text-success' : 'bg-ink/[0.06] text-muted'
          }`}
        >
          {advertisement.isActive ? 'Active' : 'Paused'}
        </button>
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-ink-soft hover:text-blue text-xs font-semibold"
          >
            Edit
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                setError(null)
                try {
                  await deleteAdvertisement(advertisement.id)
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Could not delete.')
                }
              })
            }
            className="text-error text-xs font-semibold hover:underline disabled:opacity-60"
          >
            Delete
          </button>
        </div>
        {error && <p className="text-error mt-1 text-xs">{error}</p>}
      </td>
    </tr>
  )
}
