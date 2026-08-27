import { clientEnv } from '@/lib/env.client'
import { getLatestArticlesForFeed } from '@/lib/public/queries'

const FEED_ITEM_LIMIT = 50

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const base = clientEnv.NEXT_PUBLIC_SITE_URL
  const articles = await getLatestArticlesForFeed(FEED_ITEM_LIMIT)

  const items = articles
    .map((article) => {
      const url = `${base}/news/${article.slug}`
      return `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${(article.publishedAt ?? new Date()).toUTCString()}</pubDate>
      <category>${escapeXml(article.category.name)}</category>
      <dc:creator>${escapeXml(article.author.name)}</dc:creator>
      ${article.excerpt ? `<description>${escapeXml(article.excerpt)}</description>` : ''}
    </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Handball Press GH</title>
    <link>${base}</link>
    <description>Play to the tune of development! Ghana handball news, match reports, interviews and features.</description>
    <language>en-gh</language>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  })
}
