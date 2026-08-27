import type { Metadata } from 'next'
import { requireRole } from '@/lib/auth/rbac'
import { UserRole } from '@/generated/prisma/enums'
import { db } from '@/lib/db'

export const metadata: Metadata = { title: 'WordPress Migration' }

const STATUS_STYLES: Record<string, string> = {
  SUCCESS: 'bg-success/10 text-success',
  SKIPPED: 'bg-gold-tint text-gold-dark',
  FAILED: 'bg-error/10 text-error',
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
        <p className="text-gold-dark text-xs font-bold tracking-[0.16em] uppercase">System</p>
        <h1 className="text-ink mt-1 font-serif text-3xl font-semibold">WordPress Migration</h1>
        <p className="text-muted mt-2 max-w-2xl text-sm">
          Results from the last run of{' '}
          <code className="bg-ink/[0.06] rounded-sm px-1 py-0.5">
            npx tsx scripts/wordpress-migration/migrate.ts
          </code>
          . Safe to rerun at any time — every post is matched by its WordPress ID, so a rerun
          updates existing rows instead of duplicating them.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="border-line bg-paper-raised rounded-sm border p-4">
          <p className="text-muted text-xs font-medium tracking-wide uppercase">Total records</p>
          <p className="text-ink mt-1 text-2xl font-bold tabular-nums">{total}</p>
        </div>
        {(['SUCCESS', 'SKIPPED', 'FAILED'] as const).map((status) => (
          <div key={status} className="border-line bg-paper-raised rounded-sm border p-4">
            <p className="text-muted text-xs font-medium tracking-wide uppercase">{status}</p>
            <p className="text-ink mt-1 text-2xl font-bold tabular-nums">
              {countByStatus[status] ?? 0}
            </p>
          </div>
        ))}
      </div>

      {total === 0 && (
        <p className="border-line text-muted rounded-sm border border-dashed px-6 py-10 text-center text-sm">
          No migration has been run yet.
        </p>
      )}

      {problemRecords.length > 0 && (
        <div>
          <h2 className="text-muted mb-3 text-sm font-semibold tracking-wide uppercase">
            Skipped or failed ({problemRecords.length})
          </h2>
          <div className="border-line bg-paper-raised overflow-x-auto rounded-sm border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-line text-muted border-b text-left text-xs uppercase">
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody>
                {problemRecords.map((record) => (
                  <tr key={record.id} className="border-line border-b last:border-0">
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold tracking-wide uppercase ${STATUS_STYLES[record.status] ?? ''}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {record.sourceUrl ? (
                        <a
                          href={record.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue hover:underline"
                        >
                          {record.sourceUrl}
                        </a>
                      ) : (
                        <span className="text-faint">—</span>
                      )}
                    </td>
                    <td className="text-ink-soft px-4 py-3">{record.errorMessage ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
