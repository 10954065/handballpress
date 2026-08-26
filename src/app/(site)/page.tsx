import type { Metadata } from 'next'
import { getHomepageFeed } from '@/lib/public/queries'
import { ArticleCard } from '@/components/public/ArticleCard'
import { SectionHeading } from '@/components/public/SectionHeading'

export const metadata: Metadata = {
  description:
    'Play to the tune of development! Ghana handball news, match reports, interviews and features.',
}

export default async function HomePage() {
  const { hero, secondary, latest, categoryRails } = await getHomepageFeed()

  if (!hero) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-serif text-3xl font-semibold">Handball Press GH</h1>
        <p className="text-muted mt-3">
          The newsroom is warming up — published stories will appear here shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <section className="border-line border-b pb-10">
        <ArticleCard article={hero} variant="hero" priority />
      </section>

      {secondary.length > 0 && (
        <section className="border-line grid gap-x-6 gap-y-10 border-b py-10 sm:grid-cols-2 lg:grid-cols-4">
          {secondary.map((article) => (
            <ArticleCard key={article.id} article={article} variant="secondary" />
          ))}
        </section>
      )}

      <div className="grid gap-12 py-10 lg:grid-cols-3 lg:gap-16">
        <section className="lg:col-span-2">
          <SectionHeading title="Latest News" eyebrow="Headlines" href="/archive" />
          <div className="flex flex-col gap-8">
            {latest.map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        </section>

        {categoryRails.slice(0, 1).map((category) => (
          <aside key={category.id}>
            <SectionHeading
              title={category.name}
              eyebrow="Section"
              href={`/category/${category.slug}`}
            />
            <div className="flex flex-col gap-6">
              {category.articles.map((article) => (
                <ArticleCard key={article.id} article={article} variant="compact" />
              ))}
            </div>
          </aside>
        ))}
      </div>

      {categoryRails.slice(1).map((category) => (
        <section key={category.id} className="border-line border-t py-10">
          <SectionHeading
            title={category.name}
            eyebrow="Section"
            href={`/category/${category.slug}`}
          />
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {category.articles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="rail" />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
