import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireRole, hasRole } from '@/lib/auth/rbac'
import { UserRole } from '@/generated/prisma/enums'
import { db } from '@/lib/db'
import { ArticleForm } from '../../ArticleForm'

export const metadata: Metadata = {
  title: 'Edit Article',
}

export default async function EditArticlePage({ params }: PageProps<'/admin/articles/[id]/edit'>) {
  const { id } = await params
  const user = await requireRole(UserRole.AUTHOR)

  const [article, categories, authors, tags, media] = await Promise.all([
    db.article.findUnique({ where: { id }, include: { tags: { select: { tagId: true } } } }),
    db.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    db.authorProfile.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    db.tag.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    db.media.findMany({
      orderBy: { createdAt: 'desc' },
      take: 60,
      select: { id: true, url: true, altText: true },
    }),
  ])

  if (!article) notFound()

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <div>
        <p className="text-gold-dark text-xs font-bold tracking-[0.16em] uppercase">Content</p>
        <h1 className="text-ink mt-1 font-serif text-3xl font-semibold">Edit Article</h1>
      </div>
      <ArticleForm
        categories={categories}
        authors={authors}
        tags={tags}
        media={media}
        canPublish={hasRole(user.role, UserRole.EDITOR)}
        article={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          contentJson: article.contentJson as object,
          categoryId: article.categoryId,
          authorId: article.authorId,
          tagIds: article.tags.map((t) => t.tagId),
          featuredImageId: article.featuredImageId,
          seoTitle: article.seoTitle,
          seoDescription: article.seoDescription,
          status: article.status,
          scheduledFor: article.scheduledFor?.toISOString() ?? null,
        }}
      />
    </div>
  )
}
