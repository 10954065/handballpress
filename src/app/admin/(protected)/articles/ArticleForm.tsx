'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { JSONContent } from '@tiptap/react'
import { RichTextEditor } from '@/components/admin/editor/RichTextEditor'
import { createArticle, updateArticle, type ArticleActionState } from '@/lib/articles/actions'
import { FeaturedImagePicker } from './FeaturedImagePicker'

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

  const [state, formAction, isPending] = useActionState(
    async (prevState: ArticleActionState, formData: FormData) => {
      const result = await action(prevState, formData)
      if (result.success) router.push('/admin/articles')
      return result
    },
    initialState
  )

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {article && <input type="hidden" name="id" value={article.id} />}
      <input type="hidden" name="contentJson" value={JSON.stringify(content)} readOnly />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          defaultValue={article?.title}
          required
          className="rounded-md border border-neutral-300 px-3 py-2 text-lg font-semibold dark:border-neutral-700 dark:bg-transparent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="slug" className="text-sm font-medium">
          Slug (optional)
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={article?.slug}
          placeholder="auto from title"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-transparent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="excerpt" className="text-sm font-medium">
          Excerpt
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          defaultValue={article?.excerpt ?? ''}
          rows={2}
          maxLength={500}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-transparent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Content</span>
        <RichTextEditor content={content} onChange={setContent} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="categoryId" className="text-sm font-medium">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={article?.categoryId}
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-transparent"
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
          <label htmlFor="authorId" className="text-sm font-medium">
            Author
          </label>
          <select
            id="authorId"
            name="authorId"
            defaultValue={article?.authorId}
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-transparent"
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

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Tags</span>
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                name="tagIds"
                value={tag.id}
                defaultChecked={article?.tagIds.includes(tag.id)}
              />
              {tag.name}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Featured image</span>
        <input type="hidden" name="featuredImageId" value={featuredImageId} />
        <FeaturedImagePicker media={media} value={featuredImageId} onChange={setFeaturedImageId} />
      </div>

      <fieldset className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <legend className="px-1 text-sm font-medium">SEO</legend>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="seoTitle" className="text-xs text-neutral-500">
            SEO title
          </label>
          <input
            id="seoTitle"
            name="seoTitle"
            defaultValue={article?.seoTitle ?? ''}
            maxLength={70}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-transparent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="seoDescription" className="text-xs text-neutral-500">
            Meta description
          </label>
          <textarea
            id="seoDescription"
            name="seoDescription"
            defaultValue={article?.seoDescription ?? ''}
            maxLength={200}
            rows={2}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-transparent"
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <legend className="px-1 text-sm font-medium">Publishing</legend>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="publishMode"
              value="draft"
              checked={publishMode === 'draft'}
              onChange={() => setPublishMode('draft')}
            />
            Save as draft
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="publishMode"
              value="now"
              checked={publishMode === 'now'}
              disabled={!canPublish}
              onChange={() => setPublishMode('now')}
            />
            Publish now
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="publishMode"
              value="schedule"
              checked={publishMode === 'schedule'}
              disabled={!canPublish}
              onChange={() => setPublishMode('schedule')}
            />
            Schedule
          </label>
        </div>
        {!canPublish && (
          <p className="text-xs text-neutral-500">
            Only editors and admins can publish or schedule articles.
          </p>
        )}
        {publishMode === 'schedule' && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="scheduledFor" className="text-xs text-neutral-500">
              Publish at (GMT — matches Ghana time)
            </label>
            <input
              id="scheduledFor"
              name="scheduledFor"
              type="datetime-local"
              defaultValue={toDatetimeLocal(article?.scheduledFor ?? null)}
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-transparent"
            />
          </div>
        )}
      </fieldset>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-foreground text-background rounded-md px-5 py-2 text-sm font-medium disabled:opacity-60"
        >
          {isPending ? 'Saving…' : article ? 'Save changes' : 'Create article'}
        </button>
      </div>
    </form>
  )
}
