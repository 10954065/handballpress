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

export function MediaItem({ media, canDelete }: MediaItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [state, formAction, isPending] = useActionState(updateMediaMeta, initialState)

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="relative aspect-square overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900">
        <Image
          src={media.url}
          alt={media.altText ?? ''}
          fill
          sizes="(min-width: 768px) 20vw, 45vw"
          className="object-cover"
        />
      </div>
      <p className="text-xs text-neutral-500">
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
            className="rounded-md border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700 dark:bg-transparent"
          />
          <input
            name="caption"
            defaultValue={media.caption ?? ''}
            placeholder="Caption"
            className="rounded-md border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700 dark:bg-transparent"
          />
          <input
            name="credit"
            defaultValue={media.credit ?? ''}
            placeholder="Credit"
            className="rounded-md border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700 dark:bg-transparent"
          />
          {state.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="text-xs font-medium underline underline-offset-2"
            >
              {isPending ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-neutral-500"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs font-medium underline underline-offset-2"
          >
            Edit
          </button>
          {canDelete && (
            <form action={deleteMedia.bind(null, media.id)}>
              <button type="submit" className="text-xs text-red-600 dark:text-red-400">
                Delete
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
