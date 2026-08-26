'use server'

import { revalidatePath } from 'next/cache'
import { del } from '@vercel/blob'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth/rbac'
import { UserRole } from '@/generated/prisma/enums'
import { uploadImageToBlob } from '@/lib/media/upload'

export interface MediaActionState {
  error?: string
  success?: boolean
}

function optionalText(value: FormDataEntryValue | null): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export async function uploadMedia(
  _prevState: MediaActionState,
  formData: FormData
): Promise<MediaActionState> {
  const user = await requireRole(UserRole.AUTHOR)

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Choose a file to upload.' }
  }

  let uploaded
  try {
    uploaded = await uploadImageToBlob(file)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Upload failed.' }
  }

  await db.media.create({
    data: {
      ...uploaded,
      altText: optionalText(formData.get('altText')),
      caption: optionalText(formData.get('caption')),
      credit: optionalText(formData.get('credit')),
      uploadedByUserId: user.id,
    },
  })

  revalidatePath('/admin/media')
  return { success: true }
}

const updateMediaSchema = z.object({
  id: z.string().min(1),
  altText: z.string().trim().max(300).optional(),
  caption: z.string().trim().max(500).optional(),
  credit: z.string().trim().max(200).optional(),
})

export async function updateMediaMeta(
  _prevState: MediaActionState,
  formData: FormData
): Promise<MediaActionState> {
  await requireRole(UserRole.AUTHOR)

  const parsed = updateMediaSchema.safeParse({
    id: formData.get('id'),
    altText: formData.get('altText') ?? undefined,
    caption: formData.get('caption') ?? undefined,
    credit: formData.get('credit') ?? undefined,
  })
  if (!parsed.success) {
    return { error: 'Could not save — check the fields and try again.' }
  }

  const { id, altText, caption, credit } = parsed.data
  await db.media.update({
    where: { id },
    data: {
      altText: altText || null,
      caption: caption || null,
      credit: credit || null,
    },
  })

  revalidatePath('/admin/media')
  return { success: true }
}

export async function deleteMedia(mediaId: string): Promise<void> {
  await requireRole(UserRole.EDITOR)

  const media = await db.media.findUnique({ where: { id: mediaId } })
  if (!media) return

  if (media.provider === 'VERCEL_BLOB') {
    await del(media.url).catch(() => undefined)
  }
  await db.media.delete({ where: { id: mediaId } })

  revalidatePath('/admin/media')
}
