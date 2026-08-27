import Link from 'next/link'
import Image from 'next/image'
import type { ArticleCard as ArticleCardData } from '@/lib/public/queries'
import { formatDate } from '@/lib/format'

type Variant = 'hero' | 'secondary' | 'compact' | 'rail'

interface ArticleCardProps {
  article: ArticleCardData
  variant?: Variant
  priority?: boolean
}

function CategoryKicker({ category }: { category: { name: string; slug: string } }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="text-gold-dark text-xs font-bold tracking-[0.14em] uppercase hover:underline"
    >
      {category.name}
    </Link>
  )
}

function CardImage({
  article,
  className,
  sizes,
  priority,
}: {
  article: ArticleCardData
  className: string
  sizes: string
  priority?: boolean
}) {
  if (!article.featuredImage) {
    return (
      <div
        role="img"
        aria-label={article.title}
        className={`bg-ink/[0.06] flex items-center justify-center ${className}`}
      >
        <span className="font-serif text-3xl font-semibold opacity-20" aria-hidden="true">
          HP
        </span>
      </div>
    )
  }
  return (
    <Image
      src={article.featuredImage.url}
      // The image is the link's only content in every variant below (no
      // adjacent visible text) — an empty alt would leave the link with no
      // accessible name at all for screen readers. Falling back to the
      // article title keeps every thumbnail link nameable even for the
      // migrated posts that came through without dedicated alt text.
      alt={article.featuredImage.altText || article.title}
      width={article.featuredImage.width ?? 1200}
      height={article.featuredImage.height ?? 800}
      priority={priority}
      // next/image doesn't derive this from `priority` — it's a separate
      // prop (see next/dist/shared/lib/get-img-props.js) that must be set
      // explicitly to get the browser to actually fetch the LCP image
      // ahead of same-priority resources.
      fetchPriority={priority ? 'high' : undefined}
      sizes={sizes}
      className={`object-cover ${className}`}
    />
  )
}

export function ArticleCard({ article, variant = 'secondary', priority }: ArticleCardProps) {
  const href = `/news/${article.slug}`

  if (variant === 'hero') {
    return (
      <article className="group grid gap-6 lg:grid-cols-2 lg:items-center">
        <Link href={href} className="block overflow-hidden rounded-sm">
          <CardImage
            article={article}
            priority={priority}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-16/10 w-full transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>
        <div>
          <CategoryKicker category={article.category} />
          <h1 className="font-serif mt-2 text-3xl leading-[1.05] font-semibold text-balance sm:text-4xl lg:text-5xl">
            <Link href={href} className="hover:text-blue transition-colors">
              {article.title}
            </Link>
          </h1>
          {article.excerpt && (
            <p className="text-ink-soft mt-4 text-lg leading-relaxed text-pretty">
              {article.excerpt}
            </p>
          )}
          <p className="text-muted mt-4 flex flex-wrap items-center gap-x-1.5 text-sm">
            <span>By {article.author.name}</span>
            {article.publishedAt && (
              <>
                <span aria-hidden="true">·</span>
                <span>{formatDate(article.publishedAt)}</span>
              </>
            )}
          </p>
        </div>
      </article>
    )
  }

  if (variant === 'compact') {
    return (
      <article className="group flex items-start gap-4">
        <Link href={href} className="block w-24 shrink-0 overflow-hidden rounded-sm sm:w-32">
          <CardImage article={article} sizes="128px" className="aspect-square w-full" />
        </Link>
        <div className="min-w-0">
          <CategoryKicker category={article.category} />
          <h3 className="font-serif mt-1 text-base leading-snug font-semibold sm:text-lg">
            <Link href={href} className="hover:text-blue transition-colors">
              {article.title}
            </Link>
          </h3>
          <p className="text-muted mt-1 text-xs">{formatDate(article.publishedAt)}</p>
        </div>
      </article>
    )
  }

  if (variant === 'rail') {
    return (
      <article className="group">
        <Link href={href} className="block overflow-hidden rounded-sm">
          <CardImage
            article={article}
            sizes="(min-width: 640px) 25vw, 50vw"
            className="aspect-4/3 w-full transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>
        {/* h3, not h4: this variant's only caller (homepage category rails)
            nests it directly under a SectionHeading h2 — h4 here skipped a
            level for screen-reader heading navigation. */}
        <h3 className="font-serif mt-2 text-sm leading-snug font-semibold sm:text-base">
          <Link href={href} className="hover:text-blue transition-colors">
            {article.title}
          </Link>
        </h3>
      </article>
    )
  }

  return (
    <article className="group">
      <Link href={href} className="block overflow-hidden rounded-sm">
        <CardImage
          article={article}
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="aspect-3/2 w-full transition duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <CategoryKicker category={article.category} />
      <h3 className="font-serif mt-1.5 text-lg leading-snug font-semibold text-balance">
        <Link href={href} className="hover:text-blue transition-colors">
          {article.title}
        </Link>
      </h3>
      <p className="text-muted mt-1.5 text-xs">{formatDate(article.publishedAt)}</p>
    </article>
  )
}
