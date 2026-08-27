'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { JSONContent } from '@tiptap/react'
import { RichTextEditor } from '@/components/admin/editor/RichTextEditor'
import { createArticle, updateArticle, type ArticleActionState } from '@/lib/articles/actions'
import { FeaturedImagePicker } from './FeaturedImagePicker'
import { TagPicker } from './TagPicker'
import { SeoPreview } from './SeoPreview'

interface Option {
  id: string
  name: string
}

interface MediaOption {
  id: string
  url: string
  altText: string | null
}

interface ExistingArticle {
  id: string
  title: string
  slug: string
  excerpt: string | null
  contentJson: JSONContent
  categoryId: string
  authorId: string
  tagIds: string[]
  featuredImageId: string | null
  seoTitle: string | null
  seoDescription: string | null
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'
  scheduledFor: string | null
}

interface ArticleFormProps {
  categories: Option[]
  authors: Option[]
  tags: Option[]
  media: MediaOption[]
  canPublish: boolean
  article?: ExistingArticle
}

const EMPTY_DOC: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] }
const initialState: ArticleActionState = {}

const FIELD =
  'border-line bg-paper-raised focus-visible:ring-blue w-full rounded-sm border px-3 py-2 text-sm outline-none focus-visible:ring-2'
const LABEL = 'text-ink text-sm font-semibold'
const PANEL = 'border-line bg-paper-raised rounded-sm border p-4'
const PANEL_TITLE = 'text-gold-dark mb-3 text-xs font-bold tracking-[0.14em] uppercase'

function toDatetimeLocal(value: string | null): string {
  if (!value) return ''
  return value.slice(0, 16)
}

export function ArticleForm({
  categories,
  authors,
  tags,
  media,
  canPublish,
  article,
}: ArticleFormProps) {
  const router = useRouter()
  const action = article ? updateArticle : createArticle
  const [content, setContent] = useState<JSONContent>(article?.contentJson ?? EMPTY_DOC)
  const [featuredImageId, setFeaturedImageId] = useState(article?.featuredImageId ?? '')
  const [publishMode, setPublishMode] = useState<'draft' | 'now' | 'schedule'>(
    article?.status === 'PUBLISHED' ? 'now' : article?.status === 'SCHEDULED' ? 'schedule' : 'draft'
  )

  const [title, setTitle] = useState(article?.title ?? '')
  const [slug, setSlug] = useState(article?.slug ?? '')
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '')
  const [seoTitle, setSeoTitle] = useState(article?.seoTitle ?? '')
  const [seoDescription, setSeoDescription] = useState(article?.seoDescription ?? '')

  const featuredImageUrl = media.find((item) => item.id === featuredImageId)?.url ?? null

  const [state, formAction, isPending] = useActionState(
    async (prevState: ArticleActionState, formData: FormData) => {
      const result = await action(prevState, formData)
      if (result.success) router.push('/admin/articles')
      return result
    },
    initialState
  )

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:items-start"
    >
      {article && <input type="hidden" name="id" value={article.id} />}
      <input type="hidden" name="contentJson" value={JSON.stringify(content)} readOnly />

      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className={LABEL}>
            Title
          </label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className={`${FIELD} font-serif text-xl font-semibold`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="slug" className={LABEL}>
            Slug <span className="text-muted font-normal">(optional)</span>
          </label>
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="auto from title"
            className={FIELD}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="excerpt" className={LABEL}>
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            rows={2}
            maxLength={500}
            className={FIELD}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={LABEL}>Content</span>
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        {state.error && <p className="text-error text-sm">{state.error}</p>}
      </div>

      <div className="flex flex-col gap-6 lg:sticky lg:top-24">
        <div className={PANEL}>
          <p className={PANEL_TITLE}>Publishing</p>
          <div className="flex flex-col gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="publishMode"
                value="draft"
                checked={publishMode === 'draft'}
                onChange={() => setPublishMode('draft')}
                className="accent-blue"
              />
              Save as draft
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="publishMode"
                value="now"
                checked={publishMode === 'now'}
                disabled={!canPublish}
                onChange={() => setPublishMode('now')}
                className="accent-blue"
              />
              Publish now
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="publishMode"
                value="schedule"
                checked={publishMode === 'schedule'}
                disabled={!canPublish}
                onChange={() => setPublishMode('schedule')}
                className="accent-blue"
              />
              Schedule
            </label>
          </div>
          {!canPublish && (
            <p className="text-muted mt-2 text-xs">
              Only editors and admins can publish or schedule articles.
            </p>
          )}
          {publishMode === 'schedule' && (
            <div className="mt-3 flex flex-col gap-1.5">
              <label htmlFor="scheduledFor" className="text-muted text-xs font-medium">
                Publish at (GMT — matches Ghana time)
              </label>
              <input
                id="scheduledFor"
                name="scheduledFor"
                type="datetime-local"
                defaultValue={toDatetimeLocal(article?.scheduledFor ?? null)}
                className={FIELD}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="bg-navy hover:bg-blue-dark mt-4 w-full rounded-sm px-4 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-60"
          >
            {isPending ? 'Saving…' : article ? 'Save changes' : 'Create article'}
          </button>
        </div>

        <div className={PANEL}>
          <p className={PANEL_TITLE}>Featured image</p>
          <input type="hidden" name="featuredImageId" value={featuredImageId} />
          <FeaturedImagePicker
            media={media}
            value={featuredImageId}
            onChange={setFeaturedImageId}
          />
        </div>

        <div className={PANEL}>
          <p className={PANEL_TITLE}>Category &amp; author</p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="categoryId" className={LABEL}>
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={article?.categoryId}
                required
                className={FIELD}
              >
                <option value="" disabled>
                  Choose a category
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="authorId" className={LABEL}>
                Author
              </label>
              <select
                id="authorId"
                name="authorId"
                defaultValue={article?.authorId}
                required
                className={FIELD}
              >
                <option value="" disabled>
                  Choose an author
                </option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={PANEL}>
          <p className={PANEL_TITLE}>Tags</p>
          <TagPicker tags={tags} defaultSelectedIds={article?.tagIds} />
        </div>

        <div className={PANEL}>
          <p className={PANEL_TITLE}>SEO</p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="seoTitle" className="text-muted text-xs font-medium">
                SEO title
              </label>
              <input
                id="seoTitle"
                name="seoTitle"
                value={seoTitle}
                onChange={(event) => setSeoTitle(event.target.value)}
                maxLength={70}
                className={FIELD}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="seoDescription" className="text-muted text-xs font-medium">
                Meta description
              </label>
              <textarea
                id="seoDescription"
                name="seoDescription"
                value={seoDescription}
                onChange={(event) => setSeoDescription(event.target.value)}
                maxLength={200}
                rows={2}
                className={FIELD}
              />
            </div>
          </div>
          <div className="border-line mt-4 border-t pt-4">
            <SeoPreview
              title={seoTitle || title}
              description={seoDescription || excerpt}
              slug={slug}
              imageUrl={featuredImageUrl}
            />
          </div>
        </div>
      </div>
    </form>
  )
}
