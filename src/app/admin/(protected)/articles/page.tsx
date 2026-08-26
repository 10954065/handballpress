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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="bg-foreground text-background rounded-md px-4 py-2 text-sm font-medium"
        >
          New Article
        </Link>
      </div>

      <div className="flex gap-2 text-sm">
        {STATUS_FILTERS.map((filterValue) => (
          <Link
            key={filterValue}
            href={
              filterValue === 'ALL' ? '/admin/articles' : `/admin/articles?status=${filterValue}`
            }
            className={`rounded-full border px-3 py-1 ${
              (status ?? 'ALL') === filterValue
                ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                : 'border-neutral-300 dark:border-neutral-700'
            }`}
          >
            {filterValue}
          </Link>
        ))}
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500 uppercase dark:border-neutral-800">
            <th className="pb-2 font-medium">Article</th>
            <th className="pb-2 font-medium">Category</th>
            <th className="pb-2 font-medium">Author</th>
            <th className="pb-2 font-medium">Status</th>
            <th className="pb-2 font-medium">Updated</th>
            <th className="pb-2 font-medium" />
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
      {articles.length === 0 && <p className="text-sm text-neutral-500">No articles yet.</p>}
    </div>
  )
}
