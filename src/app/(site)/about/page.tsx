import type { Metadata } from 'next'
import { getActiveSocialLinks } from '@/lib/public/queries'
import { SocialLinks } from '@/components/public/SocialLinks'

export const metadata: Metadata = {
  title: 'About',
  description: 'What Handball Press GH covers, and why.',
}

// See (site)/page.tsx for why — this page also queries the DB (social
// links) with no dynamic API usage, so it would otherwise be frozen at
// build time and never reflect a newly added/removed social link.
export const revalidate = 60

export default async function AboutPage() {
  const socialLinks = await getActiveSocialLinks()

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <p className="text-crimson text-xs font-bold tracking-[0.16em] uppercase">About</p>
      <h1 className="mt-1 font-serif text-4xl font-semibold sm:text-5xl">Handball Press GH</h1>
      <p className="text-ink-soft mt-6 text-xl leading-relaxed text-pretty">
        Play to the tune of development.
      </p>

      <div className="text-ink-soft mt-8 flex flex-col gap-5 leading-relaxed">
        <p>
          Handball Press GH covers the sport of handball in Ghana from the club level to the
          national teams — league results and match reports, player and coach interviews, federation
          news, youth and grassroots development, and the international appearances of Ghanaian
          players and teams.
        </p>
        <p>
          Handball rarely gets the coverage football does in Ghana. This site exists to close that
          gap: to give players, clubs, referees, and fans a dedicated place to follow the game, and
          to document its growth as the sport develops nationally.
        </p>
        <p>
          Have a result, a story, or a correction? Get in touch — see the{' '}
          <a href="/contact" className="text-crimson underline underline-offset-2">
            contact page
          </a>
          .
        </p>
      </div>

      {socialLinks.length > 0 && (
        <div className="border-line mt-10 border-t pt-6">
          <p className="text-muted text-xs font-bold tracking-[0.14em] uppercase">Follow along</p>
          <SocialLinks links={socialLinks} className="mt-3" />
        </div>
      )}
    </div>
  )
}
