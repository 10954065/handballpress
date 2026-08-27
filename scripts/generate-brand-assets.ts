// Regenerates the site's favicon/OG image set from public/logo-512.png.
//
// Usage:
//   npx tsx scripts/generate-brand-assets.ts
//
// Run this again after replacing the source logo to refresh every derived
// asset (favicon.ico, favicon PNGs, apple touch icon, social preview image).
import path from 'node:path'
import fs from 'node:fs'
import sharp from 'sharp'

const ROOT = path.join(__dirname, '..')
const LOGO = path.join(ROOT, 'public', 'logo-512.png')

async function buildFaviconIco() {
  const sizes = [16, 32, 48]
  const pngBuffers = await Promise.all(
    sizes.map((size) =>
      sharp(LOGO)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
    )
  )

  const headerSize = 6
  const dirEntrySize = 16
  let offset = headerSize + dirEntrySize * sizes.length

  const header = Buffer.alloc(headerSize)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(sizes.length, 4) // image count

  const dirEntries: Buffer[] = []
  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i]
    const buf = pngBuffers[i]
    const entry = Buffer.alloc(dirEntrySize)
    entry.writeUInt8(size === 256 ? 0 : size, 0) // width
    entry.writeUInt8(size === 256 ? 0 : size, 1) // height
    entry.writeUInt8(0, 2) // color count
    entry.writeUInt8(0, 3) // reserved
    entry.writeUInt16LE(1, 4) // planes
    entry.writeUInt16LE(32, 6) // bit count
    entry.writeUInt32LE(buf.length, 8) // bytes in resource
    entry.writeUInt32LE(offset, 12) // offset
    offset += buf.length
    dirEntries.push(entry)
  }

  const ico = Buffer.concat([header, ...dirEntries, ...pngBuffers])
  const outPath = path.join(ROOT, 'src', 'app', 'favicon.ico')
  fs.writeFileSync(outPath, ico)
  console.log('Wrote', outPath, ico.length, 'bytes')
}

async function buildFaviconPngs() {
  const targets = [
    { file: 'favicon-16.png', size: 16, solidBg: false },
    { file: 'favicon-32.png', size: 32, solidBg: false },
    { file: 'apple-touch-icon.png', size: 180, solidBg: true },
  ]
  for (const t of targets) {
    let img = sharp(LOGO).resize(t.size, t.size, {
      fit: 'contain',
      background: t.solidBg ? { r: 255, g: 255, b: 255, alpha: 1 } : { r: 0, g: 0, b: 0, alpha: 0 },
    })
    if (t.solidBg) img = img.flatten({ background: { r: 255, g: 255, b: 255 } })
    const buf = await img.png().toBuffer()
    const outPath = path.join(ROOT, 'public', t.file)
    fs.writeFileSync(outPath, buf)
    console.log('Wrote', outPath, buf.length, 'bytes')
  }
}

async function buildOgImage() {
  const width = 1200
  const height = 630
  const navy = '#0b1b3f'
  const glow = Buffer.from(
    `<svg width="${width}" height="${height}">
      <defs>
        <radialGradient id="g" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stop-color="#1b5feb" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#1b5feb" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="g2" cx="85%" cy="15%" r="35%">
          <stop offset="0%" stop-color="#f2b705" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#f2b705" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="${navy}"/>
      <rect width="${width}" height="${height}" fill="url(#g)"/>
      <rect width="${width}" height="${height}" fill="url(#g2)"/>
    </svg>`
  )

  const logoSize = 460
  const logo = await sharp(LOGO).resize(logoSize, logoSize).png().toBuffer()

  const buf = await sharp(glow)
    .composite([
      {
        input: logo,
        left: Math.round((width - logoSize) / 2),
        top: Math.round((height - logoSize) / 2),
      },
    ])
    .png()
    .toBuffer()

  const outPath = path.join(ROOT, 'public', 'og-image.png')
  fs.writeFileSync(outPath, buf)
  console.log('Wrote', outPath, buf.length, 'bytes')
}

async function main() {
  await buildFaviconIco()
  await buildFaviconPngs()
  await buildOgImage()
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
