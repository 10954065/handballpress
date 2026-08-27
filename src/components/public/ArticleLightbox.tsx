'use client'

import { useEffect, useRef } from 'react'
import { CloseIcon } from './icons'

export interface LightboxImage {
  src: string
  alt: string
}

interface ArticleLightboxProps {
  images: LightboxImage[]
  index: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export function ArticleLightbox({ images, index, onClose, onNavigate }: ArticleLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const image = images[index]
  const hasMultiple = images.length > 1

  useEffect(() => {
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (hasMultiple && event.key === 'ArrowRight') onNavigate((index + 1) % images.length)
      if (hasMultiple && event.key === 'ArrowLeft') onNavigate((index - 1 + images.length) % images.length)
    }
    document.addEventListener('keydown', handleKeyDown)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = overflow
    }
  }, [index, images.length, hasMultiple, onClose, onNavigate])

  if (!image) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.alt || 'Image viewer'}
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {hasMultiple ? (
          <p className="text-xs font-bold tracking-[0.14em] text-white/70 uppercase">
            {index + 1} / {images.length}
          </p>
        ) : (
          <span />
        )}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close image viewer"
          className="flex size-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <CloseIcon className="size-6" />
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden px-4 pb-4 sm:px-16">
        {hasMultiple && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onNavigate((index - 1 + images.length) % images.length)
            }}
            aria-label="Previous image"
            className="absolute left-2 flex size-11 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:left-6"
          >
            <span className="text-2xl" aria-hidden="true">
              ‹
            </span>
          </button>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element -- lightbox
            renders arbitrary already-rendered article images at full size;
            next/image's fixed intrinsic sizing doesn't fit this use case. */}
        <img
          src={image.src}
          alt={image.alt}
          className="max-h-full max-w-full rounded-sm object-contain"
          onClick={(event) => event.stopPropagation()}
        />

        {hasMultiple && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onNavigate((index + 1) % images.length)
            }}
            aria-label="Next image"
            className="absolute right-2 flex size-11 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:right-6"
          >
            <span className="text-2xl" aria-hidden="true">
              ›
            </span>
          </button>
        )}
      </div>

      {image.alt && (
        <p className="px-6 pb-6 text-center text-sm text-white/70" onClick={(event) => event.stopPropagation()}>
          {image.alt}
        </p>
      )}
    </div>
  )
}
