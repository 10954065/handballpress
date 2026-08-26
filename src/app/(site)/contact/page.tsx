import type { Metadata } from 'next'
import { getActiveSocialLinks } from '@/lib/public/queries'
import { SocialLinks } from '@/components/public/SocialLinks'
import { CONTACT_EMAIL } from '@/lib/site-config'

export const metadata: Metadata = { title: 'Contact' }

export default async function ContactPage() {
  const socialLinks = await getActiveSocialLinks()

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <p className="text-crimson text-xs font-bold tracking-[0.16em] uppercase">Contact</p>
      <h1 className="mt-1 font-serif text-4xl font-semibold sm:text-5xl">Get in touch</h1>
      <p className="text-ink-soft mt-6 leading-relaxed">
        Story tips, match results, press releases, corrections, or advertising enquiries — reach the
        newsroom directly.
      </p>

      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="bg-crimson hover:bg-crimson-dark mt-8 inline-block rounded-sm px-6 py-3 text-sm font-semibold text-white transition-colors"
      >
        {CONTACT_EMAIL}
      </a>

      {socialLinks.length > 0 && (
        <div className="border-line mt-10 border-t pt-6">
          <p className="text-muted text-xs font-bold tracking-[0.14em] uppercase">
            Or find us on social
          </p>
          <SocialLinks links={socialLinks} className="mt-3" />
        </div>
      )}
    </div>
  )
}
