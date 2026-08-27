import Link from 'next/link'
import type { Metadata } from 'next'
import { requireUser } from '@/lib/auth/rbac'
import { db } from '@/lib/db'
import { ArticleStatus, SubscriberStatus } from '@/generated/prisma/enums'
import { formatDate } from '@/lib/format'
import { StatusBadge } from './articles/StatusBadge'
import { ArticleIcon, CategoryIcon, NewsletterIcon } from '@/components/admin/icons'
import { EmptyState } from '@/components/admin/EmptyState'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function AdminDashboardPage() {
  const user = await requireUser()

  const [statusCounts, viewAggregate, categoryCount, activeSubscriberCount, recentArticles] =
    await Promise.all([
      db.article.groupBy({ by: ['status'], _count: { _all: true } }),
      db.article.aggregate({ _sum: { viewCount: true } }),
      db.category.count(),
      db.newsletterSubscriber.count({ where: { status: SubscriberStatus.SUBSCRIBED } }),
      db.article.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 8,
        include: { category: { select: { name: true } }, author: { select: { name: true } } },
      }),
    ])

  const countFor = (status: ArticleStatus) =>
    statusCounts.find((row) => row.status === status)?._count._all ?? 0

  const stats = [
    {
      label: 'Published',
      value: countFor(ArticleStatus.PUBLISHED),
      Icon: ArticleIcon,
      accent: 'bg-success/10 text-success',
    },
    {
      label: 'Drafts',
      value: countFor(ArticleStatus.DRAFT),
      Icon: ArticleIcon,
      accent: 'bg-gold-tint text-gold-dark',
    },
    {
      label: 'Scheduled',
      value: countFor(ArticleStatus.SCHEDULED),
      Icon: ArticleIcon,
      accent: 'bg-blue-tint text-blue',
    },
    {
      label: 'Total views',
      value: viewAggregate._sum.viewCount ?? 0,
      Icon: ArticleIcon,
      accent: 'bg-navy-tint text-navy',
    },
    {
      label: 'Categories',
      value: categoryCount,
      Icon: CategoryIcon,
      accent: 'bg-gold-tint text-gold-dark',
    },
    {
      label: 'Newsletter subscribers',
      value: activeSubscriberCount,
      Icon: NewsletterIcon,
      accent: 'bg-blue-tint text-blue',
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div className="from-navy to-navy-soft relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-md bg-gradient-to-br px-6 py-6 text-white">
        <div
          aria-hidden="true"
          className="bg-gold pointer-events-none absolute -top-16 -right-16 size-48 rounded-full opacity-20 blur-3xl"
        />
        <div className="relative">
          <p className="text-gold text-xs font-bold tracking-[0.16em] uppercase">Dashboard</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold">Welcome, {user.name}</h1>
        </div>
        <Link
          href="/admin/articles/new"
          className="bg-gold hover:bg-gold/90 text-navy relative rounded-sm px-5 py-2.5 text-sm font-bold transition-colors"
        >
          New Article
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map(({ label, value, Icon, accent }) => (
          <div
            key={label}
            className="border-line bg-paper-raised hover:shadow-raised rounded-sm border p-4 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className={`flex size-9 items-center justify-center rounded-full ${accent}`}>
              <Icon className="size-4.5" />
            </div>
            <p className="text-ink mt-3 text-2xl font-bold tabular-nums">
              {value.toLocaleString()}
            </p>
            <p className="text-muted mt-1 text-xs font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-ink text-lg font-bold tracking-tight">Recently updated</h2>
          <Link href="/admin/articles" className="text-blue text-sm font-medium hover:underline">
            View all articles
          </Link>
        </div>

        {recentArticles.length === 0 ? (
          <EmptyState
            icon={ArticleIcon}
            title="No articles yet"
            description="Create your first one to see it here."
          />
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
                </tr>
              </thead>
              <tbody>
                {recentArticles.map((article) => (
                  <tr
                    key={article.id}
                    className="border-line hover:bg-blue-tint/40 border-b transition-colors last:border-0"
                  >
                    <td className="max-w-xs truncate px-4 py-3 font-medium">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="hover:text-blue transition-colors"
                      >
                        {article.title}
                      </Link>
                    </td>
                    <td className="text-ink-soft px-4 py-3">{article.category.name}</td>
                    <td className="text-ink-soft px-4 py-3">{article.author.name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={article.status} />
                    </td>
                    <td className="text-muted px-4 py-3">{formatDate(article.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
