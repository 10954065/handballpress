import { getActiveBreakingNews, getActiveSocialLinks, getNavCategories } from '@/lib/public/queries'
import { SiteHeader } from '@/components/public/SiteHeader'
import { BreakingNewsBar } from '@/components/public/BreakingNewsBar'
import { SiteFooter } from '@/components/public/SiteFooter'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [categories, breakingNews, socialLinks] = await Promise.all([
    getNavCategories(),
    getActiveBreakingNews(),
    getActiveSocialLinks(),
  ])

  return (
    <div className="bg-paper text-ink flex min-h-screen flex-1 flex-col">
      <BreakingNewsBar items={breakingNews} />
      <SiteHeader categories={categories} />
      <main className="flex-1">{children}</main>
      <SiteFooter categories={categories} socialLinks={socialLinks} />
    </div>
  )
}
