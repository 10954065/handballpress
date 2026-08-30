// Minimal typed client for the WordPress.com public REST API (v1.1).
//
// This site (handballpressgh.wordpress.com) is WordPress.com-hosted, and
// its self-hosted-style `/wp-json/wp/v2/*` endpoints are disabled — only
// the WordPress.com-specific `public-api.wordpress.com/rest/v1.1/sites/...`
// surface is reachable, confirmed by probing both before writing this file.
// It needs no auth token for a public site's published content.

const API_BASE = 'https://public-api.wordpress.com/rest/v1.1'

export interface WpTerm {
  ID: number
  name: string
  slug: string
}

export interface WpAttachment {
  ID: number
  URL: string
  guid: string
  mime_type: string
  alt?: string
  caption?: string
  description?: string
}

export interface WpAuthor {
  ID: number
  name: string
  nice_name: string
  email: string | false
}

export interface WpPost {
  ID: number
  URL: string
  slug: string
  status: string
  title: string
  excerpt: string
  content: string
  date: string
  modified: string
  author: WpAuthor
  categories: Record<string, WpTerm>
  tags: Record<string, WpTerm>
  featured_image: string
  post_thumbnail: { ID: number; URL: string } | null
  attachments: Record<string, WpAttachment>
}

interface PostsResponse {
  found: number
  posts: WpPost[]
}

function siteUrl(path: string): string {
  return `${API_BASE}/sites/handballpressgh.wordpress.com${path}`
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`WordPress API request failed (${response.status}): ${url}`)
  }
  return (await response.json()) as T
}

const PAGE_SIZE = 100

export async function fetchPostBySlug(slug: string): Promise<WpPost> {
  return fetchJson<WpPost>(siteUrl(`/posts/slug:${slug}`))
}

export async function fetchAllPublishedPosts(): Promise<WpPost[]> {
  const posts: WpPost[] = []
  let offset = 0

  for (;;) {
    const page = await fetchJson<PostsResponse>(
      siteUrl(`/posts/?number=${PAGE_SIZE}&offset=${offset}&status=publish`)
    )
    posts.push(...page.posts)
    offset += PAGE_SIZE
    if (offset >= page.found || page.posts.length === 0) break
  }

  return posts
}
