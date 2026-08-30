// Imports one WordPress.com post by slug, reusing the same idempotent
// upsert logic as migrate.ts (see that file for the general migration).
//
// Usage:
//   npx tsx scripts/wordpress-migration/import-single-post.ts <slug>
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local', quiet: true })

import { JSDOM } from 'jsdom'

// See migrate.ts for why a jsdom-backed global is required before
// htmlToArticleJson (via @tiptap/core's generateJSON) is ever called.
const globalDom = new JSDOM('<!doctype html><html><body></body></html>')
Object.assign(globalThis, {
  window: globalDom.window,
  document: globalDom.window.document,
  DOMParser: globalDom.window.DOMParser,
  Node: globalDom.window.Node,
  Element: globalDom.window.Element,
  HTMLElement: globalDom.window.HTMLElement,
})

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'
import { ArticleStatus } from '@/generated/prisma/enums'
import {
  articleJsonToSanitizedHtml,
  estimateReadingTimeMinutes,
  htmlToArticleJson,
} from '@/lib/articles/render'
import { fetchPostBySlug } from './wp-api-client'
import { rewriteContentImages } from './rewrite-images'
import { createTaxonomyUpserter } from './upsert-taxonomy'
import { createMediaResolver } from './upsert-media'
import { decodeHtmlEntities, stripHtml } from './text'

function legacyPathFor(postUrl: string): string {
  return new URL(postUrl).pathname.replace(/\/+$/, '')
}

async function uniqueSlug(db: PrismaClient, desiredSlug: string, wordpressPostId: string) {
  const existing = await db.article.findUnique({ where: { slug: desiredSlug } })
  if (!existing || existing.wordpressPostId === wordpressPostId) return desiredSlug
  return `${desiredSlug}-wp`
}

async function main() {
  const slug = process.argv[2]
  if (!slug) {
    console.error('Usage: npx tsx scripts/wordpress-migration/import-single-post.ts <slug>')
    process.exit(1)
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const db = new PrismaClient({ adapter })

  const { upsertCategory, upsertTag, upsertAuthor } = createTaxonomyUpserter(db)
  const resolveMedia = createMediaResolver(db, null)

  console.log(`Fetching post "${slug}" from handballpressgh.wordpress.com…`)
  const post = await fetchPostBySlug(slug)

  const categoryTerms = Object.values(post.categories)
  const tagTerms = [...Object.values(post.tags), ...categoryTerms.slice(1)]
  const [primaryCategory] = categoryTerms
  if (!primaryCategory) {
    throw new Error('post has no category')
  }

  const categoryId = await upsertCategory(primaryCategory)
  const tagIds = await Promise.all(tagTerms.map((term) => upsertTag(term)))
  const authorId = await upsertAuthor(post.author)

  const attachments = Object.values(post.attachments)
  const { html: rewrittenHtml } = await rewriteContentImages(
    post.content,
    attachments,
    resolveMedia
  )

  const contentJson = htmlToArticleJson(rewrittenHtml)
  const contentHtml = articleJsonToSanitizedHtml(contentJson)
  const readingTimeMinutes = estimateReadingTimeMinutes(contentJson)
  const title = decodeHtmlEntities(post.title)
  const excerpt = stripHtml(post.excerpt).slice(0, 500) || null

  let featuredImageId: string | null = null
  const featuredImageUrl = post.post_thumbnail?.URL ?? post.featured_image ?? null
  if (featuredImageUrl) {
    const attachment = attachments.find((entry) => entry.URL === featuredImageUrl)
    const resolved = await resolveMedia(featuredImageUrl, attachment)
    featuredImageId = resolved.mediaId
  }

  const wordpressPostId = String(post.ID)
  const articleSlug = await uniqueSlug(db, post.slug, wordpressPostId)

  const article = await db.article.upsert({
    where: { wordpressPostId },
    update: {
      title,
      slug: articleSlug,
      excerpt,
      contentJson,
      contentHtml,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(post.date),
      authorId,
      categoryId,
      featuredImageId,
      readingTimeMinutes,
      sourceUrl: post.URL,
    },
    create: {
      title,
      slug: articleSlug,
      excerpt,
      contentJson,
      contentHtml,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(post.date),
      authorId,
      categoryId,
      featuredImageId,
      readingTimeMinutes,
      wordpressPostId,
      sourceUrl: post.URL,
    },
  })

  await db.articleTag.deleteMany({ where: { articleId: article.id } })
  if (tagIds.length > 0) {
    await db.articleTag.createMany({
      data: [...new Set(tagIds)].map((tagId) => ({ articleId: article.id, tagId })),
      skipDuplicates: true,
    })
  }

  await db.redirect.upsert({
    where: { oldUrl: legacyPathFor(post.URL) },
    update: { newUrl: `/news/${articleSlug}` },
    create: { oldUrl: legacyPathFor(post.URL), newUrl: `/news/${articleSlug}` },
  })

  console.log(`Imported "${title}" -> /news/${articleSlug} (published ${post.date})`)

  await db.$disconnect()
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
