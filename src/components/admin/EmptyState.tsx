import type { ComponentType } from 'react'

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>
  title: string
  description?: string
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="border-line from-blue-tint/60 to-gold-tint/50 relative overflow-hidden rounded-2xl border-4 border-dashed bg-gradient-to-br px-6 py-14 text-center">
      <div className="border-line bg-paper-raised text-blue mx-auto flex size-14 items-center justify-center rounded-full border-2">
        <Icon className="size-6" />
      </div>
      <p className="text-ink mt-4 text-sm font-semibold">{title}</p>
      {description && <p className="text-muted mt-1 text-sm">{description}</p>}
    </div>
  )
}
