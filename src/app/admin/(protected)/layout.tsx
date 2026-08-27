import Link from 'next/link'
import { requireUser } from '@/lib/auth/rbac'

const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/articles', label: 'Articles' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/tags', label: 'Tags' },
  { href: '/admin/authors', label: 'Authors' },
  { href: '/admin/advertisements', label: 'Ads' },
  { href: '/admin/newsletter', label: 'Newsletter' },
  { href: '/admin/migration', label: 'Migration' },
]

export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  const user = await requireUser()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-3 dark:border-neutral-800">
        <Link href="/admin" className="text-sm font-bold tracking-tight">
          Hand Ball Press GH — Admin
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
          <span>
            {user.name} · {user.role}
          </span>
          <form action="/admin/logout" method="post">
            <button type="submit" className="underline underline-offset-2 hover:no-underline">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  )
}
