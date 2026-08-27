import type { ArticleStatus } from '@/generated/prisma/enums'

const STATUS_STYLES: Record<ArticleStatus, string> = {
  PUBLISHED: 'bg-success/10 text-success',
  DRAFT: 'bg-ink/[0.06] text-ink-soft',
  SCHEDULED: 'bg-blue-tint text-blue-dark',
  ARCHIVED: 'bg-ink/[0.06] text-muted',
}

interface StatusBadgeProps {
  status: ArticleStatus
  scheduledFor?: string | Date | null
}

export function StatusBadge({ status, scheduledFor }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold tracking-wide uppercase ${STATUS_STYLES[status]}`}
    >
      {status}
      {status === 'SCHEDULED' && scheduledFor && (
        <span className="ml-1 font-normal normal-case">
          · {new Date(scheduledFor).toLocaleDateString()}
        </span>
      )}
    </span>
  )
}
