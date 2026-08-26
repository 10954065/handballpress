import type { Metadata } from 'next'
import { requireRole } from '@/lib/auth/rbac'
import { UserRole } from '@/generated/prisma/enums'
import { db } from '@/lib/db'
import { TagForm } from './TagForm'
import { TagChip } from './TagChip'

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
      <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <TagForm />
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <TagChip
            key={tag.id}
            tag={{ id: tag.id, name: tag.name, articleCount: tag._count.articles }}
          />
        ))}
      </div>
      {tags.length === 0 && <p className="text-sm text-neutral-500">No tags yet.</p>}
    </div>
  )
}
