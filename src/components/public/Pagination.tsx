import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
  searchParams?: Record<string, string>
}

function pageHref(basePath: string, page: number, searchParams?: Record<string, string>): string {
  const params = new URLSearchParams(searchParams)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

export function Pagination({ currentPage, totalPages, basePath, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null

  const prevPage = currentPage - 1
  const nextPage = currentPage + 1

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-between gap-4">
      {prevPage >= 1 ? (
        <Link
          href={pageHref(basePath, prevPage, searchParams)}
          className="border-line text-ink-soft hover:border-crimson hover:text-crimson rounded-sm border px-4 py-2 text-sm font-medium"
        >
          ← Newer
        </Link>
      ) : (
        <span />
      )}
      <p className="text-muted text-sm">
        Page {currentPage} of {totalPages}
      </p>
      {nextPage <= totalPages ? (
        <Link
          href={pageHref(basePath, nextPage, searchParams)}
          className="border-line text-ink-soft hover:border-crimson hover:text-crimson rounded-sm border px-4 py-2 text-sm font-medium"
        >
          Older →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
