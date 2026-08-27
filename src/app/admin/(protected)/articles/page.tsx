import Link from 'next/link'
import type { Metadata } from 'next'
import { requireRole, hasRole } from '@/lib/auth/rbac'
import { UserRole, ArticleStatus } from '@/generated/prisma/enums'
import { db } from '@/lib/db'
import { ArticleRow } from './ArticleRow'

export const metadata: Metadata = {
  title: 'Articles',
}

const STATUS_FILTERS = ['ALL', ...Object.values(ArticleStatus)] as const

export default async function ArticlesPage({ searchParams }: PageProps<'/admin/articles'>) {
  const user = await requireRole(UserRole.AUTHOR)
  const { status: statusParam } = await searchParams
  const status = Array.isArray(statusParam) ? statusParam[0] : statusParam

  const isValidStatus = (value: string | undefined): value is ArticleStatus =>
    !!value && (Object.values(ArticleStatus) as string[]).includes(value)

  const where = isValidStatus(status) ? { status } : {}

  const articles = await db.article.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take: 100,
    include: { category: { select: { name: true } }, author: { select: { name: true } } },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-gold-dark text-xs font-bold tracking-[0.16em] uppercase">Content</p>
          <h1 className="text-ink mt-1 font-serif text-3xl font-semibold">Articles</h1>
        </div>
        <Link
          href="/admin/articles/new"
          className="bg-navy hover:bg-blue-dark rounded-sm px-5 py-2.5 text-sm font-bold text-white transition-colors"
        >
          New Article
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {STATUS_FILTERS.map((filterValue) => (
          <Link
            key={filterValue}
            href={
              filterValue === 'ALL' ? '/admin/articles' : `/admin/articles?status=${filterValue}`
            }
            className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase transition-colors ${
              (status ?? 'ALL') === filterValue
                ? 'bg-navy border-navy text-white'
                : 'border-line text-ink-soft hover:border-blue hover:text-blue'
            }`}
          >
            {filterValue}
          </Link>
        ))}
      </div>

      {articles.length === 0 ? (
        <p className="border-line text-muted rounded-sm border border-dashed px-6 py-12 text-center text-sm">
          No articles yet.
        </p>
      ) : (
        <div className="border-line bg-paper-raised overflow-x-auto rounded-sm border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-line text-muted border-b text-left text-xs uppercase">
                <th className="px-4 py-3 font-semibold">Article</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Author</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <ArticleRow
                  key={article.id}
                  canPublish={hasRole(user.role, UserRole.EDITOR)}
                  article={{
                    id: article.id,
                    title: article.title,
                    slug: article.slug,
                    status: article.status,
                    categoryName: article.category.name,
                    authorName: article.author.name,
                    updatedAt: article.updatedAt.toISOString(),
                    scheduledFor: article.scheduledFor?.toISOString() ?? null,
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
