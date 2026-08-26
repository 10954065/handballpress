import Link from 'next/link'
import { formatDate } from '@/lib/format'

interface BylineProps {
  author: { name: string; slug: string }
  publishedAt: Date | string | null
  readingTimeMinutes: number | null
  className?: string
}

export function Byline({ author, publishedAt, readingTimeMinutes, className }: BylineProps) {
  const date = formatDate(publishedAt)
  return (
    <p className={`text-muted flex flex-wrap items-center gap-x-1.5 text-sm ${className ?? ''}`}>
      <span>
        By{' '}
        <Link href={`/author/${author.slug}`} className="text-ink-soft font-medium hover:underline">
          {author.name}
        </Link>
      </span>
      {date && (
        <>
          <span aria-hidden="true">·</span>
          <span>{date}</span>
        </>
      )}
      {readingTimeMinutes && (
        <>
          <span aria-hidden="true">·</span>
          <span>{readingTimeMinutes} min read</span>
        </>
      )}
    </p>
  )
}
