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

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

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
  // Forces every subresource/navigation to HTTPS — correct in production,
  // but `next dev` serves plain HTTP. WebKit (unlike Chromium's dev-mode
  // networking stack) actually honors this on localhost and force-upgrades
  // the next navigation to https://localhost, which then hangs since there
  // is no TLS listener there — breaks Safari/WebKit E2E runs against dev.
  ...(IS_PRODUCTION ? ['upgrade-insecure-requests'] : []),
].join('; ')

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
  // Same HTTPS-only concern as upgrade-insecure-requests above — only ever
  // meaningful (and safe to send) once the site is actually served over TLS.
  ...(IS_PRODUCTION
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }]
    : []),
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
