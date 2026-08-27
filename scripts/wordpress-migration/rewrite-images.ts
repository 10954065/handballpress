import { JSDOM } from 'jsdom'
import type { ImageAlignment } from '@/components/admin/editor/extensions/ArticleImage'
import type { WpAttachment } from './wp-api-client'

// WordPress serves resized variants of the same original via a `?w=NNN`
// query string (its "Photon" image service) — strip it so every size of
// the same photo maps to one dedup key and we download the original once.
export function stripResizeQuery(url: string): string {
  try {
    const parsed = new URL(url)
    parsed.search = ''
    return parsed.toString()
  } catch {
    return url
  }
}

function findAttachmentForUrl(url: string, attachments: WpAttachment[]): WpAttachment | undefined {
  const clean = stripResizeQuery(url)
  return attachments.find(
    (attachment) =>
      stripResizeQuery(attachment.URL) === clean || stripResizeQuery(attachment.guid) === clean
  )
}

function detectAlignment(classList: DOMTokenList): ImageAlignment {
  if (classList.contains('alignleft')) return 'left'
  if (classList.contains('alignright')) return 'right'
  if (classList.contains('alignwide') || classList.contains('alignfull')) return 'wide'
  return 'center'
}

export interface ResolvedMedia {
  mediaId: string
  url: string
}

export interface RewriteResult {
  html: string
  mediaIds: string[]
}

/**
 * Rewrites every <img> (bare or inside a <figure>) found in imported
 * WordPress post HTML into this project's `figure[data-type="article-image"]`
 * shape, so ArticleImage.parseHTML (and therefore htmlToArticleJson) picks
 * it up as a real, editable articleImage node instead of silently dropping
 * it — see ArticleImage.ts's parseHTML for why a plain <figure>/<img> with
 * no matching tag rule disappears when TipTap parses HTML into a document.
 *
 * `resolveMedia` does the actual download+upload — kept as a callback so
 * this module stays pure DOM manipulation and the caller owns Prisma
 * access and dedup-by-wordpressAttachmentId.
 */
export async function rewriteContentImages(
  html: string,
  attachments: WpAttachment[],
  resolveMedia: (cleanUrl: string, attachment: WpAttachment | undefined) => Promise<ResolvedMedia>
): Promise<RewriteResult> {
  const dom = new JSDOM(`<!doctype html><body>${html}</body>`)
  const document = dom.window.document
  const mediaIds = new Set<string>()

  for (const img of Array.from(document.querySelectorAll('img'))) {
    const src = img.getAttribute('src')
    if (!src) continue

    const cleanUrl = stripResizeQuery(src)
    const attachment = findAttachmentForUrl(src, attachments)

    let resolved: ResolvedMedia
    try {
      resolved = await resolveMedia(cleanUrl, attachment)
    } catch (error) {
      console.warn(`    ! skipping image ${cleanUrl}: ${(error as Error).message}`)
      continue
    }
    mediaIds.add(resolved.mediaId)

    const containingFigure = img.closest('figure')
    const align = detectAlignment((containingFigure ?? img).classList)
    const altText = img.getAttribute('alt') || attachment?.alt || ''
    const captionText =
      containingFigure?.querySelector('figcaption')?.textContent?.trim() ||
      attachment?.caption ||
      ''

    const figure = document.createElement('figure')
    figure.setAttribute('data-type', 'article-image')
    figure.className = `align-${align}`

    const newImg = document.createElement('img')
    newImg.setAttribute('src', resolved.url)
    if (altText) newImg.setAttribute('alt', altText)
    figure.appendChild(newImg)

    if (captionText) {
      const figcaption = document.createElement('figcaption')
      const captionSpan = document.createElement('span')
      captionSpan.className = 'caption'
      captionSpan.textContent = captionText
      figcaption.appendChild(captionSpan)
      figure.appendChild(figcaption)
    }

    ;(containingFigure ?? img).replaceWith(figure)
  }

  return { html: document.body.innerHTML, mediaIds: [...mediaIds] }
}
