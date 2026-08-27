// Idempotent WordPress -> CMS content migration.
//
// Usage:
//   npx tsx scripts/wordpress-migration/migrate.ts [--limit=N] [--dry-run]
//
// Safe to rerun: every write is keyed off a stable WordPress ID
// (wordpressPostId / wordpressCategoryId / wordpressTagId /
// wordpressAuthorId / wordpressAttachmentId), so a second run updates
// existing rows in place instead of duplicating them. Progress is also
// recorded per-post in MigrationRecord for a final report and so a
// crashed run can be diagnosed without re-reading server logs.
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local', quiet: true })

import { JSDOM } from 'jsdom'

// @tiptap/core's generateJSON parses HTML via ProseMirror's DOMParser,
// which reads `window`/`DOMParser` from the global scope — there is no way
// to inject a DOM instance directly, so a jsdom-backed global is required
// before render.ts's htmlToArticleJson is ever called. See render.ts and
// the ArticleImage.ts parseHTML fix from this same phase.
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
import { ArticleStatus, MigrationEntityType, MigrationStatus } from '@/generated/prisma/enums'
import {
  articleJsonToSanitizedHtml,
  estimateReadingTimeMinutes,
  htmlToArticleJson,
} from '@/lib/articles/render'
import { fetchAllPublishedPosts, type WpPost } from './wp-api-client'
import { rewriteContentImages } from './rewrite-images'
import { createTaxonomyUpserter } from './upsert-taxonomy'
import { createMediaResolver } from './upsert-media'
import { decodeHtmlEntities, stripHtml } from './text'

function getFlag(name: string): boolean {
  return process.argv.includes(`--${name}`)
}
function getArgNumber(name: string): number | undefined {
  const prefix = `--${name}=`
  const arg = process.argv.find((value) => value.startsWith(prefix))
  return arg ? Number(arg.slice(prefix.length)) : undefined
}

const DRY_RUN = getFlag('dry-run')
const LIMIT = getArgNumber('limit')

function legacyPathFor(postUrl: string): string {
  return new URL(postUrl).pathname.replace(/\/+$/, '')
}

async function uniqueSlug(
  db: PrismaClient,
  desiredSlug: string,
  wordpressPostId: string
): Promise<string> {
  const existing = await db.article.findUnique({ where: { slug: desiredSlug } })
  if (!existing || existing.wordpressPostId === wordpressPostId) return desiredSlug
  return `${desiredSlug}-wp`
}

interface MigrationResult {
  status: 'success' | 'skipped' | 'failed'
  errorMessage?: string
}

async function migratePost(
  db: PrismaClient,
  post: WpPost,
  deps: ReturnType<typeof createTaxonomyUpserter> & {
    resolveMedia: ReturnType<typeof createMediaResolver>
  }
): Promise<MigrationResult> {
  if (post.status !== 'publish') {
    return { status: 'skipped', errorMessage: `status is "${post.status}", not "publish"` }
  }

  const categoryTerms = Object.values(post.categories)
  const tagTerms = [...Object.values(post.tags), ...categoryTerms.slice(1)]
  const [primaryCategory] = categoryTerms
  if (!primaryCategory) {
    return { status: 'skipped', errorMessage: 'post has no category' }
  }

  const categoryId = await deps.upsertCategory(primaryCategory)
  const tagIds = await Promise.all(tagTerms.map((term) => deps.upsertTag(term)))
  const authorId = await deps.upsertAuthor(post.author)

  const attachments = Object.values(post.attachments)
  const { html: rewrittenHtml } = await rewriteContentImages(
    post.content,
    attachments,
    deps.resolveMedia
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
    const resolved = await deps.resolveMedia(featuredImageUrl, attachment)
    featuredImageId = resolved.mediaId
  }

  const wordpressPostId = String(post.ID)
  const slug = await uniqueSlug(db, post.slug, wordpressPostId)

  if (DRY_RUN) {
    return { status: 'success' }
  }

  const article = await db.article.upsert({
    where: { wordpressPostId },
    update: {
      title,
      slug,
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
      slug,
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
    update: { newUrl: `/news/${slug}` },
    create: { oldUrl: legacyPathFor(post.URL), newUrl: `/news/${slug}` },
  })

  return { status: 'success' }
}

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const db = new PrismaClient({ adapter })

  const taxonomy = createTaxonomyUpserter(db, DRY_RUN)
  const resolveMedia = createMediaResolver(db, null, DRY_RUN)

  console.log('Fetching posts from handballpressgh.wordpress.com…')
  let posts = await fetchAllPublishedPosts()
  if (LIMIT) posts = posts.slice(0, LIMIT)
  console.log(`Found ${posts.length} post(s) to process.${DRY_RUN ? ' (dry run — no writes)' : ''}`)

  let succeeded = 0
  let skipped = 0
  let failed = 0

  for (const [index, post] of posts.entries()) {
    const label = `[${index + 1}/${posts.length}] #${post.ID} "${post.title}"`
    try {
      const result = await migratePost(db, post, { ...taxonomy, resolveMedia })
      if (result.status === 'success') {
        succeeded++
        console.log(`${label} — ok`)
      } else {
        skipped++
        console.log(`${label} — skipped (${result.errorMessage})`)
      }
      if (!DRY_RUN) {
        await db.migrationRecord.upsert({
          where: {
            wordpressPostId_entityType: {
              wordpressPostId: String(post.ID),
              entityType: MigrationEntityType.ARTICLE,
            },
          },
          update: {
            status: result.status === 'success' ? MigrationStatus.SUCCESS : MigrationStatus.SKIPPED,
            errorMessage: result.errorMessage ?? null,
            sourceUrl: post.URL,
          },
          create: {
            wordpressPostId: String(post.ID),
            entityType: MigrationEntityType.ARTICLE,
            sourceUrl: post.URL,
            status: result.status === 'success' ? MigrationStatus.SUCCESS : MigrationStatus.SKIPPED,
            errorMessage: result.errorMessage ?? null,
          },
        })
      }
    } catch (error) {
      failed++
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`${label} — FAILED: ${errorMessage}`)
      if (!DRY_RUN) {
        await db.migrationRecord.upsert({
          where: {
            wordpressPostId_entityType: {
              wordpressPostId: String(post.ID),
              entityType: MigrationEntityType.ARTICLE,
            },
          },
          update: { status: MigrationStatus.FAILED, errorMessage, sourceUrl: post.URL },
          create: {
            wordpressPostId: String(post.ID),
            entityType: MigrationEntityType.ARTICLE,
            sourceUrl: post.URL,
            status: MigrationStatus.FAILED,
            errorMessage,
          },
        })
      }
    }
  }

  console.log('\n--- Migration summary ---')
  console.log(`Succeeded: ${succeeded}`)
  console.log(`Skipped:   ${skipped}`)
  console.log(`Failed:    ${failed}`)

  await db.$disconnect()
  if (failed > 0) process.exitCode = 1
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
