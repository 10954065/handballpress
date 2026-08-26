import type { Metadata } from 'next'
import { requireUser } from '@/lib/auth/rbac'
import { db } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function AdminDashboardPage() {
  const user = await requireUser()
  const [userCount, articleCount] = await Promise.all([db.user.count(), db.article.count()])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Welcome, {user.name}</h1>
      <div className="flex gap-4">
        <div className="rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <p className="text-xs text-neutral-500">CMS users</p>
          <p className="text-2xl font-semibold">{userCount}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <p className="text-xs text-neutral-500">Articles</p>
          <p className="text-2xl font-semibold">{articleCount}</p>
        </div>
      </div>
    </div>
  )
}
