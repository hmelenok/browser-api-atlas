/**
 * Generate public/sitemap.xml from the catalog so every API URL becomes
 * discoverable by Google + other search engines.
 *
 * Runs after build-catalog as part of `npm run build`.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const BASE = 'https://hmelenok.github.io/browser-api-atlas'

interface Catalog {
  entries: Array<{id: string; baseline: string}>
}

async function main() {
  const catalogPath = path.join(ROOT, 'src/data/catalog.json')
  const catalog: Catalog = JSON.parse(await fs.readFile(catalogPath, 'utf8'))
  const today = new Date().toISOString().split('T')[0]

  const urls: string[] = [
    `  <url>
    <loc>${BASE}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`,
  ]

  for (const e of catalog.entries) {
    const loc = `${BASE}/?api=${encodeURIComponent(e.id)}`
    // Widely-Baseline APIs are the stable, high-traffic search targets
    const priority = e.baseline === 'widely' ? '0.8' : '0.6'
    urls.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`)
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`

  const out = path.join(ROOT, 'public/sitemap.xml')
  await fs.writeFile(out, sitemap)
  console.log(`✓ sitemap.xml: ${catalog.entries.length + 1} URLs → public/sitemap.xml`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
