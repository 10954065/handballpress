import Link from 'next/link'
import type { ArticleCard as ArticleCardData } from '@/lib/public/queries'

interface TrendingListProps {
  articles: ArticleCardData[]
}

export function TrendingList({ articles }: TrendingListProps) {
  if (articles.length === 0) return null

  return (
    <ol className="flex flex-col gap-5">
      {articles.map((article, index) => (
        <li key={article.id} className="flex items-baseline gap-4">
          <span className="text-muted font-serif text-3xl leading-none font-bold tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="min-w-0">
            <p className="text-gold-dark text-xs font-bold tracking-[0.12em] uppercase">
              {article.category.name}
            </p>
            <h3 className="font-serif mt-0.5 text-base leading-snug font-semibold text-balance">
              <Link href={`/news/${article.slug}`} className="hover:text-blue transition-colors">
                {article.title}
              </Link>
            </h3>
          </div>
        </li>
      ))}
    </ol>
  )
}
