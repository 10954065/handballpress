import type { Metadata } from 'next'
import { searchArticles } from '@/lib/public/queries'
import { ArticleListing } from '@/components/public/ArticleListing'
import { SearchIcon } from '@/components/public/icons'

// Search results are thin, duplicate-prone content — keep the page itself
// crawlable (so links out of it get followed) but out of the index.
export const metadata: Metadata = { title: 'Search', robots: { index: false, follow: true } }

export default async function SearchPage({ searchParams }: PageProps<'/search'>) {
  const { q, page } = await searchParams
  const query = typeof q === 'string' ? q.trim() : ''
  const currentPage = Number(page) || 1

  const result = query ? await searchArticles(query, currentPage) : null

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-4xl font-semibold">Search</h1>
      <form action="/search" method="get" className="relative mt-6 max-w-xl">
        <SearchIcon className="text-muted pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2" />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search articles, players, clubs…"
          autoFocus
          className="border-line bg-paper-raised focus-visible:ring-blue w-full rounded-sm border py-3 pr-4 pl-12 text-base outline-none focus-visible:ring-2"
        />
      </form>

      <div className="mt-10">
        {!query && <p className="text-muted">Enter a search term to find stories.</p>}
        {query && result && (
          <>
            <p className="text-muted mb-6 text-sm">
              {result.totalCount} result{result.totalCount === 1 ? '' : 's'} for &ldquo;{query}
              &rdquo;
            </p>
            <ArticleListing
              articles={result.articles}
              currentPage={currentPage}
              totalPages={result.totalPages}
              basePath="/search"
              searchParams={{ q: query }}
              emptyMessage={`No stories found for "${query}".`}
            />
          </>
        )}
      </div>
    </div>
  )
}
