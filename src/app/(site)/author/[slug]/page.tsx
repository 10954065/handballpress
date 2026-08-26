import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getArticlesForAuthor, getAuthorBySlug } from '@/lib/public/queries'
import { ArticleListing } from '@/components/public/ArticleListing'
import { SocialLinks } from '@/components/public/SocialLinks'

export async function generateMetadata({ params }: PageProps<'/author/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)
  if (!author) return {}
  return { title: author.name, description: author.bio ?? undefined }
}

export default async function AuthorPage({ params, searchParams }: PageProps<'/author/[slug]'>) {
  const { slug } = await params
  const { page } = await searchParams
  const author = await getAuthorBySlug(slug)
  if (!author) notFound()

  const currentPage = Number(page) || 1
  const { articles, totalPages } = await getArticlesForAuthor(author.id, currentPage)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="border-line mb-10 flex flex-col items-center gap-4 border-b pb-10 text-center">
        {author.photo ? (
          <Image
            src={author.photo.url}
            alt={author.photo.altText ?? author.name}
            width={112}
            height={112}
            className="size-28 rounded-full object-cover"
          />
        ) : (
          <div className="bg-ink/[0.06] flex size-28 items-center justify-center rounded-full font-serif text-3xl font-semibold">
            {author.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-crimson text-xs font-bold tracking-[0.16em] uppercase">Reporter</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold">{author.name}</h1>
        </div>
        {author.bio && <p className="text-ink-soft max-w-xl">{author.bio}</p>}
        <SocialLinks links={author.socialLinks} />
      </header>
      <ArticleListing
        articles={articles}
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/author/${author.slug}`}
        emptyMessage="No published stories from this author yet."
      />
    </div>
  )
}
