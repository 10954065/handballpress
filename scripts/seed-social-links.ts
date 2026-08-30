// One-off: sets the site-wide social links shown in the header/footer.
// Usage: npx tsx scripts/seed-social-links.ts
import { config as loadEnv } from 'dotenv'
loadEnv({ path: '.env.local', quiet: true })

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'
import { SocialPlatform } from '@/generated/prisma/enums'

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const db = new PrismaClient({ adapter })

  const links = [
    {
      platform: SocialPlatform.FACEBOOK,
      url: 'https://www.facebook.com/share/1LtE1qyvRW/',
      order: 0,
    },
    { platform: SocialPlatform.X, url: 'https://x.com/HandballPressGH', order: 1 },
    {
      platform: SocialPlatform.INSTAGRAM,
      url: 'https://www.instagram.com/handballpressgh',
      order: 2,
    },
    { platform: SocialPlatform.TIKTOK, url: 'https://www.tiktok.com/@handballpressgh', order: 3 },
    {
      platform: SocialPlatform.YOUTUBE,
      url: 'https://youtube.com/@handballpressgh',
      order: 4,
    },
  ]

  for (const link of links) {
    const result = await db.socialLink.upsert({
      where: { platform: link.platform },
      update: { url: link.url, order: link.order, isActive: true },
      create: { platform: link.platform, url: link.url, order: link.order, isActive: true },
    })
    console.log('Upserted', result.platform, result.url)
  }

  await db.$disconnect()
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
