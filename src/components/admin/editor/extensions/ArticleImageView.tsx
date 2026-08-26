import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { ArticleImage, IMAGE_ALIGNMENTS, type ArticleImageAttrs } from './ArticleImage'

function ArticleImageComponent({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, caption, credit, align } = node.attrs as ArticleImageAttrs

  return (
    <NodeViewWrapper
      className={['article-image-node', `align-${align}`, selected && 'is-selected']
        .filter(Boolean)
        .join(' ')}
      data-align={align}
    >
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element -- editor preview only; public rendering uses next/image */}
        <img src={src} alt={alt ?? ''} />
        <figcaption>
          <input
            type="text"
            value={caption ?? ''}
            placeholder="Add a caption (optional)"
            onChange={(event) => updateAttributes({ caption: event.target.value || null })}
          />
          <input
            type="text"
            value={credit ?? ''}
            placeholder="Credit (optional)"
            onChange={(event) => updateAttributes({ credit: event.target.value || null })}
          />
        </figcaption>
      </figure>
      <div className="article-image-align-controls" contentEditable={false}>
        {IMAGE_ALIGNMENTS.map((option) => (
          <button
            key={option}
            type="button"
            data-active={align === option}
            onClick={() => updateAttributes({ align: option })}
          >
            {option}
          </button>
        ))}
      </div>
    </NodeViewWrapper>
  )
}

// Client-only: extends the schema-only ArticleImage with a React NodeView.
// Import this from RichTextEditor.tsx; server code (content.ts) must keep
// importing the plain ArticleImage from ArticleImage.ts.
export const ArticleImageWithView = ArticleImage.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ArticleImageComponent)
  },
})
