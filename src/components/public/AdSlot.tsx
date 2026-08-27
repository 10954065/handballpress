import { after } from 'next/server'
import { db } from '@/lib/db'
import type { AdPlacement } from '@/generated/prisma/enums'
import { getActiveAdvertisement } from '@/lib/public/queries'

interface AdSlotProps {
  placement: AdPlacement
  className?: string
}

export async function AdSlot({ placement, className }: AdSlotProps) {
  const ad = await getActiveAdvertisement(placement)
  if (!ad) return null

  // Record the impression after the response is sent, so a slow write
  // never delays the page. `after()` (unlike a bare un-awaited promise)
  // is guaranteed to run to completion on Vercel's Fluid Compute.
  after(() => db.advertisement.update({ where: { id: ad.id }, data: { impressions: { increment: 1 } } }))

  const inner = ad.embedHtml ? (
    // Admin-only field, not user input — see actions.ts's role gate.
    <div dangerouslySetInnerHTML={{ __html: ad.embedHtml }} />
  ) : ad.imageUrl ? (
    // Ad creative dimensions vary per campaign — a plain <img> avoids
    // fighting next/image's required width/height for arbitrary sizes.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={ad.imageUrl} alt={ad.name} className="mx-auto h-auto max-w-full" />
  ) : null

  if (!inner) return null

  return (
    <div className={`border-line bg-paper-raised border ${className ?? ''}`}>
      <p className="text-muted px-3 pt-2 text-[10px] tracking-[0.14em] uppercase">Advertisement</p>
      <div className="p-3">
        {ad.linkUrl ? (
          <a href={`/ads/${ad.id}/click`} target="_blank" rel="noopener noreferrer sponsored">
            {inner}
          </a>
        ) : (
          inner
        )}
      </div>
    </div>
  )
}
