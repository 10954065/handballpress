'use client'

import { useTransition } from 'react'
import { deleteTag } from '@/lib/tags/actions'

export function TagChip({ tag }: { tag: { id: string; name: string; articleCount: number } }) {
  const [isDeleting, startDelete] = useTransition()

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1 text-sm dark:border-neutral-800">
      {tag.name}
      <span className="text-xs text-neutral-500">{tag.articleCount}</span>
      <button
        type="button"
        disabled={isDeleting}
        onClick={() => startDelete(() => deleteTag(tag.id))}
        className="text-neutral-400 hover:text-red-600 disabled:opacity-60 dark:hover:text-red-400"
        aria-label={`Delete tag ${tag.name}`}
      >
        ×
      </button>
    </span>
  )
}
