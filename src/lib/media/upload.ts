import 'server-only'
import { randomUUID } from 'node:crypto'
import { put } from '@vercel/blob'
import { fileTypeFromBuffer } from 'file-type'
import sharp from 'sharp'
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_BYTES } from '@/lib/media/constants'

export interface UploadedImage {
  provider: 'VERCEL_BLOB'
  url: string
  storageKey: string
  mimeType: string
  width?: number
  height?: number
  fileSizeBytes: number
}

export async function uploadImageToBlob(file: File): Promise<UploadedImage> {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(`File is too large. Maximum size is ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB.`)
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Sniff actual file content — never trust the browser-supplied MIME type.
  const detected = await fileTypeFromBuffer(buffer)
  if (
    !detected ||
    !ALLOWED_IMAGE_MIME_TYPES.includes(detected.mime as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])
  ) {
    throw new Error('Unsupported file type. Allowed: JPEG, PNG, WebP, AVIF, GIF.')
  }

  let width: number | undefined
  let height: number | undefined
  try {
    const metadata = await sharp(buffer).metadata()
    width = metadata.width
    height = metadata.height
  } catch {
    throw new Error('Could not read image data — the file may be corrupted.')
  }

  const pathname = `media/${randomUUID()}.${detected.ext}`
  const blob = await put(pathname, buffer, { access: 'public', contentType: detected.mime })

  return {
    provider: 'VERCEL_BLOB',
    url: blob.url,
    storageKey: blob.pathname,
    mimeType: detected.mime,
    width,
    height,
    fileSizeBytes: file.size,
  }
}
