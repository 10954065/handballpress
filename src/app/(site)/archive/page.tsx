import type { Metadata } from 'next'
import Link from 'next/link'
import { getArchiveMonths } from '@/lib/public/queries'
import { formatMonthYear } from '@/lib/format'

export const metadata: Metadata = { title: 'Archive' }

export default async function ArchivePage() {
  const months = await getArchiveMonths()

  const byYear = new Map<number, typeof months>()
  for (const entry of months) {
    const bucket = byYear.get(entry.year) ?? []
    bucket.push(entry)
    byYear.set(entry.year, bucket)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="border-crimson mb-10 border-b-2 pb-4">
        <h1 className="font-serif text-4xl font-semibold">Archive</h1>
        <p className="text-ink-soft mt-2">Every published story, organized by month.</p>
      </header>

      {months.length === 0 && <p className="text-muted">Nothing published yet.</p>}

      <div className="flex flex-col gap-10">
        {[...byYear.entries()].map(([year, entries]) => (
          <section key={year}>
            <h2 className="font-serif text-2xl font-semibold">{year}</h2>
            <ul className="border-line mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t pt-4 sm:grid-cols-3">
              {entries.map((entry) => (
                <li key={`${entry.year}-${entry.month}`}>
                  <Link
                    href={`/archive/${entry.year}/${entry.month}`}
                    className="hover:text-crimson flex items-baseline justify-between gap-2 text-sm"
                  >
                    <span>{formatMonthYear(entry.year, entry.month)}</span>
                    <span className="text-muted">{entry.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
