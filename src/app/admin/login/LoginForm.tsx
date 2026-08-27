'use client'

import { useActionState } from 'react'
import { login, type LoginActionState } from '@/lib/auth/actions'

const initialState: LoginActionState = {}
const FIELD =
  'border-line bg-paper-raised focus-visible:ring-blue rounded-sm border px-3 py-2 text-sm outline-none focus-visible:ring-2'

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-ink text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={FIELD}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-ink text-sm font-semibold">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={FIELD}
        />
      </div>
      {state.error && (
        <p role="alert" className="text-error text-sm">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="bg-navy hover:bg-blue-dark rounded-sm px-4 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-60"
      >
        {isPending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
