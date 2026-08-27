import 'server-only'

// Actual implementation lives in render.ts, which deliberately has no
// `server-only` guard so the standalone WordPress migration script
// (scripts/migrate-wordpress.ts, run under plain tsx) can reuse the exact
// same schema, sanitizer, and reading-time logic instead of duplicating it.
export { articleJsonToSanitizedHtml, extractPlainText, estimateReadingTimeMinutes } from './render'
