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
      className="border-line bg-paper-raised flex flex-wrap items-end gap-3 rounded-sm border p-4"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="file" className="text-ink text-sm font-semibold">
          Image file
        </label>
        <input id="file" name="file" type="file" accept="image/*" required className="text-sm" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="altText" className="text-ink text-sm font-semibold">
          Alt text
        </label>
        <input
          id="altText"
          name="altText"
          type="text"
          className="border-line bg-paper-raised focus-visible:ring-blue rounded-sm border px-3 py-1.5 text-sm outline-none focus-visible:ring-2"
        />
      </div>
      {state.error && <p className="text-error text-sm">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="bg-navy hover:bg-blue-dark rounded-sm px-4 py-2 text-sm font-bold text-white transition-colors disabled:opacity-60"
      >
        {isPending ? 'Uploading…' : 'Upload'}
      </button>
    </form>
  )
}
