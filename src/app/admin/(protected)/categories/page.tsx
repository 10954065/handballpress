import type { Metadata } from 'next'
import { requireRole } from '@/lib/auth/rbac'
import { UserRole } from '@/generated/prisma/enums'
import { db } from '@/lib/db'
import { CategoryForm } from './CategoryForm'
import { CategoryRow } from './CategoryRow'

export const metadata: Metadata = {
  title: 'Categories',
}

export default async function CategoriesPage() {
  await requireRole(UserRole.EDITOR)
  const categories = await db.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { articles: true } } },
  })

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <CategoryForm />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500 uppercase dark:border-neutral-800">
            <th className="pb-2 font-medium">Name</th>
            <th className="pb-2 font-medium">Slug</th>
            <th className="pb-2 font-medium">Articles</th>
            <th className="pb-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={{ ...category, articleCount: category._count.articles }}
            />
          ))}
        </tbody>
      </table>
      {categories.length === 0 && <p className="text-sm text-neutral-500">No categories yet.</p>}
    </div>
  )
}
