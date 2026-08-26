'use client'

import { useActionState, useRef } from 'react'
import { uploadMedia, type MediaActionState } from '@/lib/media/actions'

const initialState: MediaActionState = {}

export function UploadForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(
    async (prevState: MediaActionState, formData: FormData) => {
      const result = await uploadMedia(prevState, formData)
      if (result.success) formRef.current?.reset()
      return result
    },
    initialState
  )

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="file" className="text-sm font-medium">
          Image file
        </label>
        <input id="file" name="file" type="file" accept="image/*" required className="text-sm" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="altText" className="text-sm font-medium">
          Alt text
        </label>
        <input
          id="altText"
          name="altText"
          type="text"
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-transparent"
        />
      </div>
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="bg-foreground text-background rounded-md px-4 py-1.5 text-sm font-medium disabled:opacity-60"
      >
        {isPending ? 'Uploading…' : 'Upload'}
      </button>
    </form>
  )
}
