'use client'

import { useTransition } from 'react'
import { deleteTag } from '@/lib/tags/actions'

export function TagChip({ tag }: { tag: { id: string; name: string; articleCount: number } }) {
  const [isDeleting, startDelete] = useTransition()

  return (
    <span className="border-line bg-paper-raised inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
      {tag.name}
      <span className="text-muted text-xs">{tag.articleCount}</span>
      <button
        type="button"
        disabled={isDeleting}
        onClick={() => startDelete(() => deleteTag(tag.id))}
        className="text-faint hover:text-error disabled:opacity-60"
        aria-label={`Delete tag ${tag.name}`}
      >
        ×
      </button>
    </span>
  )
}
