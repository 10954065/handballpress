import type { Metadata } from 'next'
import { requireRole } from '@/lib/auth/rbac'
import { UserRole } from '@/generated/prisma/enums'
import { db } from '@/lib/db'

export const metadata: Metadata = { title: 'WordPress Migration' }

const STATUS_STYLES: Record<string, string> = {
  SUCCESS: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  SKIPPED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

export default async function MigrationReportPage() {
  await requireRole(UserRole.EDITOR)

  const [counts, problemRecords] = await Promise.all([
    db.migrationRecord.groupBy({ by: ['status'], _count: { _all: true } }),
    db.migrationRecord.findMany({
      where: { status: { not: 'SUCCESS' } },
      orderBy: { migratedAt: 'desc' },
      take: 200,
    }),
  ])

  const countByStatus = Object.fromEntries(counts.map((row) => [row.status, row._count._all]))
  const total = counts.reduce((sum, row) => sum + row._count._all, 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">WordPress Migration</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Results from the last run of{' '}
          <code className="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">
            npx tsx scripts/wordpress-migration/migrate.ts
          </code>
          . Safe to rerun at any time — every post is matched by its WordPress ID, so a rerun
          updates existing rows instead of duplicating them.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-xs tracking-wide text-neutral-500 uppercase">Total records</p>
          <p className="mt-1 text-2xl font-semibold">{total}</p>
        </div>
        {(['SUCCESS', 'SKIPPED', 'FAILED'] as const).map((status) => (
          <div
            key={status}
            className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <p className="text-xs tracking-wide text-neutral-500 uppercase">{status}</p>
            <p className="mt-1 text-2xl font-semibold">{countByStatus[status] ?? 0}</p>
          </div>
        ))}
      </div>

      {total === 0 && (
        <p className="rounded-lg border border-dashed border-neutral-300 px-6 py-10 text-center text-sm text-neutral-500 dark:border-neutral-700">
          No migration has been run yet.
        </p>
      )}

      {problemRecords.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-neutral-500 uppercase">
            Skipped or failed ({problemRecords.length})
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500 uppercase dark:border-neutral-800">
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Source</th>
                <th className="pb-2 font-medium">Reason</th>
              </tr>
            </thead>
            <tbody>
              {problemRecords.map((record) => (
                <tr key={record.id} className="border-b border-neutral-100 dark:border-neutral-900">
                  <td className="py-2 pr-4">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[record.status] ?? ''}`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    {record.sourceUrl ? (
                      <a
                        href={record.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {record.sourceUrl}
                      </a>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="py-2 text-neutral-600 dark:text-neutral-400">
                    {record.errorMessage ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
