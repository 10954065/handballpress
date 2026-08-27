import type { Metadata } from 'next'
import {
  getCategoryBySlug,
  getFilterableAuthors,
  getNavCategories,
  getAuthorBySlug,
  searchArticles,
} from '@/lib/public/queries'
import { ArticleListing } from '@/components/public/ArticleListing'
import { SearchIcon } from '@/components/public/icons'

// Search results are thin, duplicate-prone content — keep the page itself
// crawlable (so links out of it get followed) but out of the index.
export const metadata: Metadata = { title: 'Search', robots: { index: false, follow: true } }

function paramToString(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value.trim() : ''
}

export default async function SearchPage({ searchParams }: PageProps<'/search'>) {
  const { q, page, category, author } = await searchParams
  const query = paramToString(q)
  const categorySlug = paramToString(category)
  const authorSlug = paramToString(author)
  const currentPage = Number(page) || 1

  const [categories, authors, selectedCategory, selectedAuthor] = await Promise.all([
    getNavCategories(),
    getFilterableAuthors(),
    categorySlug ? getCategoryBySlug(categorySlug) : null,
    authorSlug ? getAuthorBySlug(authorSlug) : null,
  ])

  const result = query
    ? await searchArticles(query, currentPage, {
        categoryId: selectedCategory?.id,
        authorId: selectedAuthor?.id,
      })
    : null

  const activeParams: Record<string, string> = { q: query }
  if (categorySlug) activeParams.category = categorySlug
  if (authorSlug) activeParams.author = authorSlug

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-4xl font-semibold">Search</h1>
      <form action="/search" method="get" className="mt-6">
        <div className="relative max-w-xl">
          <SearchIcon className="text-muted pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search articles, players, clubs…"
            autoFocus
            className="border-line bg-paper-raised focus-visible:ring-blue w-full rounded-sm border py-3 pr-4 pl-12 text-base outline-none focus-visible:ring-2"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted text-xs font-bold tracking-[0.1em] uppercase">
              Category
            </span>
            <select
              name="category"
              defaultValue={categorySlug}
              className="border-line bg-paper-raised focus-visible:ring-blue rounded-sm border px-3 py-2 text-sm outline-none focus-visible:ring-2"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted text-xs font-bold tracking-[0.1em] uppercase">Author</span>
            <select
              name="author"
              defaultValue={authorSlug}
              className="border-line bg-paper-raised focus-visible:ring-blue rounded-sm border px-3 py-2 text-sm outline-none focus-visible:ring-2"
            >
              <option value="">All authors</option>
              {authors.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="bg-navy hover:bg-blue-dark rounded-sm px-5 py-2 text-sm font-bold text-white transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      <div className="mt-10">
        {!query && <p className="text-muted">Enter a search term to find stories.</p>}
        {query && result && (
          <>
            <p className="text-muted mb-6 text-sm">
              {result.totalCount} result{result.totalCount === 1 ? '' : 's'} for &ldquo;{query}
              &rdquo;
              {selectedCategory && <> in {selectedCategory.name}</>}
              {selectedAuthor && <> by {selectedAuthor.name}</>}
            </p>
            <ArticleListing
              articles={result.articles}
              currentPage={currentPage}
              totalPages={result.totalPages}
              basePath="/search"
              searchParams={activeParams}
              emptyMessage={`No stories found for "${query}".`}
            />
          </>
        )}
      </div>
    </div>
  )
}
