'use client'

import { clientEnv } from '@/lib/env.client'

interface SeoPreviewProps {
  title: string
  description: string
  slug: string
  imageUrl: string | null
}

const GOOGLE_TITLE_LIMIT = 60
const GOOGLE_DESCRIPTION_LIMIT = 160

function truncate(value: string, limit: number): string {
  return value.length > limit ? `${value.slice(0, limit - 1).trimEnd()}…` : value
}

export function SeoPreview({ title, description, slug, imageUrl }: SeoPreviewProps) {
  const displayTitle = truncate(title || 'Untitled article', GOOGLE_TITLE_LIMIT)
  const displayDescription = truncate(
    description || 'No description yet — add an excerpt or meta description.',
    GOOGLE_DESCRIPTION_LIMIT
  )
  const path = `/news/${slug || 'article-slug'}`
  const displayUrl = `${clientEnv.NEXT_PUBLIC_SITE_URL.replace(/^https?:\/\//, '')}${path}`

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-muted mb-2 text-xs font-bold tracking-[0.1em] uppercase">
          Google search preview
        </p>
        <div className="rounded-sm border border-transparent bg-white px-4 py-3">
          <p className="truncate text-sm text-[#202124]">
            Handball Press GH
            <span className="ml-2 text-[#4d5156]">{displayUrl}</span>
          </p>
          <p className="mt-0.5 truncate text-lg text-[#1a0dab]">{displayTitle}</p>
          <p className="mt-0.5 text-sm text-[#4d5156]">{displayDescription}</p>
        </div>
      </div>

      <div>
        <p className="text-muted mb-2 text-xs font-bold tracking-[0.1em] uppercase">
          Social share preview
        </p>
        <div className="border-line overflow-hidden rounded-sm border bg-white">
          <div className="bg-ink/5 aspect-[1.91/1] w-full">
            {imageUrl && (
              // Arbitrary media-library image inside a live-typing preview —
              // next/image's fixed dimensions don't fit a dynamic aspect-ratio
              // box well here.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="px-3 py-2">
            <p className="truncate text-[13px] text-[#65676b] uppercase">
              {clientEnv.NEXT_PUBLIC_SITE_URL.replace(/^https?:\/\//, '')}
            </p>
            <p className="truncate text-sm font-semibold text-[#050505]">{displayTitle}</p>
            <p className="truncate text-[13px] text-[#65676b]">{displayDescription}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
