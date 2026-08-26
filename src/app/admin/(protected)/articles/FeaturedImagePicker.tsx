'use client'

import Image from 'next/image'

interface MediaOption {
  id: string
  url: string
  altText: string | null
}

interface FeaturedImagePickerProps {
  media: MediaOption[]
  value: string
  onChange: (mediaId: string) => void
}

export function FeaturedImagePicker({ media, value, onChange }: FeaturedImagePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange('')}
          data-selected={value === ''}
          className="flex h-16 w-16 items-center justify-center rounded-md border border-neutral-300 text-xs text-neutral-400 data-[selected=true]:border-2 data-[selected=true]:border-neutral-900 dark:border-neutral-700 dark:data-[selected=true]:border-white"
        >
          None
        </button>
        {media.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            data-selected={value === item.id}
            className="relative h-16 w-16 overflow-hidden rounded-md border border-neutral-300 data-[selected=true]:border-2 data-[selected=true]:border-neutral-900 dark:border-neutral-700 dark:data-[selected=true]:border-white"
          >
            <Image
              src={item.url}
              alt={item.altText ?? ''}
              fill
              sizes="64px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
      {media.length === 0 && (
        <p className="text-xs text-neutral-500">Upload images in the Media Library first.</p>
      )}
    </div>
  )
}
