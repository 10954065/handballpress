import type { Metadata } from 'next'
import { requireRole, hasRole } from '@/lib/auth/rbac'
import { UserRole } from '@/generated/prisma/enums'
import { db } from '@/lib/db'
import { ArticleForm } from '../ArticleForm'

export const metadata: Metadata = {
  title: 'New Article',
}

export default async function NewArticlePage() {
  const user = await requireRole(UserRole.AUTHOR)

  const [categories, authors, tags, media] = await Promise.all([
    db.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    db.authorProfile.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    db.tag.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    db.media.findMany({
      orderBy: { createdAt: 'desc' },
      take: 60,
      select: { id: true, url: true, altText: true },
    }),
  ])

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">New Article</h1>
      <ArticleForm
        categories={categories}
        authors={authors}
        tags={tags}
        media={media}
        canPublish={hasRole(user.role, UserRole.EDITOR)}
      />
    </div>
  )
}
