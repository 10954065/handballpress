import type { Metadata } from 'next'
import { getHomepageFeed } from '@/lib/public/queries'
import { ArticleCard } from '@/components/public/ArticleCard'
import { SectionHeading } from '@/components/public/SectionHeading'
import { JsonLd } from '@/components/public/JsonLd'
import { buildWebsiteSchema } from '@/lib/structured-data'
import { AdSlot } from '@/components/public/AdSlot'
import { AdPlacement } from '@/generated/prisma/enums'
import { TrendingList } from '@/components/public/TrendingList'
import { Reveal } from '@/components/public/Reveal'

export const metadata: Metadata = {
  description:
    'Play to the tune of development! Ghana handball news, match reports, interviews and features.',
  alternates: { canonical: '/' },
}

// Without this, Next prerenders the homepage once at build time (this page
// has no dynamic API usage — a plain Prisma call doesn't opt a route into
// dynamic rendering the way cookies()/headers() do) and never regenerates
// it, so newly published articles would never appear without a full
// redeploy. ISR keeps it fast while staying fresh within a minute.
export const revalidate = 60

export default async function HomePage() {
  const { hero, secondary, latest, categoryRails, trending } = await getHomepageFeed()

  if (!hero) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <JsonLd data={buildWebsiteSchema()} />
        <h1 className="font-serif text-3xl font-semibold">Handball Press GH</h1>
        <p className="text-muted mt-3">
          The newsroom is warming up — published stories will appear here shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="relative isolate">
      {/* Decorative color wash behind the hero/latest-news area — the
          homepage's own content stays on the standard paper background;
          this just keeps the top of the page from reading as flat white.
          `isolate` is required: without it, this div doesn't establish its
          own stacking context, so the -z-10 wash paints behind the layout's
          opaque bg-paper background (a same-level in-flow sibling higher up
          the tree) instead of just behind this page's own content. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] overflow-hidden"
      >
        <div className="bg-drift bg-blue/30 absolute -top-32 -left-24 size-[480px] rounded-full blur-2xl" />
        <div
          className="bg-drift bg-gold/40 absolute -top-16 right-0 size-[420px] rounded-full blur-2xl"
          style={{ animationDelay: '-6s' }}
        />
        <div
          className="bg-drift bg-navy/25 absolute top-64 left-1/3 size-[360px] rounded-full blur-2xl"
          style={{ animationDelay: '-12s' }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <JsonLd data={buildWebsiteSchema()} />
        <section className="border-line border-b pb-10">
          <ArticleCard article={hero} variant="hero" priority />
        </section>

        <AdSlot placement={AdPlacement.HOMEPAGE_HERO} className="my-8" />

        {secondary.length > 0 && (
          <section className="border-line grid gap-x-6 gap-y-10 border-b py-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Visually hidden: ArticleCard's "secondary" variant renders an
                h3 (correct when nested under a visible SectionHeading's h2,
                as on the article page's related-articles section) — here it
                directly follows the hero's h1 with nothing between them,
                which skips a level for screen-reader heading navigation. */}
            <h2 className="sr-only">More stories</h2>
            {secondary.map((article, index) => (
              <Reveal key={article.id} delayMs={index * 80}>
                <ArticleCard article={article} variant="secondary" />
              </Reveal>
            ))}
          </section>
        )}

        <div className="grid gap-12 py-10 lg:grid-cols-3 lg:gap-16">
          <section className="lg:col-span-2">
            <SectionHeading title="Latest News" eyebrow="Headlines" href="/archive" />
            <div className="flex flex-col gap-8">
              {latest.map((article, index) => (
                <Reveal key={article.id} delayMs={Math.min(index * 60, 300)}>
                  <ArticleCard article={article} variant="compact" />
                </Reveal>
              ))}
            </div>
          </section>

          <aside className="flex flex-col gap-12">
            {trending.length > 0 && (
              <Reveal>
                <div>
                  <SectionHeading title="Trending Now" eyebrow="Popular" />
                  <TrendingList articles={trending} />
                </div>
              </Reveal>
            )}

            {categoryRails.slice(0, 1).map((category) => (
              <Reveal key={category.id}>
                <div>
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
                </div>
              </Reveal>
            ))}
          </aside>
        </div>

        {categoryRails.slice(1).map((category) => (
          <section key={category.id} className="border-line border-t py-10">
            <SectionHeading
              title={category.name}
              eyebrow="Section"
              href={`/category/${category.slug}`}
            />
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
              {category.articles.map((article, index) => (
                <Reveal key={article.id} delayMs={index * 60}>
                  <ArticleCard article={article} variant="rail" />
                </Reveal>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
