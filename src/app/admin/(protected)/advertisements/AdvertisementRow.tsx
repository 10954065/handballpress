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
    <tr className="border-b border-neutral-100 dark:border-neutral-900">
      <td className="py-2 pr-4 font-medium">{advertisement.name}</td>
      <td className="py-2 pr-4 text-neutral-500">{advertisement.placement.replaceAll('_', ' ')}</td>
      <td className="py-2 pr-4 text-neutral-500">
        {formatDate(advertisement.startDate)} – {formatDate(advertisement.endDate)}
        {isExpired && <span className="ml-1 text-red-500">(expired)</span>}
        {isScheduled && <span className="ml-1 text-blue-500">(scheduled)</span>}
      </td>
      <td className="py-2 pr-4 text-neutral-500">{advertisement.impressions}</td>
      <td className="py-2 pr-4 text-neutral-500">{advertisement.clicks}</td>
      <td className="py-2 pr-4">
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
          className={`rounded px-2 py-0.5 text-xs font-medium ${
            advertisement.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
              : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
          }`}
        >
          {advertisement.isActive ? 'Active' : 'Paused'}
        </button>
      </td>
      <td className="py-2 text-right">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="mr-3 text-xs underline underline-offset-2"
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
          className="text-xs text-red-600 disabled:opacity-60 dark:text-red-400"
        >
          Delete
        </button>
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </td>
    </tr>
  )
}
