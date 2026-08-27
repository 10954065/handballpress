import type { MetadataRoute } from 'next'
import { clientEnv } from '@/lib/env.client'
import { getSitemapEntries } from '@/lib/public/queries'

// Content changes at most a few times a day for a site this size — hourly
// regeneration keeps the sitemap fresh without hitting the DB on every
// crawler request.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = clientEnv.NEXT_PUBLIC_SITE_URL
  const { articles, categories, tags, authors } = await getSitemapEntries()

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'hourly', priority: 1 },
    { url: `${base}/archive`, changeFrequency: 'daily', priority: 0.5 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.3 },
  ]

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${base}/news/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${base}/category/${category.slug}`,
    changeFrequency: 'daily',
    priority: 0.6,
  }))

  const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${base}/tag/${tag.slug}`,
    changeFrequency: 'weekly',
    priority: 0.4,
  }))

  const authorPages: MetadataRoute.Sitemap = authors.map((author) => ({
    url: `${base}/author/${author.slug}`,
    changeFrequency: 'weekly',
    priority: 0.4,
  }))

  return [...staticPages, ...articlePages, ...categoryPages, ...tagPages, ...authorPages]
}
