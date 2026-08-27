type IconProps = { className?: string }

export function DashboardIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect
        x="3.5"
        y="3.5"
        width="7.5"
        height="7.5"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="13"
        y="3.5"
        width="7.5"
        height="4.5"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="13"
        y="10"
        width="7.5"
        height="10.5"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="3.5"
        y="13"
        width="7.5"
        height="7.5"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export function ArticleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="3.5" width="16" height="17" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M7.5 8h9M7.5 11.5h9M7.5 15h5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function MediaIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect
        x="3.5"
        y="4.5"
        width="17"
        height="15"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="8.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m4.5 16.5 4.5-4.5a1.5 1.5 0 0 1 2.1 0l5.4 5.4M14 14l1.4-1.4a1.5 1.5 0 0 1 2.1 0l2 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CategoryIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.5 6.5a1 1 0 0 1 1-1h4.4a1 1 0 0 1 .8.4l1.3 1.6h9.1a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1V6.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function TagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M11.6 3.5H6a1.5 1.5 0 0 0-1.5 1.5v5.6a1.5 1.5 0 0 0 .44 1.06l8.9 8.9a1.5 1.5 0 0 0 2.12 0l5.6-5.6a1.5 1.5 0 0 0 0-2.12l-8.9-8.9a1.5 1.5 0 0 0-1.06-.44Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="8.75" cy="8.75" r="1.25" fill="currentColor" />
    </svg>
  )
}

export function AuthorIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4.5 20c1-3.9 4.2-6 7.5-6s6.5 2.1 7.5 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AdIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.5 9.5v5a1 1 0 0 0 1 1H7l3.6 3.2c.6.5 1.5.1 1.5-.7v-11c0-.8-.9-1.2-1.5-.7L7 9.5H4.5a1 1 0 0 0-1 1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M17 8.5c1.2 1 1.9 2.2 1.9 3.5s-.7 2.5-1.9 3.5M19.6 6c1.9 1.6 3 3.7 3 6s-1.1 4.4-3 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function NewsletterIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="13"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m4.5 7 6.6 5a1.5 1.5 0 0 0 1.8 0l6.6-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MigrationIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.5 12a7.5 7.5 0 0 1 12.6-5.5M19.5 12a7.5 7.5 0 0 1-12.6 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M17.5 3.5v3.5H14M6.5 20.5V17H10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ExternalLinkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M9 6H6a1.5 1.5 0 0 0-1.5 1.5v10.5A1.5 1.5 0 0 0 6 19.5h10.5A1.5 1.5 0 0 0 18 18v-3M13.5 4.5H19.5V10.5M19 5 11 13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
