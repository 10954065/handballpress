'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  archiveArticle,
  deleteArticle,
  duplicateArticle,
  publishArticleNow,
  revertArticleToDraft,
} from '@/lib/articles/actions'

interface ArticleRowProps {
  article: {
    id: string
    title: string
    slug: string
    status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'
    categoryName: string
    authorName: string
    updatedAt: string
    scheduledFor: string | null
  }
  canPublish: boolean
}

export function ArticleRow({ article, canPublish }: ArticleRowProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function run(action: () => Promise<void>) {
    setError(null)
    startTransition(async () => {
      try {
        await action()
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : 'Action failed.')
      }
    })
  }

  return (
    <tr className="border-b border-neutral-100 align-top dark:border-neutral-900">
      <td className="py-2 pr-4">
        <p className="font-medium">{article.title}</p>
        <p className="text-xs text-neutral-500">/{article.slug}</p>
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </td>
      <td className="py-2 pr-4 text-neutral-500">{article.categoryName}</td>
      <td className="py-2 pr-4 text-neutral-500">{article.authorName}</td>
      <td className="py-2 pr-4">
        <span className="rounded-full border border-neutral-300 px-2 py-0.5 text-xs dark:border-neutral-700">
          {article.status}
          {article.status === 'SCHEDULED' && article.scheduledFor
            ? ` · ${new Date(article.scheduledFor).toLocaleString()}`
            : ''}
        </span>
      </td>
      <td className="py-2 pr-4 text-neutral-500">
        {new Date(article.updatedAt).toLocaleDateString()}
      </td>
      <td className="space-x-2 py-2 text-right text-xs whitespace-nowrap">
        <Link href={`/admin/articles/${article.id}/edit`} className="underline underline-offset-2">
          Edit
        </Link>
        {article.status === 'PUBLISHED' && (
          <Link
            href={`/news/${article.slug}`}
            target="_blank"
            className="underline underline-offset-2"
          >
            View
          </Link>
        )}
        {canPublish && article.status !== 'PUBLISHED' && article.status !== 'ARCHIVED' && (
          <button disabled={isPending} onClick={() => run(() => publishArticleNow(article.id))}>
            Publish
          </button>
        )}
        {canPublish && article.status === 'PUBLISHED' && (
          <button disabled={isPending} onClick={() => run(() => revertArticleToDraft(article.id))}>
            Unpublish
          </button>
        )}
        {canPublish && article.status !== 'ARCHIVED' && (
          <button disabled={isPending} onClick={() => run(() => archiveArticle(article.id))}>
            Archive
          </button>
        )}
        <button
          disabled={isPending}
          onClick={() => {
            setError(null)
            startTransition(async () => {
              try {
                const { id } = await duplicateArticle(article.id)
                router.push(`/admin/articles/${id}/edit`)
              } catch (actionError) {
                setError(actionError instanceof Error ? actionError.message : 'Duplicate failed.')
              }
            })
          }}
        >
          Duplicate
        </button>
        <button
          disabled={isPending}
          onClick={() => {
            if (window.confirm(`Delete "${article.title}"? This cannot be undone.`)) {
              run(() => deleteArticle(article.id))
            }
          }}
          className="text-red-600 dark:text-red-400"
        >
          Delete
        </button>
      </td>
    </tr>
  )
}
