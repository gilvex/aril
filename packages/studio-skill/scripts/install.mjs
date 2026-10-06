import { access, mkdir, readFile, copyFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const source = fileURLToPath(new URL('../SKILL.md', import.meta.url))
const destination = join(
  process.env.CODEX_HOME || join(homedir(), '.codex'),
  'skills',
  'pomegranate-studio',
)
const target = join(destination, 'SKILL.md')
let exists = false
try {
  await access(target)
  exists = true
} catch {
  /* New skill. */
}
if (
  exists &&
  (await readFile(target, 'utf8')) !== (await readFile(source, 'utf8'))
) {
  throw new Error(
    `An existing skill differs at ${target}. Review it before replacing it; no files changed.`,
  )
}
await mkdir(destination, { recursive: true })
if (!exists) await copyFile(source, target)
console.log(
  `Pomegranate studio skill installed at ${destination}. Open a new chat to discover it.`,
)
