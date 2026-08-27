'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth/rbac'
import { AdPlacement, UserRole } from '@/generated/prisma/enums'

export interface AdvertisementActionState {
  error?: string
  success?: boolean
}

const advertisementSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    placement: z.nativeEnum(AdPlacement),
    imageUrl: z.string().trim().url().optional().or(z.literal('')),
    linkUrl: z.string().trim().url().optional().or(z.literal('')),
    embedHtml: z.string().trim().max(5000).optional().or(z.literal('')),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    isActive: z.boolean(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after the start date.',
    path: ['endDate'],
  })
  .refine((data) => data.imageUrl || data.embedHtml, {
    message: 'Provide either an image URL or an embed snippet.',
    path: ['imageUrl'],
  })

function parseFormData(formData: FormData) {
  return advertisementSchema.safeParse({
    name: formData.get('name'),
    placement: formData.get('placement'),
    imageUrl: formData.get('imageUrl') || '',
    linkUrl: formData.get('linkUrl') || '',
    embedHtml: formData.get('embedHtml') || '',
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    isActive: formData.get('isActive') === 'on',
  })
}

export async function createAdvertisement(
  _prevState: AdvertisementActionState,
  formData: FormData
): Promise<AdvertisementActionState> {
  await requireRole(UserRole.EDITOR)

  const parsed = parseFormData(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid advertisement.' }
  }

  // embedHtml is rendered as raw, unsanitized HTML on the public site (ad
  // networks require real <script>/<iframe> tags, so it can't go through
  // the same sanitizer article content does) — restrict it to admins, not
  // any editor, to keep that trust boundary narrow.
  if (parsed.data.embedHtml) {
    await requireRole(UserRole.ADMIN)
  }

  await db.advertisement.create({
    data: {
      name: parsed.data.name,
      placement: parsed.data.placement,
      imageUrl: parsed.data.imageUrl || null,
      linkUrl: parsed.data.linkUrl || null,
      embedHtml: parsed.data.embedHtml || null,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      isActive: parsed.data.isActive,
    },
  })

  revalidatePath('/admin/advertisements')
  return { success: true }
}

export async function updateAdvertisement(
  _prevState: AdvertisementActionState,
  formData: FormData
): Promise<AdvertisementActionState> {
  await requireRole(UserRole.EDITOR)

  const id = formData.get('id')
  if (typeof id !== 'string' || !id) {
    return { error: 'Missing advertisement id.' }
  }

  const parsed = parseFormData(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid advertisement.' }
  }

  if (parsed.data.embedHtml) {
    await requireRole(UserRole.ADMIN)
  }

  await db.advertisement.update({
    where: { id },
    data: {
      name: parsed.data.name,
      placement: parsed.data.placement,
      imageUrl: parsed.data.imageUrl || null,
      linkUrl: parsed.data.linkUrl || null,
      embedHtml: parsed.data.embedHtml || null,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      isActive: parsed.data.isActive,
    },
  })

  revalidatePath('/admin/advertisements')
  return { success: true }
}

export async function toggleAdvertisementActive(id: string, isActive: boolean): Promise<void> {
  await requireRole(UserRole.EDITOR)
  await db.advertisement.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/advertisements')
}

export async function deleteAdvertisement(id: string): Promise<void> {
  await requireRole(UserRole.EDITOR)
  await db.advertisement.delete({ where: { id } })
  revalidatePath('/admin/advertisements')
}
