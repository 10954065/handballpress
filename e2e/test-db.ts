import { Client } from 'pg'

// Raw `pg` rather than the generated Prisma client: Playwright's test
// transform can't load Prisma 7's ESM-first client (`import.meta` fails
// under its CommonJS-style transform), and these cleanup queries are
// trivial enough not to need Prisma's type safety.
async function withClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  try {
    return await fn(client)
  } finally {
    await client.end()
  }
}

export function deleteLoginFailedAudits(entityId: string): Promise<void> {
  return withClient(async (client) => {
    await client.query('DELETE FROM "AuditLog" WHERE action = $1 AND "entityId" = $2', [
      'LOGIN_FAILED',
      entityId,
    ])
  })
}

export function deleteTestCategoriesByPrefix(prefix: string): Promise<void> {
  return withClient(async (client) => {
    await client.query('DELETE FROM "Category" WHERE name LIKE $1', [`${prefix}%`])
  })
}

export function deleteTestTagsByPrefix(prefix: string): Promise<void> {
  return withClient(async (client) => {
    await client.query('DELETE FROM "Tag" WHERE name LIKE $1', [`${prefix}%`])
  })
}

export function deleteTestAuthorsByPrefix(prefix: string): Promise<void> {
  return withClient(async (client) => {
    await client.query('DELETE FROM "AuthorProfile" WHERE name LIKE $1', [`${prefix}%`])
  })
}

export function deleteTestArticlesByPrefix(prefix: string): Promise<void> {
  return withClient(async (client) => {
    // Cascades to ArticleTag/ArticleMedia/ArticleRevision/etc. via the
    // schema's onDelete: Cascade foreign keys.
    await client.query('DELETE FROM "Article" WHERE title LIKE $1', [`${prefix}%`])
  })
}

// Matches ARGON2_OPTIONS in src/lib/auth/password.ts — that module is
// 'server-only', so it can't be imported here (see this file's header
// comment); hashing directly with the same params keeps a real login
// (Argon2 verify) exercised end-to-end rather than faking the session.
const ARGON2_OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1 }

export async function createTestUser(params: {
  email: string
  name: string
  password: string
  role: 'AUTHOR' | 'EDITOR' | 'ADMIN' | 'SUPER_ADMIN'
}): Promise<void> {
  const { hash } = await import('@node-rs/argon2')
  const passwordHash = await hash(params.password, ARGON2_OPTIONS)
  await withClient(async (client) => {
    await client.query(
      `INSERT INTO "User" (id, email, name, "passwordHash", role, "isActive", "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4::"UserRole", true, now(), now())
       ON CONFLICT (email) DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash", role = EXCLUDED.role`,
      [params.email, params.name, passwordHash, params.role]
    )
  })
}

export function deleteTestUserByEmail(email: string): Promise<void> {
  return withClient(async (client) => {
    await client.query('DELETE FROM "User" WHERE email = $1', [email])
  })
}

export async function deleteMediaByAltText(altText: string): Promise<void> {
  const { del } = await import('@vercel/blob')
  await withClient(async (client) => {
    const { rows } = await client.query<{ id: string; url: string }>(
      'SELECT id, url FROM "Media" WHERE "altText" = $1',
      [altText]
    )
    for (const row of rows) {
      await del(row.url).catch(() => undefined)
    }
    await client.query('DELETE FROM "Media" WHERE "altText" = $1', [altText])
  })
}
