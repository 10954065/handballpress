'use client'

import { useActionState, useRef } from 'react'
import { createCategory, updateCategory, type CategoryActionState } from '@/lib/categories/actions'

interface CategoryFormProps {
  category?: { id: string; name: string; slug: string; description: string | null }
  onDone?: () => void
}

const initialState: CategoryActionState = {}

export function CategoryForm({ category, onDone }: CategoryFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const action = category ? updateCategory : createCategory
  const [state, formAction, isPending] = useActionState(
    async (prevState: CategoryActionState, formData: FormData) => {
      const result = await action(prevState, formData)
      if (result.success) {
        formRef.current?.reset()
        onDone?.()
      }
      return result
    },
    initialState
  )

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      {category && <input type="hidden" name="id" value={category.id} />}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" htmlFor={`name-${category?.id ?? 'new'}`}>
          Name
        </label>
        <input
          id={`name-${category?.id ?? 'new'}`}
          name="name"
          defaultValue={category?.name}
          required
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-transparent"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" htmlFor={`slug-${category?.id ?? 'new'}`}>
          Slug (optional)
        </label>
        <input
          id={`slug-${category?.id ?? 'new'}`}
          name="slug"
          defaultValue={category?.slug}
          placeholder="auto from name"
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-transparent"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" htmlFor={`description-${category?.id ?? 'new'}`}>
          Description
        </label>
        <input
          id={`description-${category?.id ?? 'new'}`}
          name="description"
          defaultValue={category?.description ?? ''}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-transparent"
        />
      </div>
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="bg-foreground text-background rounded-md px-4 py-1.5 text-sm font-medium disabled:opacity-60"
      >
        {isPending ? 'Saving…' : category ? 'Save' : 'Add category'}
      </button>
    </form>
  )
}
