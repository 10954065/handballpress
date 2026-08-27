import Link from 'next/link'
import Image from 'next/image'
import { after } from 'next/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { getCurrentUser, hasRole } from '@/lib/auth/rbac'
import { UserRole, ArticleStatus, AdPlacement } from '@/generated/prisma/enums'
import { AdSlot } from '@/components/public/AdSlot'
import { publishDueScheduledArticles } from '@/lib/articles/scheduling'
import { getRelatedArticles } from '@/lib/public/queries'
import { formatDate } from '@/lib/format'
import { Byline } from '@/components/public/Byline'
import { ArticleShare } from '@/components/public/ArticleShare'
import { ArticleBody } from '@/components/public/ArticleBody'
import { ArticleSidebar } from '@/components/public/ArticleSidebar'
import { MatchScoreboard } from '@/components/public/MatchScoreboard'
import { JsonLd } from '@/components/public/JsonLd'
import { buildBreadcrumbSchema, buildNewsArticleSchema } from '@/lib/structured-data'
import './article-body.css'

const articleInclude = {
  author: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
  featuredImage: true,
  matchReport: true,
} as const

export async function generateMetadata({ params }: PageProps<'/news/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const article = await db.article.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
      seoTitle: true,
      seoDescription: true,
      canonicalUrl: true,
      publishedAt: true,
      updatedAt: true,
      featuredImage: { select: { url: true } },
      ogImage: { select: { url: true } },
    },
  })
  if (!article) return {}

  const ogImageUrl = article.ogImage?.url ?? article.featuredImage?.url
  const title = article.seoTitle || article.title
  const description = article.seoDescription || article.excerpt || undefined

  return {
    title,
    description,
    alternates: { canonical: article.canonicalUrl || `/news/${slug}` },
    openGraph: {
      type: 'article',
      title,
      description,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
    },
    twitter: {
      card: ogImageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  }
}

export default async function ArticlePage({ params }: PageProps<'/news/[slug]'>) {
  const { slug } = await params
  let article = await db.article.findUnique({ where: { slug }, include: articleInclude })

  if (!article) notFound()

  // Targeted lazy publish: only sweep due SCHEDULED articles when the page
  // actually being viewed needs it, not on every request. See
  // src/lib/articles/scheduling.ts for why this exists alongside the cron.
  if (
    article.status === ArticleStatus.SCHEDULED &&
    article.scheduledFor &&
    article.scheduledFor <= new Date()
  ) {
    await publishDueScheduledArticles()
    article = await db.article.findUnique({ where: { slug }, include: articleInclude })
    if (!article) notFound()
  }

  // Unpublished articles are only viewable by signed-in CMS staff (acts as
  // the "preview" mechanism) — never exposed to anonymous visitors.
  if (article.status !== 'PUBLISHED') {
    const user = await getCurrentUser()
    if (!user || !hasRole(user.role, UserRole.AUTHOR)) notFound()
  } else {
    // Only real public reads count toward Trending — staff previewing an
    // unpublished draft above shouldn't inflate it. Fire-and-forget after
    // the response is sent, same pattern as ad impression counting.
    const articleId = article.id
    after(() =>
      db.article.update({ where: { id: articleId }, data: { viewCount: { increment: 1 } } })
    )
  }

  const relatedArticles = await getRelatedArticles(article.categoryId, article.id)

  return (
    <article className="pb-16">
      <JsonLd
        data={buildNewsArticleSchema({
          title: article.title,
          excerpt: article.excerpt,
          slug: article.slug,
          publishedAt: article.publishedAt,
          updatedAt: article.updatedAt,
          authorName: article.author.name,
          featuredImageUrl: article.featuredImage?.url ?? null,
        })}
      />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: article.category.name, path: `/category/${article.category.slug}` },
          { name: article.title, path: `/news/${article.slug}` },
        ])}
      />
      <header className="mx-auto max-w-3xl px-4 pt-10 pb-6 sm:px-6">
        {article.status !== 'PUBLISHED' && (
          <p className="mb-6 rounded bg-yellow-100 px-3 py-2 text-sm text-yellow-900">
            Preview — this article is not published ({article.status}).
          </p>
        )}
        <Link
          href={`/category/${article.category.slug}`}
          className="text-gold-dark text-xs font-bold tracking-[0.16em] uppercase hover:underline"
        >
          {article.category.name}
        </Link>
        <h1 className="mt-2 font-serif text-3xl leading-[1.08] font-semibold text-balance sm:text-4xl lg:text-5xl">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="text-ink-soft mt-4 text-xl leading-relaxed text-pretty">
            {article.excerpt}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <Byline
            author={article.author}
            publishedAt={article.publishedAt}
            readingTimeMinutes={article.readingTimeMinutes}
          />
          <ArticleShare path={`/news/${article.slug}`} title={article.title} />
        </div>
      </header>

      {article.featuredImage && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Image
            src={article.featuredImage.url}
            alt={article.featuredImage.altText ?? ''}
            width={article.featuredImage.width ?? 1600}
            height={article.featuredImage.height ?? 900}
            priority
            className="h-auto w-full rounded-sm"
          />
          {(article.featuredImage.caption || article.featuredImage.credit) && (
            <p className="text-muted mt-2 text-sm">
              {article.featuredImage.caption}
              {article.featuredImage.credit && (
                <span className="ml-2 text-xs tracking-wide uppercase">
                  {article.featuredImage.credit}
                </span>
              )}
            </p>
          )}
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 pt-2 sm:px-6">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-16">
          <div className="mx-auto w-full max-w-3xl lg:mx-0 lg:max-w-none">
            <AdSlot placement={AdPlacement.ARTICLE_TOP} className="mb-8" />

            {article.matchReport && (
              <MatchScoreboard
                competition={article.matchReport.competition}
                teamAName={article.matchReport.teamAName}
                teamAScore={article.matchReport.teamAScore}
                teamBName={article.matchReport.teamBName}
                teamBScore={article.matchReport.teamBScore}
                venue={article.matchReport.venue}
                matchDate={article.matchReport.matchDate}
              />
            )}

            <ArticleBody html={article.contentHtml} />

            <AdSlot placement={AdPlacement.ARTICLE_MIDDLE} className="mt-8" />

            {article.updatedAt &&
              article.publishedAt &&
              article.updatedAt > article.publishedAt && (
                <p className="text-muted border-line mt-8 border-t pt-4 text-xs">
                  Last updated {formatDate(article.updatedAt)}
                </p>
              )}

            <AdSlot placement={AdPlacement.ARTICLE_BOTTOM} className="mt-8" />
          </div>

          <aside className="mt-16 lg:mt-0">
            <ArticleSidebar
              relatedArticles={relatedArticles}
              excludeIds={[article.id, ...relatedArticles.map((related) => related.id)]}
            />
          </aside>
        </div>
      </div>
    </article>
  )
}
