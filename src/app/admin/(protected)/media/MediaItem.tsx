'use client'

import { useActionState, useState } from 'react'
import Image from 'next/image'
import { deleteMedia, updateMediaMeta, type MediaActionState } from '@/lib/media/actions'

interface MediaItemProps {
  media: {
    id: string
    url: string
    width: number | null
    height: number | null
    fileSizeBytes: number | null
    altText: string | null
    caption: string | null
    credit: string | null
    createdAt: string
  }
  canDelete: boolean
}

const initialState: MediaActionState = {}
const FIELD =
  'border-line bg-paper-raised focus-visible:ring-blue rounded-sm border px-2 py-1.5 text-xs outline-none focus-visible:ring-2'
const ACTION_BUTTON = 'text-ink-soft hover:text-blue text-xs font-semibold'

export function MediaItem({ media, canDelete }: MediaItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [state, formAction, isPending] = useActionState(updateMediaMeta, initialState)

  return (
    <div className="border-line bg-paper-raised flex flex-col gap-2 rounded-sm border p-3">
      <div className="bg-ink/[0.04] relative aspect-square overflow-hidden rounded-sm">
        <Image
          src={media.url}
          alt={media.altText ?? ''}
          fill
          sizes="(min-width: 768px) 20vw, 45vw"
          className="object-cover"
        />
      </div>
      <p className="text-muted text-xs">
        {media.width && media.height ? `${media.width}×${media.height} · ` : ''}
        {media.fileSizeBytes ? `${Math.round(media.fileSizeBytes / 1024)}KB` : ''}
      </p>

      {isEditing ? (
        <form action={formAction} className="flex flex-col gap-2">
          <input type="hidden" name="id" value={media.id} />
          <input
            name="altText"
            defaultValue={media.altText ?? ''}
            placeholder="Alt text"
            className={FIELD}
          />
          <input
            name="caption"
            defaultValue={media.caption ?? ''}
            placeholder="Caption"
            className={FIELD}
          />
          <input
            name="credit"
            defaultValue={media.credit ?? ''}
            placeholder="Credit"
            className={FIELD}
          />
          {state.error && <p className="text-error text-xs">{state.error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={isPending} className={ACTION_BUTTON}>
              {isPending ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-muted text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setIsEditing(true)} className={ACTION_BUTTON}>
            Edit
          </button>
          {canDelete && (
            <form action={deleteMedia.bind(null, media.id)}>
              <button type="submit" className="text-error text-xs font-semibold hover:underline">
                Delete
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
