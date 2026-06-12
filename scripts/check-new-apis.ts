/**
 * After `build:catalog` regenerates `src/data/catalog.json`, this script
 * diffs the result against what's tracked in git and prints a markdown
 * summary used by the weekly refresh-catalog workflow's PR body.
 *
 * Exit codes:
 *   0 — no meaningful changes
 *   1 — at least one new API was added / Baseline status moved
 */
import {execSync} from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import type {Catalog} from '../src/lib/types.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

async function loadGitVersion(file: string): Promise<Catalog | null> {
  try {
    const txt = execSync(`git show HEAD:${file}`, {cwd: ROOT, encoding: 'utf8'})
    return JSON.parse(txt) as Catalog
  } catch {
    return null
  }
}

async function main() {
  const localPath = 'src/data/catalog.json'
  const localTxt = await fs.readFile(path.join(ROOT, localPath), 'utf8')
  const local = JSON.parse(localTxt) as Catalog
  const remote = await loadGitVersion(localPath)

  if (!remote) {
    console.log('## Catalog initialized\n')
    console.log(`- ${local.entries.length} entries`)
    console.log(`- BCD ${local.bcdVersion}`)
    console.log(`- web-features ${local.webFeaturesVersion}`)
    process.exit(0)
  }

  const remoteIds = new Map(remote.entries.map((e) => [e.id, e]))
  const localIds = new Map(local.entries.map((e) => [e.id, e]))

  const added = local.entries.filter((e) => !remoteIds.has(e.id))
  const removed = remote.entries.filter((e) => !localIds.has(e.id))
  const baselineShifts = local.entries
    .map((e) => {
      const prev = remoteIds.get(e.id)
      if (!prev || prev.baseline === e.baseline) return null
      return {id: e.id, title: e.title, was: prev.baseline, is: e.baseline}
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

  const versionChanged =
    local.bcdVersion !== remote.bcdVersion ||
    local.webFeaturesVersion !== remote.webFeaturesVersion

  const lines: string[] = []

  if (versionChanged) {
    lines.push(
      `### Data sources`,
      `- BCD: \`${remote.bcdVersion}\` → \`${local.bcdVersion}\``,
      `- web-features: \`${remote.webFeaturesVersion}\` → \`${local.webFeaturesVersion}\``,
      ''
    )
  }

  if (added.length) {
    lines.push(`### New APIs in catalog (${added.length})`)
    for (const e of added) lines.push(`- \`${e.id}\` — ${e.title} (${e.category}, ${e.baseline})`)
    lines.push('')
  }
  if (removed.length) {
    lines.push(`### Removed (${removed.length})`)
    for (const e of removed) lines.push(`- \`${e.id}\``)
    lines.push('')
  }
  if (baselineShifts.length) {
    lines.push(`### Baseline status moved (${baselineShifts.length})`)
    for (const s of baselineShifts) lines.push(`- ${s.title} \`${s.id}\`: ${s.was} → **${s.is}**`)
    lines.push('')
  }

  if (lines.length === 0) {
    console.log('No catalog changes.')
    process.exit(0)
  }

  // Print summary for PR body
  console.log(lines.join('\n'))

  // Always exit 1 so CI can branch on "should open a PR"
  process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
