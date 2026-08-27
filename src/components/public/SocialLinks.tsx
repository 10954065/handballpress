import Link from 'next/link'
import { SocialPlatform } from '@/generated/prisma/enums'
import {
  FacebookIcon,
  InstagramIcon,
  XIcon,
  YoutubeIcon,
  TiktokIcon,
  WhatsappIcon,
} from './icons'

const PLATFORM_ICON: Record<SocialPlatform, React.ComponentType<{ className?: string }>> = {
  [SocialPlatform.FACEBOOK]: FacebookIcon,
  [SocialPlatform.INSTAGRAM]: InstagramIcon,
  [SocialPlatform.X]: XIcon,
  [SocialPlatform.YOUTUBE]: YoutubeIcon,
  [SocialPlatform.TIKTOK]: TiktokIcon,
  [SocialPlatform.WHATSAPP]: WhatsappIcon,
}

const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  [SocialPlatform.FACEBOOK]: 'Facebook',
  [SocialPlatform.INSTAGRAM]: 'Instagram',
  [SocialPlatform.X]: 'X (Twitter)',
  [SocialPlatform.YOUTUBE]: 'YouTube',
  [SocialPlatform.TIKTOK]: 'TikTok',
  [SocialPlatform.WHATSAPP]: 'WhatsApp',
}

interface SocialLinksProps {
  links: { platform: SocialPlatform; url: string }[]
  className?: string
}

export function SocialLinks({ links, className }: SocialLinksProps) {
  if (links.length === 0) return null

  return (
    <ul className={`flex items-center gap-3 ${className ?? ''}`}>
      {links.map((link) => {
        const Icon = PLATFORM_ICON[link.platform]
        return (
          <li key={link.platform}>
            <Link
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={PLATFORM_LABEL[link.platform]}
              className="transition-opacity hover:opacity-60"
            >
              <Icon className="size-5" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
