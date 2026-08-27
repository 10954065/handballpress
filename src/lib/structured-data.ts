import { clientEnv } from '@/lib/env.client'

const SITE_NAME = 'Handball Press GH'

function siteUrl(path = ''): string {
  return `${clientEnv.NEXT_PUBLIC_SITE_URL}${path}`
}

export function buildOrganizationSchema() {
  return {
    '@type': 'Organization',
    name: SITE_NAME,
    url: siteUrl(),
  }
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: siteUrl(),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: siteUrl('/search?q={search_term_string}'),
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

interface ArticleSchemaInput {
  title: string
  excerpt: string | null
  slug: string
  publishedAt: Date | null
  updatedAt: Date
  authorName: string
  featuredImageUrl: string | null
}

export function buildNewsArticleSchema(article: ArticleSchemaInput) {
  const url = siteUrl(`/news/${article.slug}`)
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt ?? undefined,
    image: article.featuredImageUrl ? [article.featuredImageUrl] : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { '@type': 'Person', name: article.authorName },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }
}

export function buildBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: siteUrl(item.path),
    })),
  }
}
