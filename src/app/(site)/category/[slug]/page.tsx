import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticlesForCategory, getCategoryBySlug } from '@/lib/public/queries'
import { ArticleListing } from '@/components/public/ArticleListing'

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<'/category/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const { page } = await searchParams
  const category = await getCategoryBySlug(slug)
  if (!category) return {}
  return {
    title: category.name,
    description: category.description ?? undefined,
    alternates: { canonical: page ? `/category/${slug}?page=${page}` : `/category/${slug}` },
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<'/category/[slug]'>) {
  const { slug } = await params
  const { page } = await searchParams
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const currentPage = Number(page) || 1
  const { articles, totalPages } = await getArticlesForCategory(category.id, currentPage)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="border-crimson mb-10 border-b-2 pb-4">
        <p className="text-crimson text-xs font-bold tracking-[0.16em] uppercase">Section</p>
        <h1 className="mt-1 font-serif text-4xl font-semibold">{category.name}</h1>
        {category.description && (
          <p className="text-ink-soft mt-2 max-w-2xl">{category.description}</p>
        )}
      </header>
      <ArticleListing
        articles={articles}
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/category/${category.slug}`}
        emptyMessage="No stories in this section yet — check back soon."
      />
    </div>
  )
}
