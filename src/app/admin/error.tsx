'use client'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-neutral-600 dark:text-neutral-400">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="bg-foreground text-background rounded-md px-4 py-2 text-sm font-medium"
      >
        Try again
      </button>
    </div>
  )
}
