'use client'

import { useState } from 'react'
import { UploadIcon } from './icons'

interface ImageDropzoneProps<T> {
  label: string
  uploadFn: (file: File) => Promise<T>
  onUploaded: (result: T) => void
  disabled?: boolean
}

export function ImageDropzone<T>({ label, uploadFn, onUploaded, disabled }: ImageDropzoneProps<T>) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    setIsUploading(true)
    try {
      const result = await uploadFn(file)
      onUploaded(result)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled && !isUploading) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          if (disabled || isUploading) return
          const file = event.dataTransfer.files?.[0]
          if (file) void handleFile(file)
        }}
        data-dragging={isDragging}
        data-disabled={disabled || isUploading}
        className="border-line hover:border-blue hover:bg-blue-tint/40 data-[dragging=true]:border-blue data-[dragging=true]:bg-blue-tint data-[disabled=true]:hover:bg-paper-raised data-[disabled=true]:hover:border-line flex cursor-pointer flex-col items-center gap-1 rounded-sm border-2 border-dashed px-4 py-5 text-center transition-colors data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-60"
      >
        <UploadIcon className="text-blue size-5" />
        <span className="text-ink text-sm font-semibold">{isUploading ? 'Uploading…' : label}</span>
        <span className="text-muted text-xs">Drag &amp; drop, or click to choose a file</span>
        <input
          type="file"
          accept="image/*"
          hidden
          disabled={disabled || isUploading}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void handleFile(file)
            event.target.value = ''
          }}
        />
      </label>
      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  )
}
