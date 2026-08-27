import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticlesForMonth } from '@/lib/public/queries'
import { formatMonthYear } from '@/lib/format'
import { ArticleListing } from '@/components/public/ArticleListing'

function parseYearMonth(yearParam: string, monthParam: string) {
  const year = Number(yearParam)
  const month = Number(monthParam)
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return null
  return { year, month }
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<'/archive/[year]/[month]'>): Promise<Metadata> {
  const { year, month } = await params
  const { page } = await searchParams
  const parsed = parseYearMonth(year, month)
  if (!parsed) return {}
  const basePath = `/archive/${parsed.year}/${parsed.month}`
  return {
    title: formatMonthYear(parsed.year, parsed.month),
    alternates: { canonical: page ? `${basePath}?page=${page}` : basePath },
  }
}

export default async function ArchiveMonthPage({
  params,
  searchParams,
}: PageProps<'/archive/[year]/[month]'>) {
  const { year, month } = await params
  const { page } = await searchParams
  const parsed = parseYearMonth(year, month)
  if (!parsed) notFound()

  const currentPage = Number(page) || 1
  const { articles, totalPages } = await getArticlesForMonth(parsed.year, parsed.month, currentPage)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="border-crimson mb-10 border-b-2 pb-4">
        <p className="text-crimson text-xs font-bold tracking-[0.16em] uppercase">Archive</p>
        <h1 className="mt-1 font-serif text-4xl font-semibold">
          {formatMonthYear(parsed.year, parsed.month)}
        </h1>
      </header>
      <ArticleListing
        articles={articles}
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/archive/${parsed.year}/${parsed.month}`}
        emptyMessage="No stories published this month."
      />
    </div>
  )
}
