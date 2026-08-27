import type { Metadata } from 'next'
import { requireRole } from '@/lib/auth/rbac'
import { UserRole } from '@/generated/prisma/enums'
import { db } from '@/lib/db'
import { AdvertisementForm } from './AdvertisementForm'
import { AdvertisementRow } from './AdvertisementRow'

export const metadata: Metadata = { title: 'Advertisements' }

export default async function AdvertisementsPage() {
  await requireRole(UserRole.EDITOR)
  const advertisements = await db.advertisement.findMany({ orderBy: { startDate: 'desc' } })

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Advertisements</h1>
      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <AdvertisementForm />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500 uppercase dark:border-neutral-800">
            <th className="pb-2 font-medium">Name</th>
            <th className="pb-2 font-medium">Placement</th>
            <th className="pb-2 font-medium">Runs</th>
            <th className="pb-2 font-medium">Views</th>
            <th className="pb-2 font-medium">Clicks</th>
            <th className="pb-2 font-medium">Status</th>
            <th className="pb-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {advertisements.map((advertisement) => (
            <AdvertisementRow key={advertisement.id} advertisement={advertisement} />
          ))}
        </tbody>
      </table>
      {advertisements.length === 0 && (
        <p className="text-sm text-neutral-500">No advertisements yet.</p>
      )}
    </div>
  )
}
