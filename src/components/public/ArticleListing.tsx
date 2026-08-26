import type { ArticleCard as ArticleCardData } from '@/lib/public/queries'
import { ArticleCard } from './ArticleCard'
import { Pagination } from './Pagination'

interface ArticleListingProps {
  articles: ArticleCardData[]
  currentPage: number
  totalPages: number
  basePath: string
  searchParams?: Record<string, string>
  emptyMessage?: string
}

export function ArticleListing({
  articles,
  currentPage,
  totalPages,
  basePath,
  searchParams,
  emptyMessage = 'No stories here yet — check back soon.',
}: ArticleListingProps) {
  if (articles.length === 0) {
    return (
      <p className="border-line text-muted rounded-sm border border-dashed px-6 py-16 text-center">
        {emptyMessage}
      </p>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} variant="secondary" />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={basePath}
        searchParams={searchParams}
      />
    </>
  )
}
