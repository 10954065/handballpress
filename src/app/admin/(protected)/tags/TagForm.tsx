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
        <label htmlFor="tag-name" className="text-ink text-sm font-semibold">
          Tag name
        </label>
        <input
          id="tag-name"
          name="name"
          required
          className="border-line bg-paper-raised focus-visible:ring-blue rounded-sm border px-3 py-1.5 text-sm outline-none focus-visible:ring-2"
        />
      </div>
      {state.error && <p className="text-error text-sm">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="bg-navy hover:bg-blue-dark rounded-sm px-4 py-2 text-sm font-bold text-white transition-colors disabled:opacity-60"
      >
        {isPending ? 'Adding…' : 'Add tag'}
      </button>
    </form>
  )
}
