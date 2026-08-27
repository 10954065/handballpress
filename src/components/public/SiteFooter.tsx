import Link from 'next/link'
import type { SocialPlatform } from '@/generated/prisma/enums'
import { NewsletterForm } from './NewsletterForm'
import { SocialLinks } from './SocialLinks'

interface SiteFooterProps {
  categories: { name: string; slug: string }[]
  socialLinks: { platform: SocialPlatform; url: string }[]
}

export function SiteFooter({ categories, socialLinks }: SiteFooterProps) {
  return (
    <footer className="bg-navy mt-16 text-white/80">
      <div id="subscribe" className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-white">
              Never miss a result
            </h2>
            <p className="mt-1 max-w-md text-sm text-white/60">
              The week&apos;s biggest handball headlines from Ghana and beyond, straight to your
              inbox.
            </p>
          </div>
          <NewsletterForm className="w-full lg:w-auto lg:min-w-[26rem]" />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-serif text-xl font-bold text-white">
            Handball Press <span className="text-gold">GH</span>
          </p>
          <p className="mt-2 max-w-xs text-sm text-white/60">
            Play to the tune of development! Ghana handball news, match reports, interviews and
            features.
          </p>
          <SocialLinks links={socialLinks} className="mt-4 text-white/70" />
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-white/50 uppercase">Sections</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={`/category/${category.slug}`} className="hover:text-white">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-white/50 uppercase">Site</p>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-white">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/archive" className="hover:text-white">
                Archive
              </Link>
            </li>
            <li>
              <Link href="/search" className="hover:text-white">
                Search
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-6 text-center text-xs text-white/60 sm:px-6">
        © {new Date().getFullYear()} Handball Press GH. All rights reserved.
      </div>
    </footer>
  )
}
