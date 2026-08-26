import type { Metadata } from 'next'
import { requireRole } from '@/lib/auth/rbac'
import { UserRole } from '@/generated/prisma/enums'
import { db } from '@/lib/db'
import { AuthorForm } from './AuthorForm'
import { AuthorRow } from './AuthorRow'

export const metadata: Metadata = {
  title: 'Authors',
}

export default async function AuthorsPage() {
  await requireRole(UserRole.EDITOR)
  const authors = await db.authorProfile.findMany({
    orderBy: { name: 'asc' },
    include: { photo: { select: { url: true } }, _count: { select: { articles: true } } },
  })

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Authors</h1>
      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <AuthorForm />
      </div>
      <div className="flex flex-col gap-3">
        {authors.map((author) => (
          <AuthorRow
            key={author.id}
            author={{
              id: author.id,
              name: author.name,
              slug: author.slug,
              bio: author.bio,
              email: author.email,
              photoUrl: author.photo?.url ?? null,
              articleCount: author._count.articles,
            }}
          />
        ))}
      </div>
      {authors.length === 0 && <p className="text-sm text-neutral-500">No authors yet.</p>}
    </div>
  )
}
