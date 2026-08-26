'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SearchIcon, MenuIcon, CloseIcon } from './icons'

interface SiteHeaderProps {
  categories: { name: string; slug: string }[]
}

export function SiteHeader({ categories }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-paper border-line sticky top-0 z-40 border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
            Handball Press
          </span>
          <span className="bg-crimson rounded-sm px-1.5 py-0.5 text-xs font-bold text-white">
            GH
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="hover:text-crimson text-sm font-semibold tracking-wide uppercase"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/search" aria-label="Search" className="hover:text-crimson p-1">
            <SearchIcon className="size-5" />
          </Link>
          <Link
            href="/#subscribe"
            className="border-ink hover:bg-ink hidden rounded-sm border px-4 py-1.5 text-sm font-semibold hover:text-white sm:inline-block"
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
              className="border-line/60 hover:text-crimson border-b py-3 text-sm font-semibold tracking-wide uppercase last:border-none"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
