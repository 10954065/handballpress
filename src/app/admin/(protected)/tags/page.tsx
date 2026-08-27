import type { Metadata } from 'next'
import { requireRole } from '@/lib/auth/rbac'
import { UserRole } from '@/generated/prisma/enums'
import { db } from '@/lib/db'
import { TagForm } from './TagForm'
import { TagChip } from './TagChip'
import { EmptyState } from '@/components/admin/EmptyState'
import { TagIcon } from '@/components/admin/icons'

export const metadata: Metadata = {
  title: 'Tags',
}

export default async function TagsPage() {
  await requireRole(UserRole.EDITOR)
  const tags = await db.tag.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { articles: true } } },
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-gold-dark text-xs font-bold tracking-[0.16em] uppercase">Taxonomy</p>
        <h1 className="text-ink mt-1 font-serif text-3xl font-semibold">Tags</h1>
      </div>
      <div className="border-line bg-paper-raised rounded-sm border p-4">
        <TagForm />
      </div>
      {tags.length === 0 ? (
        <EmptyState
          icon={TagIcon}
          title="No tags yet"
          description="Tags help readers find related coverage across articles."
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagChip
              key={tag.id}
              tag={{ id: tag.id, name: tag.name, articleCount: tag._count.articles }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
