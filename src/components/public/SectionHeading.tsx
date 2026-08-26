import Link from 'next/link'
import { ChevronRightIcon } from './icons'

interface SectionHeadingProps {
  title: string
  href?: string
  eyebrow?: string
}

export function SectionHeading({ title, href, eyebrow }: SectionHeadingProps) {
  const heading = (
    <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
  )

  return (
    <div className="border-crimson mb-6 flex items-end justify-between gap-4 border-b-2 pb-3">
      <div>
        {eyebrow && (
          <p className="text-crimson mb-1 text-xs font-bold tracking-[0.18em] uppercase">
            {eyebrow}
          </p>
        )}
        {href ? (
          <Link href={href} className="group inline-flex items-center gap-1">
            {heading}
          </Link>
        ) : (
          heading
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="text-ink-soft hover:text-crimson flex shrink-0 items-center gap-1 text-sm font-medium whitespace-nowrap"
        >
          See all
          <ChevronRightIcon className="size-4" />
        </Link>
      )}
    </div>
  )
}
