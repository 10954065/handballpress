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
    <tr className="border-b border-neutral-100 dark:border-neutral-900">
      <td className="py-2 pr-4 font-medium">{category.name}</td>
      <td className="py-2 pr-4 text-neutral-500">/{category.slug}</td>
      <td className="py-2 pr-4 text-neutral-500">{category.articleCount}</td>
      <td className="py-2 text-right">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="mr-3 text-xs underline underline-offset-2"
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
          className="text-xs text-red-600 disabled:opacity-60 dark:text-red-400"
        >
          Delete
        </button>
        {deleteError && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{deleteError}</p>
        )}
      </td>
    </tr>
  )
}
