import type { Metadata } from 'next'
import { requireRole } from '@/lib/auth/rbac'
import { UserRole } from '@/generated/prisma/enums'
import { db } from '@/lib/db'
import { hasRole } from '@/lib/auth/rbac'
import { UploadForm } from './UploadForm'
import { MediaItem } from './MediaItem'

export const metadata: Metadata = {
  title: 'Media Library',
}

export default async function MediaLibraryPage() {
  const user = await requireRole(UserRole.AUTHOR)
  const media = await db.media.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-gold-dark text-xs font-bold tracking-[0.16em] uppercase">Content</p>
        <h1 className="text-ink mt-1 font-serif text-3xl font-semibold">Media Library</h1>
      </div>
      <UploadForm />
      {media.length === 0 ? (
        <p className="border-line text-muted rounded-sm border border-dashed px-6 py-12 text-center text-sm">
          No media uploaded yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {media.map((item) => (
            <MediaItem
              key={item.id}
              media={{ ...item, createdAt: item.createdAt.toISOString() }}
              canDelete={hasRole(user.role, UserRole.EDITOR)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
