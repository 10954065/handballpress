import Link from 'next/link'

export default function SiteNotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-crimson font-serif text-6xl font-bold">404</p>
      <h1 className="mt-4 font-serif text-2xl font-semibold">Page not found</h1>
      <p className="text-ink-soft mt-2">That story may have moved, or the link is out of date.</p>
      <Link
        href="/"
        className="bg-crimson hover:bg-crimson-dark mt-8 rounded-sm px-6 py-3 text-sm font-semibold text-white transition-colors"
      >
        Back to the homepage
      </Link>
    </div>
  )
}
