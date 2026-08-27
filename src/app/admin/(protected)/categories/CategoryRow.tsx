'use client'

import { useState, useTransition } from 'react'
import { deleteCategory } from '@/lib/categories/actions'
import { CategoryForm } from './CategoryForm'

interface CategoryRowProps {
  category: {
    id: string
    name: string
    slug: string
    description: string | null
    articleCount: number
  }
}

export function CategoryRow({ category }: CategoryRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, startDelete] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  if (isEditing) {
    return (
      <tr>
        <td colSpan={4} className="py-3">
          <CategoryForm category={category} onDone={() => setIsEditing(false)} />
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-line hover:bg-blue-tint/40 border-b transition-colors last:border-0">
      <td className="px-4 py-3 font-medium">{category.name}</td>
      <td className="text-muted px-4 py-3">/{category.slug}</td>
      <td className="text-ink-soft px-4 py-3">{category.articleCount}</td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-ink-soft hover:text-blue text-xs font-semibold"
          >
            Edit
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => {
              setDeleteError(null)
              startDelete(async () => {
                try {
                  await deleteCategory(category.id)
                } catch (error) {
                  setDeleteError(
                    error instanceof Error ? error.message : 'Could not delete category.'
                  )
                }
              })
            }}
            className="text-error text-xs font-semibold hover:underline disabled:opacity-60"
          >
            Delete
          </button>
        </div>
        {deleteError && <p className="text-error mt-1 text-xs">{deleteError}</p>}
      </td>
    </tr>
  )
}
