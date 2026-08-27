import type { Metadata } from 'next'
import { requireRole } from '@/lib/auth/rbac'
import { UserRole } from '@/generated/prisma/enums'
import { db } from '@/lib/db'
import { AuthorForm } from './AuthorForm'
import { AuthorRow } from './AuthorRow'
import { EmptyState } from '@/components/admin/EmptyState'
import { AuthorIcon } from '@/components/admin/icons'

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
      <div>
        <p className="text-gold-dark text-xs font-bold tracking-[0.16em] uppercase">Taxonomy</p>
        <h1 className="text-ink mt-1 font-serif text-3xl font-semibold">Authors</h1>
      </div>
      <div className="border-line bg-paper-raised rounded-sm border p-4">
        <AuthorForm />
      </div>
      {authors.length === 0 ? (
        <EmptyState
          icon={AuthorIcon}
          title="No authors yet"
          description="Add a byline above so it can be attributed on articles."
        />
      ) : (
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
      )}
    </div>
  )
}
