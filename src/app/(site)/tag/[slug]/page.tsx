import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticlesForTag, getTagBySlug } from '@/lib/public/queries'
import { ArticleListing } from '@/components/public/ArticleListing'

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<'/tag/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const { page } = await searchParams
  const tag = await getTagBySlug(slug)
  if (!tag) return {}
  return {
    title: `#${tag.name}`,
    alternates: { canonical: page ? `/tag/${slug}?page=${page}` : `/tag/${slug}` },
  }
}

export default async function TagPage({ params, searchParams }: PageProps<'/tag/[slug]'>) {
  const { slug } = await params
  const { page } = await searchParams
  const tag = await getTagBySlug(slug)
  if (!tag) notFound()

  const currentPage = Number(page) || 1
  const { articles, totalPages } = await getArticlesForTag(tag.id, currentPage)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="border-gold mb-10 border-b-2 pb-4">
        <p className="text-gold-dark text-xs font-bold tracking-[0.16em] uppercase">Tag</p>
        <h1 className="mt-1 font-serif text-4xl font-semibold">#{tag.name}</h1>
      </header>
      <ArticleListing
        articles={articles}
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/tag/${tag.slug}`}
        emptyMessage="No stories tagged with this yet."
      />
    </div>
  )
}
