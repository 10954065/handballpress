'use client'

import { useActionState, useRef } from 'react'
import { createCategory, updateCategory, type CategoryActionState } from '@/lib/categories/actions'

interface CategoryFormProps {
  category?: { id: string; name: string; slug: string; description: string | null }
  onDone?: () => void
}

const initialState: CategoryActionState = {}
const FIELD =
  'border-line bg-paper-raised focus-visible:ring-blue rounded-sm border px-3 py-1.5 text-sm outline-none focus-visible:ring-2'
const LABEL = 'text-ink text-sm font-semibold'

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
        <label className={LABEL} htmlFor={`name-${category?.id ?? 'new'}`}>
          Name
        </label>
        <input
          id={`name-${category?.id ?? 'new'}`}
          name="name"
          defaultValue={category?.name}
          required
          className={FIELD}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={LABEL} htmlFor={`slug-${category?.id ?? 'new'}`}>
          Slug (optional)
        </label>
        <input
          id={`slug-${category?.id ?? 'new'}`}
          name="slug"
          defaultValue={category?.slug}
          placeholder="auto from name"
          className={FIELD}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={LABEL} htmlFor={`description-${category?.id ?? 'new'}`}>
          Description
        </label>
        <input
          id={`description-${category?.id ?? 'new'}`}
          name="description"
          defaultValue={category?.description ?? ''}
          className={FIELD}
        />
      </div>
      {state.error && <p className="text-error text-sm">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="bg-navy hover:bg-blue-dark rounded-sm px-4 py-2 text-sm font-bold text-white transition-colors disabled:opacity-60"
      >
        {isPending ? 'Saving…' : category ? 'Save' : 'Add category'}
      </button>
    </form>
  )
}
