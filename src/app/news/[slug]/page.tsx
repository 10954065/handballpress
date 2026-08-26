import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { getCurrentUser, hasRole } from '@/lib/auth/rbac'
import { UserRole, ArticleStatus } from '@/generated/prisma/enums'
import { publishDueScheduledArticles } from '@/lib/articles/scheduling'
import './article-body.css'

export async function generateMetadata({ params }: PageProps<'/news/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const article = await db.article.findUnique({ where: { slug } })
  if (!article) return {}
  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt || undefined,
  }
}

export default async function ArticlePage({ params }: PageProps<'/news/[slug]'>) {
  const { slug } = await params
  let article = await db.article.findUnique({
    where: { slug },
    include: { author: true, category: true, featuredImage: true },
  })

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
    article = await db.article.findUnique({
      where: { slug },
      include: { author: true, category: true, featuredImage: true },
    })
    if (!article) notFound()
  }

  // Unpublished articles are only viewable by signed-in CMS staff (acts as
  // the "preview" mechanism) — never exposed to anonymous visitors.
  if (article.status !== 'PUBLISHED') {
    const user = await getCurrentUser()
    if (!user || !hasRole(user.role, UserRole.AUTHOR)) notFound()
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      {article.status !== 'PUBLISHED' && (
        <p className="mb-6 rounded bg-yellow-100 px-3 py-2 text-sm text-yellow-900">
          Preview — this article is not published ({article.status}).
        </p>
      )}
      <p className="text-sm font-medium text-neutral-500">{article.category.name}</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-balance">{article.title}</h1>
      {article.excerpt && (
        <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">{article.excerpt}</p>
      )}
      <p className="mt-4 text-sm text-neutral-500">
        By {article.author.name}
        {article.publishedAt && ` · ${article.publishedAt.toLocaleDateString()}`}
        {article.readingTimeMinutes && ` · ${article.readingTimeMinutes} min read`}
      </p>
      {article.featuredImage && (
        <Image
          src={article.featuredImage.url}
          alt={article.featuredImage.altText ?? ''}
          width={article.featuredImage.width ?? 1200}
          height={article.featuredImage.height ?? 630}
          priority
          className="mt-6 h-auto w-full rounded-lg"
        />
      )}
      {/* contentHtml is sanitized at write time in articleJsonToSanitizedHtml
          (src/lib/articles/content.ts) against an allowlist matching the
          editor's schema exactly — never raw/unsanitized input. */}
      <div
        className="article-body mt-8"
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />
    </main>
  )
}
