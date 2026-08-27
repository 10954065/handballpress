import { AdPlacement } from '@/generated/prisma/enums'
import type { ArticleCard as ArticleCardData } from '@/lib/public/queries'
import { getTrendingArticles } from '@/lib/public/queries'
import { AdSlot } from './AdSlot'
import { ArticleCard } from './ArticleCard'
import { NewsletterForm } from './NewsletterForm'
import { TrendingList } from './TrendingList'

interface ArticleSidebarProps {
  relatedArticles: ArticleCardData[]
  excludeIds: string[]
}

export async function ArticleSidebar({ relatedArticles, excludeIds }: ArticleSidebarProps) {
  const trending = await getTrendingArticles(4, excludeIds)

  return (
    <div className="flex flex-col gap-10 lg:sticky lg:top-24">
      {relatedArticles.length > 0 && (
        <div>
          <h2 className="border-gold text-ink mb-5 border-b-2 pb-3 text-lg font-bold tracking-tight">
            Related Stories
          </h2>
          <div className="flex flex-col gap-6">
            {relatedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        </div>
      )}

      {trending.length > 0 && (
        <div>
          <h2 className="border-gold text-ink mb-5 border-b-2 pb-3 text-lg font-bold tracking-tight">
            Trending Now
          </h2>
          <TrendingList articles={trending} />
        </div>
      )}

      <AdSlot placement={AdPlacement.SIDEBAR} />

      <div className="bg-navy px-6 py-8 text-white">
        <h2 className="font-serif text-xl font-semibold">Stay in the game</h2>
        <p className="mt-2 text-sm text-white/70">
          Handball news, match reports and interviews — straight to your inbox.
        </p>
        <NewsletterForm className="mt-5" />
      </div>
    </div>
  )
}
