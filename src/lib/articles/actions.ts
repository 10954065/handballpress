'use server'

import { revalidatePath } from 'next/cache'
import type { JSONContent } from '@tiptap/core'
import { db } from '@/lib/db'
import { requireRole, requireUser } from '@/lib/auth/rbac'
import { UserRole, ArticleStatus } from '@/generated/prisma/enums'
import { slugify } from '@/lib/slug'
import { articleFormSchema } from '@/lib/articles/validations'
import { articleJsonToSanitizedHtml, estimateReadingTimeMinutes } from '@/lib/articles/content'

export interface ArticleActionState {
  error?: string
  success?: boolean
  articleId?: string
}

function parseFormData(formData: FormData) {
  return articleFormSchema.safeParse({
    title: formData.get('title'),
    slug: formData.get('slug') || undefined,
    excerpt: formData.get('excerpt') || undefined,
    categoryId: formData.get('categoryId'),
    authorId: formData.get('authorId'),
    tagIds: formData.getAll('tagIds'),
    featuredImageId: formData.get('featuredImageId') || undefined,
    seoTitle: formData.get('seoTitle') || undefined,
    seoDescription: formData.get('seoDescription') || undefined,
    publishMode: formData.get('publishMode'),
    scheduledFor: formData.get('scheduledFor') || undefined,
  })
}

type ParsedContent = { ok: true; content: JSONContent } | { ok: false; error: string }

function parseContentJson(formData: FormData): ParsedContent {
  const raw = formData.get('contentJson')
  if (typeof raw !== 'string' || !raw) return { ok: false, error: 'Missing article content.' }
  try {
    return { ok: true, content: JSON.parse(raw) as JSONContent }
  } catch {
    return { ok: false, error: 'Invalid article content.' }
  }
}

interface PublishFields {
  status: ArticleStatus
  publishedAt: Date | null
  scheduledFor: Date | null
}

function resolvePublishFields(
  publishMode: 'draft' | 'now' | 'schedule',
  scheduledForInput: string | undefined,
  existingPublishedAt: Date | null
): PublishFields | { error: string } {
  if (publishMode === 'draft') {
    return { status: ArticleStatus.DRAFT, publishedAt: existingPublishedAt, scheduledFor: null }
  }
  if (publishMode === 'now') {
    return {
      status: ArticleStatus.PUBLISHED,
      publishedAt: existingPublishedAt ?? new Date(),
      scheduledFor: null,
    }
  }
  if (!scheduledForInput) return { error: 'Choose a scheduled date and time.' }
  const scheduledFor = new Date(scheduledForInput)
  if (Number.isNaN(scheduledFor.getTime()) || scheduledFor.getTime() <= Date.now()) {
    return { error: 'Scheduled time must be in the future.' }
  }
  return { status: ArticleStatus.SCHEDULED, publishedAt: existingPublishedAt, scheduledFor }
}

async function canModifyArticle(
  article: { createdByUserId: string | null; status: ArticleStatus },
  userId: string,
  userRole: UserRole
): Promise<boolean> {
  if (
    userRole === UserRole.EDITOR ||
    userRole === UserRole.ADMIN ||
    userRole === UserRole.SUPER_ADMIN
  ) {
    return true
  }
  return article.createdByUserId === userId && article.status === ArticleStatus.DRAFT
}

export async function createArticle(
  _prevState: ArticleActionState,
  formData: FormData
): Promise<ArticleActionState> {
  const user = await requireRole(UserRole.AUTHOR)

  const parsed = parseFormData(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the form fields.' }
  }
  const parsedContent = parseContentJson(formData)
  if (!parsedContent.ok) return { error: parsedContent.error }
  const { content } = parsedContent

  const data = parsed.data
  const slug = slugify(data.slug || data.title)
  if (!slug) return { error: 'Could not generate a slug from the title.' }
  if (await db.article.findUnique({ where: { slug } })) {
    return { error: `An article with slug "${slug}" already exists.` }
  }

  const publishFields = resolvePublishFields(data.publishMode, data.scheduledFor, null)
  if ('error' in publishFields) return publishFields

  if (publishFields.status !== ArticleStatus.DRAFT) {
    await requireRole(UserRole.EDITOR)
  }

  const contentHtml = articleJsonToSanitizedHtml(content)
  const readingTimeMinutes = estimateReadingTimeMinutes(content)

  const article = await db.article.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt || null,
      contentJson: content,
      contentHtml,
      ...publishFields,
      authorId: data.authorId,
      categoryId: data.categoryId,
      featuredImageId: data.featuredImageId || null,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      readingTimeMinutes,
      createdByUserId: user.id,
      tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
    },
  })

  revalidatePath('/admin/articles')
  return { success: true, articleId: article.id }
}

export async function updateArticle(
  _prevState: ArticleActionState,
  formData: FormData
): Promise<ArticleActionState> {
  const user = await requireUser()

  const id = formData.get('id')
  if (typeof id !== 'string' || !id) return { error: 'Missing article id.' }

  const existing = await db.article.findUnique({ where: { id } })
  if (!existing) return { error: 'Article not found.' }
  if (!(await canModifyArticle(existing, user.id, user.role))) {
    return { error: 'You do not have permission to edit this article.' }
  }

  const parsed = parseFormData(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Check the form fields.' }
  }
  const parsedContent = parseContentJson(formData)
  if (!parsedContent.ok) return { error: parsedContent.error }
  const { content } = parsedContent

  const data = parsed.data
  const slug = slugify(data.slug || data.title)
  const conflict = await db.article.findFirst({ where: { slug, NOT: { id } } })
  if (conflict) return { error: `An article with slug "${slug}" already exists.` }

  const publishFields = resolvePublishFields(
    data.publishMode,
    data.scheduledFor,
    existing.publishedAt
  )
  if ('error' in publishFields) return publishFields

  if (publishFields.status !== existing.status && publishFields.status !== ArticleStatus.DRAFT) {
    await requireRole(UserRole.EDITOR)
  }

  const contentHtml = articleJsonToSanitizedHtml(content)
  const readingTimeMinutes = estimateReadingTimeMinutes(content)

  await db.$transaction([
    db.articleRevision.create({
      data: {
        articleId: id,
        editorUserId: user.id,
        titleSnapshot: existing.title,
        contentSnapshot: existing.contentJson as object,
      },
    }),
    db.articleTag.deleteMany({ where: { articleId: id } }),
    db.article.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt || null,
        contentJson: content,
        contentHtml,
        ...publishFields,
        authorId: data.authorId,
        categoryId: data.categoryId,
        featuredImageId: data.featuredImageId || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        readingTimeMinutes,
        tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
      },
    }),
  ])

  revalidatePath('/admin/articles')
  revalidatePath(`/news/${slug}`)
  return { success: true, articleId: id }
}

export async function archiveArticle(articleId: string): Promise<void> {
  await requireRole(UserRole.EDITOR)
  await db.article.update({ where: { id: articleId }, data: { status: ArticleStatus.ARCHIVED } })
  revalidatePath('/admin/articles')
}

export async function revertArticleToDraft(articleId: string): Promise<void> {
  await requireRole(UserRole.EDITOR)
  await db.article.update({
    where: { id: articleId },
    data: { status: ArticleStatus.DRAFT, scheduledFor: null },
  })
  revalidatePath('/admin/articles')
}

export async function publishArticleNow(articleId: string): Promise<void> {
  await requireRole(UserRole.EDITOR)
  const article = await db.article.findUniqueOrThrow({ where: { id: articleId } })
  await db.article.update({
    where: { id: articleId },
    data: {
      status: ArticleStatus.PUBLISHED,
      publishedAt: article.publishedAt ?? new Date(),
      scheduledFor: null,
    },
  })
  revalidatePath('/admin/articles')
  revalidatePath(`/news/${article.slug}`)
}

export async function deleteArticle(articleId: string): Promise<void> {
  const user = await requireUser()
  const article = await db.article.findUnique({ where: { id: articleId } })
  if (!article) return
  if (!(await canModifyArticle(article, user.id, user.role))) {
    throw new Error('You do not have permission to delete this article.')
  }
  await db.article.delete({ where: { id: articleId } })
  revalidatePath('/admin/articles')
}

export async function duplicateArticle(articleId: string): Promise<{ id: string }> {
  await requireRole(UserRole.AUTHOR)
  const original = await db.article.findUniqueOrThrow({
    where: { id: articleId },
    include: { tags: true },
  })

  let title = `${original.title} (Copy)`
  let slug = slugify(title)
  let suffix = 2
  while (await db.article.findUnique({ where: { slug } })) {
    title = `${original.title} (Copy ${suffix})`
    slug = slugify(title)
    suffix += 1
  }

  const copy = await db.article.create({
    data: {
      title,
      slug,
      excerpt: original.excerpt,
      contentJson: original.contentJson as object,
      contentHtml: original.contentHtml,
      status: ArticleStatus.DRAFT,
      authorId: original.authorId,
      categoryId: original.categoryId,
      featuredImageId: original.featuredImageId,
      seoTitle: original.seoTitle,
      seoDescription: original.seoDescription,
      readingTimeMinutes: original.readingTimeMinutes,
      createdByUserId: original.createdByUserId,
      tags: { create: original.tags.map((t) => ({ tagId: t.tagId })) },
    },
  })

  revalidatePath('/admin/articles')
  return { id: copy.id }
}
