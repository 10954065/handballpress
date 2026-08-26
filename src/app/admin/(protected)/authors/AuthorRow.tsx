'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { deleteAuthor } from '@/lib/authors/actions'
import { AuthorForm } from './AuthorForm'

interface AuthorRowProps {
  author: {
    id: string
    name: string
    slug: string
    bio: string | null
    email: string | null
    photoUrl: string | null
    articleCount: number
  }
}

export function AuthorRow({ author }: AuthorRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, startDelete] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  if (isEditing) {
    return (
      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <AuthorForm author={author} onDone={() => setIsEditing(false)} />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-900">
        {author.photoUrl && (
          <Image
            src={author.photoUrl}
            alt={author.name}
            fill
            sizes="48px"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex-1">
        <p className="font-medium">{author.name}</p>
        <p className="text-xs text-neutral-500">
          /{author.slug} · {author.articleCount} article{author.articleCount === 1 ? '' : 's'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="text-xs underline underline-offset-2"
      >
        Edit
      </button>
      <button
        type="button"
        disabled={isDeleting}
        onClick={() => {
          setDeleteError(null)
          startDelete(async () => {
            try {
              await deleteAuthor(author.id)
            } catch (error) {
              setDeleteError(error instanceof Error ? error.message : 'Could not delete author.')
            }
          })
        }}
        className="text-xs text-red-600 disabled:opacity-60 dark:text-red-400"
      >
        Delete
      </button>
      {deleteError && <p className="text-xs text-red-600 dark:text-red-400">{deleteError}</p>}
    </div>
  )
}
