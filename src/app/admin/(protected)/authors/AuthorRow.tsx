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
      <div className="border-line bg-paper-raised rounded-sm border p-4">
        <AuthorForm author={author} onDone={() => setIsEditing(false)} />
      </div>
    )
  }

  return (
    <div className="border-line bg-paper-raised flex items-center gap-4 rounded-sm border p-4">
      <div className="bg-ink/[0.06] relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
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
        <p className="text-muted text-xs">
          /{author.slug} · {author.articleCount} article{author.articleCount === 1 ? '' : 's'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="text-ink-soft hover:text-blue text-xs font-semibold"
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
        className="text-error text-xs font-semibold hover:underline disabled:opacity-60"
      >
        Delete
      </button>
      {deleteError && <p className="text-error text-xs">{deleteError}</p>}
    </div>
  )
}
