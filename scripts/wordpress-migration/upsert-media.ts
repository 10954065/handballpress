import type { PrismaClient } from '@/generated/prisma/client'
import { MediaProvider } from '@/generated/prisma/enums'
import { uploadImageBufferToBlob } from '@/lib/media/blob'
import type { ResolvedMedia } from './rewrite-images'
import type { WpAttachment } from './wp-api-client'

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`download failed (${response.status})`)
  }
  return Buffer.from(await response.arrayBuffer())
}

// Resolves a WordPress image URL to a Media row, downloading and uploading
// to Vercel Blob only the first time it's seen — both within one run (an
// in-memory cache) and across reruns (a DB lookup by wordpressAttachmentId,
// when the URL matched a known attachment).
export function createMediaResolver(
  db: PrismaClient,
  uploadedByUserId: string | null,
  dryRun = false
) {
  const cache = new Map<string, ResolvedMedia>()

  return async function resolveMedia(
    cleanUrl: string,
    attachment: WpAttachment | undefined
  ): Promise<ResolvedMedia> {
    const cacheKey = attachment ? `wp:${attachment.ID}` : cleanUrl
    const cached = cache.get(cacheKey)
    if (cached) return cached

    if (dryRun) {
      // No network fetch, no blob upload, no DB write — just enough of a
      // stand-in for the content pipeline (htmlToArticleJson etc.) to run
      // and be inspected.
      const resolved = { mediaId: cacheKey, url: cleanUrl }
      cache.set(cacheKey, resolved)
      return resolved
    }

    if (attachment) {
      const existing = await db.media.findUnique({
        where: { wordpressAttachmentId: String(attachment.ID) },
      })
      if (existing) {
        const resolved = { mediaId: existing.id, url: existing.url }
        cache.set(cacheKey, resolved)
        return resolved
      }
    }

    const buffer = await downloadImage(cleanUrl)
    const uploaded = await uploadImageBufferToBlob(buffer)
    const media = await db.media.create({
      data: {
        provider: MediaProvider.VERCEL_BLOB,
        url: uploaded.url,
        storageKey: uploaded.storageKey,
        mimeType: uploaded.mimeType,
        width: uploaded.width,
        height: uploaded.height,
        fileSizeBytes: uploaded.fileSizeBytes,
        altText: attachment?.alt || null,
        caption: attachment?.caption || null,
        wordpressAttachmentId: attachment ? String(attachment.ID) : null,
        uploadedByUserId,
      },
    })

    const resolved = { mediaId: media.id, url: media.url }
    cache.set(cacheKey, resolved)
    return resolved
  }
}
