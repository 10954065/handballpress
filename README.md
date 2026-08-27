# Handball Press GH

A Next.js/Prisma/PostgreSQL newsroom platform for [Handball Press GH](https://handballpressgh.wordpress.com/), migrated from WordPress.com. Full CMS (articles, categories, tags, authors, media library, scheduled publishing), public site with SEO/RSS/sitemap, advertising, and a newsletter — deployed on Vercel with Neon Postgres and Vercel Blob.

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack, React 19)
- **Database:** PostgreSQL via [Neon](https://neon.tech), accessed through Prisma 7 with the `@prisma/adapter-pg` driver adapter
- **Storage:** Vercel Blob (media library)
- **Email:** [Resend](https://resend.com) (newsletter welcome emails)
- **Editor:** TipTap (rich-text article editor)
- **Styling:** Tailwind CSS v4
- **Auth:** Custom session-cookie auth (Argon2 password hashing, no third-party auth provider)
- **Testing:** Vitest (unit) + Playwright (E2E)

## Local setup

1. Copy `.env.example` to `.env.local` and fill in the values. At minimum you need `DATABASE_URL` (+ `DATABASE_URL_UNPOOLED` for migrations), `SESSION_SECRET`, and `BLOB_READ_WRITE_TOKEN`. Everything else (`RESEND_API_KEY`, `CRON_SECRET`, analytics IDs) is optional and degrades gracefully when unset — see the comments in `.env.example`.
2. Install dependencies: `npm install`
3. Apply the schema: `npm run db:migrate`
4. (Optional) Seed an initial admin user by setting `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` in `.env.local`, then `npm run db:seed`
5. `npm run dev` and open [http://localhost:3000](http://localhost:3000). Admin is at `/admin/login`.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Standard Next.js dev/build/start |
| `npm run lint` / `typecheck` / `format` / `format:check` | Code quality gates |
| `npm run test` / `test:coverage` | Vitest unit tests |
| `npm run test:e2e` / `test:e2e:ui` | Playwright E2E (spins up `build && start` unless a server is already running on :3000) |
| `npm run db:migrate` / `db:generate` / `db:seed` / `db:studio` | Prisma workflows |
| `npm run migrate:wordpress` | One-off WordPress content migration — see below |

## Deployment (Vercel)

1. Provision **Neon Postgres** and **Vercel Blob** through the Vercel Marketplace/dashboard so their env vars are injected automatically; add the rest of `.env.example`'s vars in the project's Environment Variables settings.
2. `CRON_SECRET`: generate with `openssl rand -hex 16` and set it — `vercel.ts` already registers `/api/cron/publish-scheduled` on a daily schedule (Hobby plan's cron frequency cap; scheduled articles also lazily self-publish when their time passes and a public read path is hit, so this cron is a safety net, not the only path).
3. `RESEND_API_KEY`/`EMAIL_FROM`: optional. Without them, newsletter signups still succeed; only the best-effort welcome email is skipped (logged, not thrown).
4. Run `npm run db:seed` once against the production database (or set `SEED_ADMIN_*` and let it run as part of your deploy pipeline) to create the first admin login.
5. Security headers (CSP, HSTS, etc.) and `X-Powered-By` suppression are configured in `next.config.ts` — no extra dashboard config needed. The CSP intentionally allows inline scripts/styles and any HTTPS iframe source because `Advertisement.embedHtml` (admin-only field) accepts arbitrary third-party ad-network embed codes whose exact requirements aren't known at deploy time.
6. **Vercel Analytics** and **Speed Insights** are wired in (`src/app/layout.tsx`) and need no configuration — they activate automatically once deployed on Vercel.

### Database backups

Neon provides point-in-time recovery and branching as a managed feature — configure retention in the Neon dashboard rather than rolling custom backup tooling here.

## WordPress migration

`scripts/wordpress-migration/migrate.ts` is a standalone, idempotent script (upserts keyed off stable WordPress IDs) that pulls posts/categories/tags/authors/media from the WordPress.com REST API and imports them, rewriting inline images into the site's article-image format and setting up 301 redirects from old post URLs. Run with `npm run migrate:wordpress -- --dry-run` first, then without the flag; `--limit=N` caps how many posts it processes. Re-running it is safe — matching content is updated in place, not duplicated. Migration outcomes are visible at `/admin/migration`.

## Known follow-ups (not blockers)

Flagged during development as deliberate scope decisions rather than oversights:

- No admin UI yet for `BreakingNewsItem` or `SocialLink` — edit via `npm run db:studio` in the interim.
- The New Article form's tag picker is a plain checkbox list; at 175+ tags (post-migration) a searchable picker would be a meaningful UX improvement.
- The `SIDEBAR` ad placement is defined but unused — no sidebar layout exists yet.
- Newsletter sending is limited to the signup welcome email; there's no campaign/digest composer.
- No error-tracking/observability service (e.g. Sentry) is integrated. Vercel's own function logs and the Analytics/Speed Insights above cover the basics; adding a dedicated error tracker requires provisioning an account through the Vercel Marketplace (or directly) and is a reasonable next step.
