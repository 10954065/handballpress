import 'server-only'
import { MAX_IMAGE_SIZE_BYTES } from '@/lib/media/constants'
import { uploadImageBufferToBlob, type UploadedImage } from '@/lib/media/blob'

export type { UploadedImage }

export async function uploadImageToBlob(file: File): Promise<UploadedImage> {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(`File is too large. Maximum size is ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB.`)
  }
  const buffer = Buffer.from(await file.arrayBuffer())
  return uploadImageBufferToBlob(buffer)
}
