import { mergeAttributes, Node } from '@tiptap/core'

export const IMAGE_ALIGNMENTS = ['left', 'center', 'right', 'wide'] as const
export type ImageAlignment = (typeof IMAGE_ALIGNMENTS)[number]

export interface ArticleImageAttrs {
  src: string
  alt: string | null
  caption: string | null
  credit: string | null
  align: ImageAlignment
}

// Schema-only definition (no NodeView) — safe to import from server code
// (src/lib/articles/content.ts uses this for generateHTML). The client
// editor uses ArticleImage.extend({ addNodeView... }) in ArticleImageView.tsx
// instead of importing @tiptap/react here, which would pull browser-only
// code into the server bundle and crash SSR/server actions.
export const ArticleImage = Node.create({
  name: 'articleImage',
  group: 'block',
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      caption: { default: null },
      credit: { default: null },
      align: { default: 'center' },
    }
  },

  parseHTML() {
    return [{ tag: 'figure[data-type="article-image"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, caption, credit, align } = HTMLAttributes as ArticleImageAttrs
    const figcaptionChildren: unknown[] = []
    if (caption) figcaptionChildren.push(['span', { class: 'caption' }, caption])
    if (credit) figcaptionChildren.push(['span', { class: 'credit' }, credit])

    return [
      'figure',
      mergeAttributes({ 'data-type': 'article-image', class: `align-${align}` }),
      ['img', { src, alt: alt ?? '' }],
      ...(figcaptionChildren.length ? [['figcaption', {}, ...figcaptionChildren]] : []),
    ]
  },
})
