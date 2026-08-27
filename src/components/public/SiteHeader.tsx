'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { SocialPlatform } from '@/generated/prisma/enums'
import { SearchIcon, MenuIcon, CloseIcon } from './icons'
import { SocialLinks } from './SocialLinks'
import { CONTACT_EMAIL } from '@/lib/site-config'

interface SiteHeaderProps {
  categories: { name: string; slug: string }[]
  socialLinks: { platform: SocialPlatform; url: string }[]
  // AdSlot is a Server Component and can't be imported/rendered directly
  // inside this Client Component (needed for the mobile menu's state) —
  // the parent layout renders it and passes the result down as a slot.
  adSlot?: ReactNode
}

export function SiteHeader({ categories, socialLinks, adSlot }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-paper-raised border-line sticky top-0 z-40 border-b">
      {/* Utility bar: quiet brand presence above the working header, not a
          second breaking-news strip (BreakingNewsBar already owns that). */}
      <div className="bg-navy hidden text-white/70 sm:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-xs sm:px-6">
          <Link href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white">
            {CONTACT_EMAIL}
          </Link>
          <SocialLinks links={socialLinks} className="text-white/70" />
        </div>
      </div>

      {adSlot && <div className="mx-auto max-w-6xl px-4 pt-3 sm:px-6">{adSlot}</div>}

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-512.png"
            alt="Handball Press GH"
            width={44}
            height={44}
            priority
            className="size-10 shrink-0 sm:size-11"
          />
          <span className="flex flex-col leading-none">
            <span className="font-serif text-lg font-bold tracking-tight sm:text-xl">
              Handball Press <span className="text-gold-dark">GH</span>
            </span>
            <span className="text-muted hidden text-[10px] font-semibold tracking-[0.12em] uppercase sm:block">
              Play to the tune of development
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="hover:text-blue text-sm font-semibold tracking-wide uppercase transition-colors"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/search" aria-label="Search" className="hover:text-blue p-1 transition-colors">
            <SearchIcon className="size-5" />
          </Link>
          <Link
            href="/#subscribe"
            className="bg-navy hover:bg-blue-dark hidden rounded-sm px-4 py-1.5 text-sm font-semibold text-white transition-colors sm:inline-block"
          >
            Newsletter
          </Link>
          <button
            type="button"
            className="p-1 lg:hidden"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          aria-label="Primary"
          className="border-line flex flex-col border-t px-4 py-3 lg:hidden"
        >
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              onClick={() => setIsMenuOpen(false)}
              className="border-line/60 hover:text-blue border-b py-3 text-sm font-semibold tracking-wide uppercase last:border-none"
            >
              {category.name}
            </Link>
          ))}
          <Link
            href="/#subscribe"
            onClick={() => setIsMenuOpen(false)}
            className="bg-navy mt-3 rounded-sm px-4 py-2.5 text-center text-sm font-semibold text-white"
          >
            Newsletter
          </Link>
        </nav>
      )}
    </header>
  )
}
