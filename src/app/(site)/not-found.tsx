import Link from 'next/link'

export default function SiteNotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-gold-dark font-serif text-7xl font-bold">404</p>
      <h1 className="mt-4 font-serif text-2xl font-semibold sm:text-3xl">
        That shot missed the goal.
      </h1>
      <p className="text-ink-soft mt-3 max-w-sm">
        The page you&apos;re looking for may have moved, been renamed, or never existed. Let&apos;s
        get you back in play.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="bg-navy hover:bg-blue-dark rounded-sm px-6 py-3 text-sm font-semibold text-white transition-colors"
        >
          Back to the homepage
        </Link>
        <Link
          href="/archive"
          className="border-line hover:border-blue hover:text-blue rounded-sm border px-6 py-3 text-sm font-semibold transition-colors"
        >
          Latest news
        </Link>
      </div>
    </div>
  )
}
