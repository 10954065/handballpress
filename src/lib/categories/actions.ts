'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth/rbac'
import { UserRole } from '@/generated/prisma/enums'
import { slugify } from '@/lib/slug'

export interface CategoryActionState {
  error?: string
  success?: boolean
}

const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(500).optional(),
})

export async function createCategory(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  await requireRole(UserRole.EDITOR)

  const parsed = categorySchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug') || undefined,
    description: formData.get('description') || undefined,
  })
  if (!parsed.success) {
    return { error: 'Enter a category name (2-100 characters).' }
  }

  const slug = slugify(parsed.data.slug || parsed.data.name)
  if (!slug) {
    return { error: 'Could not generate a valid slug from that name.' }
  }

  const existing = await db.category.findUnique({ where: { slug } })
  if (existing) {
    return { error: `A category with slug "${slug}" already exists.` }
  }

  await db.category.create({
    data: { name: parsed.data.name, slug, description: parsed.data.description || null },
  })

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function updateCategory(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  await requireRole(UserRole.EDITOR)

  const id = formData.get('id')
  if (typeof id !== 'string' || !id) {
    return { error: 'Missing category id.' }
  }

  const parsed = categorySchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug') || undefined,
    description: formData.get('description') || undefined,
  })
  if (!parsed.success) {
    return { error: 'Enter a category name (2-100 characters).' }
  }

  const slug = slugify(parsed.data.slug || parsed.data.name)
  const conflict = await db.category.findFirst({ where: { slug, NOT: { id } } })
  if (conflict) {
    return { error: `A category with slug "${slug}" already exists.` }
  }

  await db.category.update({
    where: { id },
    data: { name: parsed.data.name, slug, description: parsed.data.description || null },
  })

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await requireRole(UserRole.EDITOR)

  const articleCount = await db.article.count({ where: { categoryId } })
  if (articleCount > 0) {
    throw new Error(
      `Cannot delete a category that still has ${articleCount} article(s). Reassign them first.`
    )
  }

  await db.category.delete({ where: { id: categoryId } })
  revalidatePath('/admin/categories')
}
