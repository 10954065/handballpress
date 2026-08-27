'use client'

import { useState } from 'react'
import { clientEnv } from '@/lib/env.client'
import { CheckIcon, FacebookIcon, LinkIcon, TelegramIcon, WhatsappIcon, XIcon } from './icons'

interface ArticleShareProps {
  path: string
  title: string
  className?: string
}

const COPY_FEEDBACK_MS = 2000

export function ArticleShare({ path, title, className }: ArticleShareProps) {
  const [copied, setCopied] = useState(false)
  const url = `${clientEnv.NEXT_PUBLIC_SITE_URL}${path}`
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const links = [
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      Icon: WhatsappIcon,
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: FacebookIcon,
    },
    { name: 'X', href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, Icon: XIcon },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      Icon: TelegramIcon,
    },
  ]

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), COPY_FEEDBACK_MS)
    } catch {
      // Clipboard access can be denied or unavailable (insecure context,
      // permissions) — leave the button inert rather than show a broken state.
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <span className="text-muted mr-1 text-xs font-bold tracking-[0.14em] uppercase">Share</span>
      {links.map(({ name, href, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${name}`}
          className="border-line text-ink-soft hover:border-blue hover:text-blue flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors"
        >
          <Icon className="size-4" />
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy link"
        className="border-line text-ink-soft hover:border-blue hover:text-blue flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors"
      >
        {copied ? <CheckIcon className="text-success size-4" /> : <LinkIcon className="size-4" />}
      </button>
      <span role="status" className="sr-only">
        {copied ? 'Link copied to clipboard' : ''}
      </span>
    </div>
  )
}
