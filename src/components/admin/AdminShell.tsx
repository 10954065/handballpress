'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, type ComponentType, type ReactNode } from 'react'
import {
  AdIcon,
  ArticleIcon,
  AuthorIcon,
  CategoryIcon,
  DashboardIcon,
  ExternalLinkIcon,
  MediaIcon,
  MigrationIcon,
  NewsletterIcon,
  TagIcon,
} from './icons'
import { CloseIcon, MenuIcon } from '../public/icons'

interface NavItem {
  href: string
  label: string
  Icon: ComponentType<{ className?: string }>
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  { label: 'Overview', items: [{ href: '/admin', label: 'Dashboard', Icon: DashboardIcon }] },
  {
    label: 'Content',
    items: [
      { href: '/admin/articles', label: 'Articles', Icon: ArticleIcon },
      { href: '/admin/media', label: 'Media', Icon: MediaIcon },
    ],
  },
  {
    label: 'Taxonomy',
    items: [
      { href: '/admin/categories', label: 'Categories', Icon: CategoryIcon },
      { href: '/admin/tags', label: 'Tags', Icon: TagIcon },
      { href: '/admin/authors', label: 'Authors', Icon: AuthorIcon },
    ],
  },
  {
    label: 'Growth',
    items: [
      { href: '/admin/advertisements', label: 'Ads', Icon: AdIcon },
      { href: '/admin/newsletter', label: 'Newsletter', Icon: NewsletterIcon },
    ],
  },
  {
    label: 'System',
    items: [{ href: '/admin/migration', label: 'Migration', Icon: MigrationIcon }],
  },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin'
  return pathname === href || pathname.startsWith(`${href}/`)
}

interface SidebarContentProps {
  pathname: string
  userName: string
  userRole: string
}

function SidebarContent({ pathname, userName, userRole }: SidebarContentProps) {
  return (
    <div className="bg-navy flex h-full flex-col text-white">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <Image src="/logo-512.png" alt="" width={32} height={32} className="size-8 rounded-full" />
        <div>
          <p className="text-sm font-bold tracking-tight">Handball Press GH</p>
          <p className="text-[11px] font-bold tracking-[0.16em] text-white/50 uppercase">Admin</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.16em] text-white/60 uppercase">
              {group.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map(({ href, label, Icon }) => {
                const active = isActive(pathname, href)
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={`relative flex items-center gap-2.5 rounded-sm py-2 pr-3 text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'from-blue/25 border-gold border-l-2 bg-gradient-to-r to-transparent pl-[10px] text-white'
                          : 'border-l-2 border-transparent pl-[10px] text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className={`size-4.5 shrink-0 ${active ? 'text-gold' : ''}`} />
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ExternalLinkIcon className="size-4.5 shrink-0" />
          View site
        </Link>
        <div className="mt-2 flex items-center justify-between gap-2 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{userName}</p>
            <p className="text-xs text-white/50">{userRole}</p>
          </div>
          <form action="/admin/logout" method="post">
            <button
              type="submit"
              className="text-xs font-bold tracking-wide text-white/70 uppercase hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

interface AdminShellProps {
  userName: string
  userRole: string
  children: ReactNode
}

export function AdminShell({ userName, userRole, children }: AdminShellProps) {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // A route change (via any sidebar link) should close the mobile drawer —
  // adjusted during render (React's recommended pattern for resetting state
  // in response to a prop/route change) rather than in an effect, which
  // would cause an extra post-navigation render with the drawer still open.
  const [renderedPathname, setRenderedPathname] = useState(pathname)
  if (pathname !== renderedPathname) {
    setRenderedPathname(pathname)
    setMobileNavOpen(false)
  }

  return (
    <div className="min-h-screen lg:flex">
      <div className="bg-navy sticky top-0 z-50 flex items-center justify-between px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 text-sm font-bold text-white">
          <Image
            src="/logo-512.png"
            alt=""
            width={24}
            height={24}
            className="size-6 rounded-full"
          />
          Handball Press GH Admin
        </Link>
        <button
          type="button"
          onClick={() => setMobileNavOpen((open) => !open)}
          aria-expanded={mobileNavOpen}
          aria-label="Toggle admin navigation"
          className="text-white"
        >
          {mobileNavOpen ? <CloseIcon className="size-6" /> : <MenuIcon className="size-6" />}
        </button>
      </div>

      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`bg-navy fixed inset-y-0 left-0 z-40 w-72 transition-transform duration-200 lg:static lg:z-auto lg:w-64 lg:shrink-0 lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent pathname={pathname} userName={userName} userRole={userRole} />
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:py-8">{children}</main>
    </div>
  )
}
