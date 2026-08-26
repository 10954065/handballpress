import Link from 'next/link'
import { requireUser } from '@/lib/auth/rbac'

export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  const user = await requireUser()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-3 dark:border-neutral-800">
        <Link href="/admin" className="text-sm font-bold tracking-tight">
          Hand Ball Press GH — Admin
        </Link>
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
