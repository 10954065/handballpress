// WordPress serves plain-text-ish fields (title, excerpt) with HTML
// entities intact — both named (`&amp;`) and the numeric character
// references its `wptexturize` pass generates for typographic punctuation
// (`&#8217;` for a curly apostrophe, `&#8211;` for an en dash, etc). These
// values are stored as plain strings and rendered as React text content
// (which escapes on the way out), so they need to be *fully* decoded to
// real Unicode here — passing them through an HTML sanitizer instead would
// leave `&amp;` re-escaped, since sanitizers assume their output is HTML.
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  '#039': "'",
  nbsp: ' ',
}

export function decodeHtmlEntities(text: string): string {
  return text.replace(/&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity.startsWith('#x')) return String.fromCodePoint(parseInt(entity.slice(2), 16))
    if (entity.startsWith('#')) return String.fromCodePoint(parseInt(entity.slice(1), 10))
    return NAMED_ENTITIES[entity] ?? match
  })
}

export function stripHtml(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  )
}
