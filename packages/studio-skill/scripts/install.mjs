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
  if (!process.argv.includes('--update')) {
    throw new Error(
      `An existing skill differs at ${target}. Review it, then run pnpm skill:install --update to replace it with a backup; no files changed.`,
    )
  }
  const backup = `${target}.${Date.now()}.bak`
  await copyFile(target, backup)
  await copyFile(source, target)
  console.log(`Previous skill backed up at ${backup}.`)
}
await mkdir(destination, { recursive: true })
if (!exists) await copyFile(source, target)
console.log(
  `Aril studio skill installed at ${destination}. Open a new chat to discover it.`,
)
