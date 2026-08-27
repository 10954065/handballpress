import type { PrismaClient } from '@/generated/prisma/client'
import { slugify } from '@/lib/slug'
import { decodeHtmlEntities } from './text'
import type { WpAuthor, WpTerm } from './wp-api-client'

// Each upsert is keyed first by the stable WordPress numeric ID (so reruns
// never create duplicates), falling back to a slug match for the case
// where the row already exists from manual CMS use before migration ran —
// in which case we just backfill the wordpress*Id for future idempotency.

export function createTaxonomyUpserter(db: PrismaClient, dryRun = false) {
  const categoryCache = new Map<number, string>()
  const tagCache = new Map<number, string>()
  const authorCache = new Map<number, string>()

  async function upsertCategory(term: WpTerm): Promise<string> {
    const cached = categoryCache.get(term.ID)
    if (cached) return cached
    if (dryRun) {
      const id = `dry-category-${term.ID}`
      categoryCache.set(term.ID, id)
      return id
    }

    const wordpressCategoryId = String(term.ID)
    const existing = await db.category.findFirst({
      where: { OR: [{ wordpressCategoryId }, { slug: term.slug }] },
    })
    const category = existing
      ? await db.category.update({
          where: { id: existing.id },
          data: { name: decodeHtmlEntities(term.name), wordpressCategoryId },
        })
      : await db.category.create({
          data: { name: decodeHtmlEntities(term.name), slug: term.slug, wordpressCategoryId },
        })

    categoryCache.set(term.ID, category.id)
    return category.id
  }

  async function upsertTag(term: WpTerm): Promise<string> {
    const cached = tagCache.get(term.ID)
    if (cached) return cached
    if (dryRun) {
      const id = `dry-tag-${term.ID}`
      tagCache.set(term.ID, id)
      return id
    }

    const wordpressTagId = String(term.ID)
    const existing = await db.tag.findFirst({
      where: { OR: [{ wordpressTagId }, { slug: term.slug }] },
    })
    const tag = existing
      ? await db.tag.update({
          where: { id: existing.id },
          data: { name: decodeHtmlEntities(term.name), wordpressTagId },
        })
      : await db.tag.create({
          data: { name: decodeHtmlEntities(term.name), slug: term.slug, wordpressTagId },
        })

    tagCache.set(term.ID, tag.id)
    return tag.id
  }

  async function upsertAuthor(author: WpAuthor): Promise<string> {
    const cached = authorCache.get(author.ID)
    if (cached) return cached
    if (dryRun) {
      const id = `dry-author-${author.ID}`
      authorCache.set(author.ID, id)
      return id
    }

    const wordpressAuthorId = String(author.ID)
    const slug = slugify(author.nice_name) || slugify(author.name) || `author-${author.ID}`
    const existing = await db.authorProfile.findFirst({
      where: { OR: [{ wordpressAuthorId }, { slug }] },
    })
    const profile = existing
      ? await db.authorProfile.update({
          where: { id: existing.id },
          data: { name: decodeHtmlEntities(author.name), wordpressAuthorId },
        })
      : await db.authorProfile.create({
          data: {
            name: decodeHtmlEntities(author.name),
            slug,
            wordpressAuthorId,
            email: typeof author.email === 'string' ? author.email : null,
          },
        })

    authorCache.set(author.ID, profile.id)
    return profile.id
  }

  return { upsertCategory, upsertTag, upsertAuthor }
}
