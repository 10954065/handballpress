import { Client } from 'pg'

// Raw `pg` rather than the generated Prisma client: Playwright's test
// transform can't load Prisma 7's ESM-first client (`import.meta` fails
// under its CommonJS-style transform), and this cleanup query is trivial
// enough not to need Prisma's type safety.
export async function deleteLoginFailedAudits(entityId: string): Promise<void> {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  try {
    await client.query('DELETE FROM "AuditLog" WHERE action = $1 AND "entityId" = $2', [
      'LOGIN_FAILED',
      entityId,
    ])
  } finally {
    await client.end()
  }
}
