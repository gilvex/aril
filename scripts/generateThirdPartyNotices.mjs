import { readFileSync, writeFileSync, readdirSync, copyFileSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
// Fixed command, no interpolated user input. Never loads .env or contacts the studio.
const inventory = JSON.parse(
  execSync('pnpm licenses list --prod --json', { cwd: root, encoding: 'utf8' }),
)
const entries = Object.values(inventory)
  .flat()
  .sort((a, b) => a.name.localeCompare(b.name, 'en'))
const missing = []
const output = [
  'Aril — third-party dependency notices',
  'Generated from installed production dependencies by scripts/generateThirdPartyNotices.mjs.',
  'Includes dependencies across the workspace, including server and MCP packages.',
  'Package metadata is an inventory, not a legal compatibility determination.',
  'Upstream license/notice texts below are preserved verbatim. Third-party skills are documented in docs/skills.md.',
  '',
]
for (const entry of entries) {
  output.push(
    '='.repeat(78),
    `${entry.name} — ${entry.versions.join(', ')}`,
    `Declared license: ${entry.license}`,
  )
  const texts = new Set()
  for (const packagePath of entry.paths) {
    for (const file of readdirSync(packagePath, { withFileTypes: true }).sort(
      (a, b) => a.name.localeCompare(b.name, 'en'),
    )) {
      if (
        !file.isFile() ||
        !/^(licen[cs]e|copying|notice|ofl)([.-]|$)/i.test(file.name)
      )
        continue
      const text = readFileSync(join(packagePath, file.name), 'utf8')
      if (texts.has(text)) continue
      texts.add(text)
      output.push(`--- ${file.name} ---`, text)
    }
  }
  if (
    !texts.size &&
    ['data-uri-to-buffer', 'pg-types', 'pgpass'].includes(entry.name)
  ) {
    const readme = readFileSync(join(entry.paths[0], 'README.md'), 'utf8')
    const license = readme.match(
      /(?:^|\n)(?:## License|## license|License\r?\n-+)[\s\S]*$/,
    )
    if (license && license[0].includes('Permission is hereby granted')) {
      texts.add(license[0])
      output.push('--- README.md license section ---', license[0])
    }
  }
  if (
    !texts.size &&
    entry.name === 'react-remove-scroll-bar' &&
    entry.versions.every((version) => version === '2.3.8')
  ) {
    const text = readFileSync(
      join(root, 'docs/licenses/react-remove-scroll-bar-LICENSE.txt'),
      'utf8',
    )
    texts.add(text)
    output.push(
      'Upstream license retrieved 2026-10-14 from https://raw.githubusercontent.com/theKashey/react-remove-scroll-bar/master/LICENSE (package omits license file; metadata declares MIT).',
      text,
    )
  }
  if (!texts.size) {
    missing.push(entry.name)
    output.push(
      'No root license text found in installed package. Review upstream before redistribution.',
    )
  }
}
writeFileSync(
  join(root, 'apps/studio/public/third-party-notices.txt'),
  output.join('\n') + '\n',
)
copyFileSync(
  join(root, 'LICENSE'),
  join(root, 'apps/studio/public/license.txt'),
)
console.log(
  `Generated notices for ${entries.length} packages; ${missing.length} require upstream review.`,
)
if (missing.length) console.log(missing.join('\n'))
