'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth/rbac'
import { UserRole } from '@/generated/prisma/enums'
import { slugify } from '@/lib/slug'

export interface TagActionState {
  error?: string
  success?: boolean
}

const tagSchema = z.object({
  name: z.string().trim().min(2).max(60),
})

export async function createTag(
  _prevState: TagActionState,
  formData: FormData
): Promise<TagActionState> {
  await requireRole(UserRole.EDITOR)

  const parsed = tagSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return { error: 'Enter a tag name (2-60 characters).' }
  }

  const slug = slugify(parsed.data.name)
  if (!slug) {
    return { error: 'Could not generate a valid slug from that name.' }
  }

  const existing = await db.tag.findUnique({ where: { slug } })
  if (existing) {
    return { error: `A tag with slug "${slug}" already exists.` }
  }

  await db.tag.create({ data: { name: parsed.data.name, slug } })
  revalidatePath('/admin/tags')
  return { success: true }
}

export async function deleteTag(tagId: string): Promise<void> {
  await requireRole(UserRole.EDITOR)
  await db.tag.delete({ where: { id: tagId } })
  revalidatePath('/admin/tags')
}
