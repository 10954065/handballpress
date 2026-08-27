import Link from 'next/link'
import type { BreakingNewsItem } from '@/generated/prisma/client'
import './breaking-news.css'

interface BreakingNewsBarProps {
  items: BreakingNewsItem[]
}

export function BreakingNewsBar({ items }: BreakingNewsBarProps) {
  if (items.length === 0) return null

  // Duplicated once so the CSS marquee can loop seamlessly on a -50% translate.
  const looped = [...items, ...items]

  return (
    <div className="bg-navy flex items-stretch text-white">
      <span className="bg-gold text-navy z-10 flex shrink-0 items-center px-4 py-2 text-xs font-bold tracking-[0.14em] uppercase">
        Breaking
      </span>
      <div className="flex min-w-0 flex-1 items-center overflow-hidden">
        <div className="breaking-track">
          {looped.map((item, index) => (
            <span key={`${item.id}-${index}`} className="flex shrink-0 items-center py-2 pr-10 pl-6 text-sm">
              {item.linkUrl ? (
                <Link href={item.linkUrl} className="hover:underline">
                  {item.headline}
                </Link>
              ) : (
                item.headline
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
