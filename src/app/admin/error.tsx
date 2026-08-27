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
      <h1 className="text-ink font-serif text-xl font-semibold">Something went wrong</h1>
      <p className="text-muted max-w-md text-sm">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="bg-navy hover:bg-blue-dark rounded-sm px-4 py-2 text-sm font-bold text-white transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
