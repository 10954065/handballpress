'use client'

import { useEffect, useRef, useState } from 'react'
import { ArticleLightbox, type LightboxImage } from './ArticleLightbox'

interface ArticleBodyProps {
  html: string
}

interface LightboxState {
  images: LightboxImage[]
  index: number
}

export function ArticleBody({ html }: ArticleBodyProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [lightbox, setLightbox] = useState<LightboxState | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const imgs = Array.from(container.querySelectorAll('img'))
    if (imgs.length === 0) return

    const images: LightboxImage[] = imgs.map((img) => ({ src: img.src, alt: img.alt }))
    const cleanups: Array<() => void> = []

    imgs.forEach((img, index) => {
      img.setAttribute('role', 'button')
      img.setAttribute('tabindex', '0')
      img.setAttribute('aria-label', img.alt ? `Expand image: ${img.alt}` : 'Expand image')
      img.style.cursor = 'zoom-in'

      const open = () => setLightbox({ images, index })
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          open()
        }
      }

      img.addEventListener('click', open)
      img.addEventListener('keydown', onKeyDown)
      cleanups.push(() => {
        img.removeEventListener('click', open)
        img.removeEventListener('keydown', onKeyDown)
      })
    })

    return () => cleanups.forEach((cleanup) => cleanup())
  }, [html])

  return (
    <>
      {/* contentHtml is sanitized server-side in articleJsonToSanitizedHtml
          (src/lib/articles/content.ts) before it ever reaches this prop —
          see that module for the allowlist. */}
      <div ref={containerRef} className="article-body mt-4" dangerouslySetInnerHTML={{ __html: html }} />
      {lightbox && (
        <ArticleLightbox
          images={lightbox.images}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onNavigate={(index) => setLightbox((state) => (state ? { ...state, index } : state))}
        />
      )}
    </>
  )
}
