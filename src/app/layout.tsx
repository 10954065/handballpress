import type { Metadata } from 'next'
import { Geist, Geist_Mono, Fraunces } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { clientEnv } from '@/lib/env.client'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['opsz', 'SOFT', 'WONK'],
})

export const metadata: Metadata = {
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: 'Hand Ball Press GH',
    template: '%s | Hand Ball Press GH',
  },
  description:
    'Play to the tune of development! Ghana handball news, match reports, interviews and features.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      {/* A raw <link> here (rather than metadata.alternates.types) sidesteps
          Next's metadata merging, which replaces a page's whole `alternates`
          object rather than deep-merging it — a page-level `alternates`
          (e.g. the homepage's canonical) would otherwise silently drop this. */}
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Handball Press GH"
          href="/feed.xml"
        />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        {/* Safe to always render — no-ops off Vercel infrastructure. On a
            real Vercel deployment both load their script from a same-origin
            path (/_vercel/insights/...), so next.config.ts's CSP needs no
            allowance for them. Locally they fall back to an external
            va.vercel-scripts.com debug script that the CSP correctly blocks
            (console noise only — not a bug, and not worth loosening the
            policy for a dev-only convenience). */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
