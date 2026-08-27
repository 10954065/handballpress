import type { NextConfig } from 'next'

// `script-src`/`frame-src` allow inline content and any https origin rather
// than a strict allowlist: Advertisement.embedHtml (see AdSlot.tsx) lets
// ADMIN users paste arbitrary third-party ad-network embed codes — scripts,
// iframes, inline styles — and the ad network isn't known at deploy time.
// That field is already access-gated to trusted staff; this CSP still blocks
// everything else (framing the site, cross-origin form submission, plugins,
// mixed content) rather than leaving no policy at all.
// React/Turbopack's dev runtime uses eval() for HMR and dev-only debugging
// features (never in production — see the "eval() is not supported" console
// warning this fixes). Scoping 'unsafe-eval' to dev keeps the production
// policy tighter without breaking local `next dev`.
const SCRIPT_SRC =
  process.env.NODE_ENV === 'production'
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'"

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  SCRIPT_SRC,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  'frame-src https:',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ')

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }]
  },
}

export default nextConfig
