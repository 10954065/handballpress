import 'server-only'
import { db } from '@/lib/db'
import { ArticleStatus, type AdPlacement } from '@/generated/prisma/enums'

export const ARTICLES_PER_PAGE = 12

const articleCardSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  publishedAt: true,
  readingTimeMinutes: true,
  featuredImage: {
    select: { url: true, width: true, height: true, altText: true },
  },
  category: { select: { name: true, slug: true } },
  author: { select: { name: true, slug: true } },
} as const

export type ArticleCard = NonNullable<
  Awaited<ReturnType<typeof db.article.findFirst<{ select: typeof articleCardSelect }>>>
>

const publishedWhere = { status: ArticleStatus.PUBLISHED } as const

export async function getHomepageFeed() {
  const [hero, rest, breakingNews] = await Promise.all([
    db.article.findFirst({
      where: publishedWhere,
      orderBy: { publishedAt: 'desc' },
      select: articleCardSelect,
    }),
    db.article.findMany({
      where: publishedWhere,
      orderBy: { publishedAt: 'desc' },
      skip: 1,
      take: 13,
      select: articleCardSelect,
    }),
    getActiveBreakingNews(),
  ])

  const [secondary, latest] = [rest.slice(0, 4), rest.slice(4)]

  // Everything already shown above the fold is excluded from Trending and
  // the category rails below — without this, a thin content window (a
  // handful of published articles in a given category) means the same
  // story reappears three times on one homepage load.
  const shownIds = [hero?.id, ...rest.map((a) => a.id)].filter((id): id is string => Boolean(id))

  const [trending, categories] = await Promise.all([
    getTrendingArticles(5, shownIds),
    db.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        articles: {
          where: { ...publishedWhere, id: { notIn: shownIds } },
          orderBy: { publishedAt: 'desc' },
          take: 4,
          select: articleCardSelect,
        },
      },
    }),
  ])

  const categoryRails = categories.filter((category) => category.articles.length > 0)

  return { hero, secondary, latest, categoryRails, trending, breakingNews }
}

export async function getTrendingArticles(limit: number, excludeIds: string[] = []) {
  return db.article.findMany({
    where: { ...publishedWhere, id: { notIn: excludeIds }, viewCount: { gt: 0 } },
    orderBy: { viewCount: 'desc' },
    take: limit,
    select: articleCardSelect,
  })
}

export async function getActiveBreakingNews() {
  const now = new Date()
  return db.breakingNewsItem.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 8,
  })
}

export async function getActiveAdvertisement(placement: AdPlacement) {
  const now = new Date()
  return db.advertisement.findFirst({
    where: { placement, isActive: true, startDate: { lte: now }, endDate: { gte: now } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getActiveSocialLinks() {
  return db.socialLink.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    select: { platform: true, url: true },
  })
}

export async function getNavCategories() {
  return db.category.findMany({
    where: { articles: { some: publishedWhere } },
    orderBy: { name: 'asc' },
    select: { name: true, slug: true },
  })
}

interface PagedArticles {
  articles: ArticleCard[]
  totalPages: number
  totalCount: number
}

async function pagedArticleQuery(
  where: NonNullable<Parameters<typeof db.article.findMany>[0]>['where'],
  page: number
): Promise<PagedArticles> {
  const currentPage = Math.max(1, page)
  const [articles, totalCount] = await Promise.all([
    db.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (currentPage - 1) * ARTICLES_PER_PAGE,
      take: ARTICLES_PER_PAGE,
      select: articleCardSelect,
    }),
    db.article.count({ where }),
  ])

  return { articles, totalCount, totalPages: Math.max(1, Math.ceil(totalCount / ARTICLES_PER_PAGE)) }
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, description: true },
  })
}

export async function getArticlesForCategory(categoryId: string, page: number) {
  return pagedArticleQuery({ ...publishedWhere, categoryId }, page)
}

export async function getTagBySlug(slug: string) {
  return db.tag.findUnique({ where: { slug }, select: { id: true, name: true, slug: true } })
}

export async function getArticlesForTag(tagId: string, page: number) {
  return pagedArticleQuery({ ...publishedWhere, tags: { some: { tagId } } }, page)
}

export async function getAuthorBySlug(slug: string) {
  return db.authorProfile.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      bio: true,
      photo: { select: { url: true, altText: true } },
      socialLinks: { select: { platform: true, url: true } },
    },
  })
}

export async function getArticlesForAuthor(authorId: string, page: number) {
  return pagedArticleQuery({ ...publishedWhere, authorId }, page)
}

export async function searchArticles(query: string, page: number) {
  return pagedArticleQuery(
    {
      ...publishedWhere,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } },
      ],
    },
    page
  )
}

export async function getArticlesForMonth(year: number, month: number, page: number) {
  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 1))
  return pagedArticleQuery(
    { ...publishedWhere, publishedAt: { gte: start, lt: end } },
    page
  )
}

export interface ArchiveMonth {
  year: number
  month: number
  count: number
}

export async function getRelatedArticles(categoryId: string, excludeArticleId: string) {
  return db.article.findMany({
    where: { ...publishedWhere, categoryId, NOT: { id: excludeArticleId } },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: articleCardSelect,
  })
}

export async function getArchiveMonths(): Promise<ArchiveMonth[]> {
  const rows = await db.$queryRaw<{ year: number; month: number; count: bigint }[]>`
    SELECT
      EXTRACT(YEAR FROM "publishedAt")::int AS year,
      EXTRACT(MONTH FROM "publishedAt")::int AS month,
      COUNT(*)::bigint AS count
    FROM "Article"
    WHERE status = 'PUBLISHED' AND "publishedAt" IS NOT NULL
    GROUP BY 1, 2
    ORDER BY 1 DESC, 2 DESC
  `
  return rows.map((row) => ({ year: row.year, month: row.month, count: Number(row.count) }))
}

export async function getLatestArticlesForFeed(limit: number) {
  return db.article.findMany({
    where: publishedWhere,
    orderBy: { publishedAt: 'desc' },
    take: limit,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      category: { select: { name: true } },
      author: { select: { name: true } },
    },
  })
}

export async function getSitemapEntries() {
  const [articles, categories, tags, authors] = await Promise.all([
    db.article.findMany({
      where: publishedWhere,
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    }),
    db.category.findMany({ select: { slug: true } }),
    db.tag.findMany({ select: { slug: true } }),
    db.authorProfile.findMany({ select: { slug: true } }),
  ])
  return { articles, categories, tags, authors }
}
