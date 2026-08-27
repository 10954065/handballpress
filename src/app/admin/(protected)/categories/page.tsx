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
      <div>
        <p className="text-gold-dark text-xs font-bold tracking-[0.16em] uppercase">Taxonomy</p>
        <h1 className="text-ink mt-1 font-serif text-3xl font-semibold">Categories</h1>
      </div>
      <div className="border-line bg-paper-raised rounded-sm border p-4">
        <CategoryForm />
      </div>
      {categories.length === 0 ? (
        <p className="border-line text-muted rounded-sm border border-dashed px-6 py-12 text-center text-sm">
          No categories yet.
        </p>
      ) : (
        <div className="border-line bg-paper-raised overflow-x-auto rounded-sm border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-line text-muted border-b text-left text-xs uppercase">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Articles</th>
                <th className="px-4 py-3 font-semibold" />
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
        </div>
      )}
    </div>
  )
}
