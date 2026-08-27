import { requireUser } from '@/lib/auth/rbac'
import { AdminShell } from '@/components/admin/AdminShell'

export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  const user = await requireUser()

  return (
    <AdminShell userName={user.name} userRole={user.role}>
      {children}
    </AdminShell>
  )
}
