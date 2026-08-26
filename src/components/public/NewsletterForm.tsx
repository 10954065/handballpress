'use client'

import { useActionState } from 'react'
import { subscribeToNewsletter, type NewsletterActionState } from '@/lib/newsletter/actions'

const initialState: NewsletterActionState = {}

interface NewsletterFormProps {
  className?: string
}

export function NewsletterForm({ className }: NewsletterFormProps) {
  const [state, formAction, isPending] = useActionState(subscribeToNewsletter, initialState)

  if (state.success) {
    return (
      <p className={`text-sm font-medium ${className ?? ''}`}>
        You&apos;re in. Watch your inbox for the next dispatch.
      </p>
    )
  }

  return (
    <form action={formAction} className={`flex flex-col gap-2 sm:flex-row ${className ?? ''}`}>
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        placeholder="you@example.com"
        className="border-line bg-paper-raised text-ink placeholder:text-muted focus-visible:ring-crimson w-full min-w-0 rounded-sm border px-4 py-2.5 text-sm outline-none focus-visible:ring-2"
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-crimson hover:bg-crimson-dark shrink-0 rounded-sm px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
      >
        {isPending ? 'Joining…' : 'Subscribe'}
      </button>
      {state.error && (
        <p role="alert" className="text-crimson basis-full text-sm">
          {state.error}
        </p>
      )}
    </form>
  )
}
