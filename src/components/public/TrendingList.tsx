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
        <li
          key={article.id}
          className="group flex items-start gap-4 transition-transform duration-200 hover:translate-x-1"
        >
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-full font-serif text-sm font-bold text-white shadow-sm ${
              index === 0
                ? 'from-gold to-gold-dark bg-gradient-to-br text-navy'
                : 'from-navy to-blue bg-gradient-to-br'
            }`}
          >
            {index + 1}
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
