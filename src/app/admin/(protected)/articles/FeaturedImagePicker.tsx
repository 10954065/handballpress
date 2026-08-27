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
          className="border-line text-muted data-[selected=true]:border-blue flex h-16 w-16 items-center justify-center rounded-sm border text-xs data-[selected=true]:border-2"
        >
          None
        </button>
        {media.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            data-selected={value === item.id}
            aria-label={`Use ${item.altText || 'this image'} as the featured image`}
            className="border-line data-[selected=true]:border-blue relative h-16 w-16 overflow-hidden rounded-sm border data-[selected=true]:border-2"
          >
            <Image src={item.url} alt="" fill sizes="64px" className="object-cover" />
          </button>
        ))}
      </div>
      {media.length === 0 && (
        <p className="text-muted text-xs">Upload images in the Media Library first.</p>
      )}
    </div>
  )
}
