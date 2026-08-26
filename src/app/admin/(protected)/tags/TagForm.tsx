'use client'

import { useActionState, useRef } from 'react'
import { createTag, type TagActionState } from '@/lib/tags/actions'

const initialState: TagActionState = {}

export function TagForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(
    async (prevState: TagActionState, formData: FormData) => {
      const result = await createTag(prevState, formData)
      if (result.success) formRef.current?.reset()
      return result
    },
    initialState
  )

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tag-name" className="text-sm font-medium">
          Tag name
        </label>
        <input
          id="tag-name"
          name="name"
          required
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-transparent"
        />
      </div>
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="bg-foreground text-background rounded-md px-4 py-1.5 text-sm font-medium disabled:opacity-60"
      >
        {isPending ? 'Adding…' : 'Add tag'}
      </button>
    </form>
  )
}
