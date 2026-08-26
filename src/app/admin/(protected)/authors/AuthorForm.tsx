'use client'

import { useActionState, useRef } from 'react'
import { createAuthor, updateAuthor, type AuthorActionState } from '@/lib/authors/actions'

interface AuthorFormProps {
  author?: { id: string; name: string; slug: string; bio: string | null; email: string | null }
  onDone?: () => void
}

const initialState: AuthorActionState = {}

export function AuthorForm({ author, onDone }: AuthorFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const action = author ? updateAuthor : createAuthor
  const [state, formAction, isPending] = useActionState(
    async (prevState: AuthorActionState, formData: FormData) => {
      const result = await action(prevState, formData)
      if (result.success) {
        formRef.current?.reset()
        onDone?.()
      }
      return result
    },
    initialState
  )

  const fieldId = (name: string) => `${name}-${author?.id ?? 'new'}`

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      {author && <input type="hidden" name="id" value={author.id} />}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor={fieldId('name')}>
            Name
          </label>
          <input
            id={fieldId('name')}
            name="name"
            defaultValue={author?.name}
            required
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-transparent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor={fieldId('slug')}>
            Slug (optional)
          </label>
          <input
            id={fieldId('slug')}
            name="slug"
            defaultValue={author?.slug}
            placeholder="auto from name"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-transparent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor={fieldId('email')}>
            Email
          </label>
          <input
            id={fieldId('email')}
            name="email"
            type="email"
            defaultValue={author?.email ?? ''}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-transparent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" htmlFor={fieldId('photo')}>
            Photo
          </label>
          <input
            id={fieldId('photo')}
            name="photo"
            type="file"
            accept="image/*"
            className="text-sm"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" htmlFor={fieldId('bio')}>
          Bio
        </label>
        <textarea
          id={fieldId('bio')}
          name="bio"
          defaultValue={author?.bio ?? ''}
          rows={3}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-transparent"
        />
      </div>
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-foreground text-background rounded-md px-4 py-1.5 text-sm font-medium disabled:opacity-60"
        >
          {isPending ? 'Saving…' : author ? 'Save' : 'Add author'}
        </button>
      </div>
    </form>
  )
}
