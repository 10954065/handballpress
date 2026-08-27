'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth/rbac'
import { UserRole, SubscriberStatus } from '@/generated/prisma/enums'

export async function setSubscriberStatus(id: string, status: SubscriberStatus): Promise<void> {
  await requireRole(UserRole.EDITOR)
  await db.newsletterSubscriber.update({
    where: { id },
    data: {
      status,
      unsubscribedAt: status === SubscriberStatus.UNSUBSCRIBED ? new Date() : null,
    },
  })
  revalidatePath('/admin/newsletter')
}
