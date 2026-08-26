'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth/rbac'
import { UserRole } from '@/generated/prisma/enums'
import { slugify } from '@/lib/slug'
import { uploadImageToBlob } from '@/lib/media/upload'

export interface AuthorActionState {
  error?: string
  success?: boolean
}

const authorSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140).optional(),
  bio: z.string().trim().max(2000).optional(),
  email: z.string().trim().email().optional().or(z.literal('')),
})

async function resolvePhotoId(
  formData: FormData,
  uploadedByUserId: string
): Promise<string | null | undefined> {
  const file = formData.get('photo')
  if (!(file instanceof File) || file.size === 0) return undefined // no change

  const uploaded = await uploadImageToBlob(file)
  const media = await db.media.create({ data: { ...uploaded, uploadedByUserId } })
  return media.id
}

export async function createAuthor(
  _prevState: AuthorActionState,
  formData: FormData
): Promise<AuthorActionState> {
  const user = await requireRole(UserRole.EDITOR)

  const parsed = authorSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug') || undefined,
    bio: formData.get('bio') || undefined,
    email: formData.get('email') || '',
  })
  if (!parsed.success) {
    return { error: 'Enter a valid author name and email.' }
  }

  const slug = slugify(parsed.data.slug || parsed.data.name)
  if (!slug) {
    return { error: 'Could not generate a valid slug from that name.' }
  }
  if (await db.authorProfile.findUnique({ where: { slug } })) {
    return { error: `An author with slug "${slug}" already exists.` }
  }

  let photoId: string | null | undefined
  try {
    photoId = await resolvePhotoId(formData, user.id)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Photo upload failed.' }
  }

  await db.authorProfile.create({
    data: {
      name: parsed.data.name,
      slug,
      bio: parsed.data.bio || null,
      email: parsed.data.email || null,
      photoId: photoId ?? null,
    },
  })

  revalidatePath('/admin/authors')
  return { success: true }
}

export async function updateAuthor(
  _prevState: AuthorActionState,
  formData: FormData
): Promise<AuthorActionState> {
  const user = await requireRole(UserRole.EDITOR)

  const id = formData.get('id')
  if (typeof id !== 'string' || !id) {
    return { error: 'Missing author id.' }
  }

  const parsed = authorSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug') || undefined,
    bio: formData.get('bio') || undefined,
    email: formData.get('email') || '',
  })
  if (!parsed.success) {
    return { error: 'Enter a valid author name and email.' }
  }

  const slug = slugify(parsed.data.slug || parsed.data.name)
  const conflict = await db.authorProfile.findFirst({ where: { slug, NOT: { id } } })
  if (conflict) {
    return { error: `An author with slug "${slug}" already exists.` }
  }

  let photoId: string | null | undefined
  try {
    photoId = await resolvePhotoId(formData, user.id)
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Photo upload failed.' }
  }

  await db.authorProfile.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug,
      bio: parsed.data.bio || null,
      email: parsed.data.email || null,
      ...(photoId !== undefined ? { photoId } : {}),
    },
  })

  revalidatePath('/admin/authors')
  return { success: true }
}

export async function deleteAuthor(authorId: string): Promise<void> {
  await requireRole(UserRole.EDITOR)

  const articleCount = await db.article.count({ where: { authorId } })
  if (articleCount > 0) {
    throw new Error(`Cannot delete an author with ${articleCount} article(s). Reassign them first.`)
  }

  await db.authorProfile.delete({ where: { id: authorId } })
  revalidatePath('/admin/authors')
}
