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
