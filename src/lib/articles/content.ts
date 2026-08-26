import 'server-only'
import type { JSONContent } from '@tiptap/core'
import { renderToHTMLString } from '@tiptap/static-renderer/pm/html-string'
import StarterKit from '@tiptap/starter-kit'
import Youtube from '@tiptap/extension-youtube'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import sanitizeHtml from 'sanitize-html'
import { ArticleImage } from '@/components/admin/editor/extensions/ArticleImage'
import { PullQuote } from '@/components/admin/editor/extensions/PullQuote'

// Server-side rendering of the same schema the editor uses (extensions'
// renderHTML methods only — React-specific addNodeView is never invoked
// here). Keep this list in sync with RichTextEditor.tsx.
const ARTICLE_SCHEMA_EXTENSIONS = [
  StarterKit,
  Youtube,
  Table,
  TableRow,
  TableHeader,
  TableCell,
  ArticleImage,
  PullQuote,
]

// Allowlist matched exactly to what ARTICLE_SCHEMA_EXTENSIONS can produce.
// Never widen this without widening the editor's schema to match — this is
// the actual XSS boundary for anything rendered on the public site.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'h2',
    'h3',
    'strong',
    'em',
    'u',
    's',
    'a',
    'code',
    'pre',
    'ul',
    'ol',
    'li',
    'blockquote',
    'aside',
    'hr',
    'figure',
    'figcaption',
    'img',
    'span',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'iframe',
    'br',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt'],
    figure: ['data-type', 'class'],
    span: ['class'],
    aside: ['data-type'],
    iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan'],
  },
  allowedClasses: {
    figure: [/^align-(left|center|right|wide)$/],
    span: ['caption', 'credit'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow' }),
  },
}

export function articleJsonToSanitizedHtml(json: JSONContent): string {
  const rawHtml = renderToHTMLString({ content: json, extensions: ARTICLE_SCHEMA_EXTENSIONS })
  return sanitizeHtml(rawHtml, SANITIZE_OPTIONS)
}

export function extractPlainText(json: JSONContent): string {
  const html = renderToHTMLString({ content: json, extensions: ARTICLE_SCHEMA_EXTENSIONS })
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
}

const WORDS_PER_MINUTE = 200

export function estimateReadingTimeMinutes(json: JSONContent): number {
  const text = extractPlainText(json).trim()
  if (!text) return 1
  const wordCount = text.split(/\s+/).length
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE))
}
