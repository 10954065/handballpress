import { getActiveBreakingNews, getActiveSocialLinks, getNavCategories } from '@/lib/public/queries'
import { SiteHeader } from '@/components/public/SiteHeader'
import { BreakingNewsBar } from '@/components/public/BreakingNewsBar'
import { SiteFooter } from '@/components/public/SiteFooter'
import { AdSlot } from '@/components/public/AdSlot'
import { AdPlacement } from '@/generated/prisma/enums'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [categories, breakingNews, socialLinks] = await Promise.all([
    getNavCategories(),
    getActiveBreakingNews(),
    getActiveSocialLinks(),
  ])

  return (
    <div className="bg-paper text-ink flex min-h-screen flex-1 flex-col">
      <BreakingNewsBar items={breakingNews} />
      <SiteHeader
        categories={categories}
        socialLinks={socialLinks}
        adSlot={<AdSlot placement={AdPlacement.HEADER} />}
      />
      <main className="flex-1">{children}</main>
      <AdSlot placement={AdPlacement.FOOTER} className="mx-auto my-8 max-w-6xl" />
      <SiteFooter categories={categories} socialLinks={socialLinks} />
    </div>
  )
}
