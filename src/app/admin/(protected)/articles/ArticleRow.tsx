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
import { StatusBadge } from './StatusBadge'

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

const ACTION_BUTTON = 'text-ink-soft hover:text-blue text-xs font-semibold disabled:opacity-50'

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
    <tr className="border-line border-b align-top last:border-0">
      <td className="px-4 py-3">
        <Link
          href={`/admin/articles/${article.id}/edit`}
          className="hover:text-blue font-medium transition-colors"
        >
          {article.title}
        </Link>
        <p className="text-muted mt-0.5 text-xs">/{article.slug}</p>
        {error && <p className="text-error mt-1 text-xs">{error}</p>}
      </td>
      <td className="text-ink-soft px-4 py-3">{article.categoryName}</td>
      <td className="text-ink-soft px-4 py-3">{article.authorName}</td>
      <td className="px-4 py-3">
        <StatusBadge status={article.status} scheduledFor={article.scheduledFor} />
      </td>
      <td className="text-muted px-4 py-3">{new Date(article.updatedAt).toLocaleDateString()}</td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-3">
          <Link href={`/admin/articles/${article.id}/edit`} className={ACTION_BUTTON}>
            Edit
          </Link>
          {article.status === 'PUBLISHED' && (
            <Link href={`/news/${article.slug}`} target="_blank" className={ACTION_BUTTON}>
              View
            </Link>
          )}
          {canPublish && article.status !== 'PUBLISHED' && article.status !== 'ARCHIVED' && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(() => publishArticleNow(article.id))}
              className={ACTION_BUTTON}
            >
              Publish
            </button>
          )}
          {canPublish && article.status === 'PUBLISHED' && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(() => revertArticleToDraft(article.id))}
              className={ACTION_BUTTON}
            >
              Unpublish
            </button>
          )}
          {canPublish && article.status !== 'ARCHIVED' && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(() => archiveArticle(article.id))}
              className={ACTION_BUTTON}
            >
              Archive
            </button>
          )}
          <button
            type="button"
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
            className={ACTION_BUTTON}
          >
            Duplicate
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (window.confirm(`Delete "${article.title}"? This cannot be undone.`)) {
                run(() => deleteArticle(article.id))
              }
            }}
            className="text-error text-xs font-semibold hover:underline disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}
