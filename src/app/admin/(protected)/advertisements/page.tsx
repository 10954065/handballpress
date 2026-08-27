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
      <div>
        <p className="text-gold-dark text-xs font-bold tracking-[0.16em] uppercase">Growth</p>
        <h1 className="text-ink mt-1 font-serif text-3xl font-semibold">Advertisements</h1>
      </div>
      <div className="border-line bg-paper-raised rounded-sm border p-4">
        <AdvertisementForm />
      </div>
      {advertisements.length === 0 ? (
        <p className="border-line text-muted rounded-sm border border-dashed px-6 py-12 text-center text-sm">
          No advertisements yet.
        </p>
      ) : (
        <div className="border-line bg-paper-raised overflow-x-auto rounded-sm border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-line text-muted border-b text-left text-xs uppercase">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Placement</th>
                <th className="px-4 py-3 font-semibold">Runs</th>
                <th className="px-4 py-3 font-semibold">Views</th>
                <th className="px-4 py-3 font-semibold">Clicks</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {advertisements.map((advertisement) => (
                <AdvertisementRow key={advertisement.id} advertisement={advertisement} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
