import { createInterface } from 'node:readline/promises'
import { Writable } from 'node:stream'
import { access } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defaultConfigPath, validateConfig, saveConfig } from '../mcp/config.ts'
import { createAgentClient } from '../mcp/server.ts'

const path = process.env.POMEGRANATE_MCP_CONFIG || defaultConfigPath()
const input = createInterface({ input: process.stdin, output: process.stdout })
let origin: string
try {
  try {
    await access(path)
    if (
      (
        await input.question(
          'Replace the existing Pomegranate MCP connection? [y/N] ',
        )
      ).toLowerCase() !== 'y'
    )
      process.exit(0)
  } catch {
    /* No saved connection yet. */
  }
  origin =
    (
      await input.question('Studio address [https://pomegrenate.vercel.app]: ')
    ).trim() || 'https://pomegrenate.vercel.app'
} finally {
  input.close()
}
process.stdout.write('Agent credential (hidden): ')
const hidden = createInterface({
  input: process.stdin,
  output: new Writable({
    write(_chunk, _encoding, done) {
      done()
    },
  }),
  terminal: true,
})
let token: string
try {
  token = (await hidden.question('')).trim()
} finally {
  hidden.close()
  process.stdout.write('\n')
}
try {
  const config = validateConfig({ origin, token })
  await createAgentClient(config)('workspace')
  await saveConfig(config, path)
  console.log('Connection verified and saved. Register it in Codex:')
  console.log(
    `codex mcp add pomegranate -- "${process.execPath}" "${resolve('mcp/index.ts')}"`,
  )
  console.log(
    'Then run pnpm skill:install and start a new chat. Revoke or renew the credential from Agent access in the studio.',
  )
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Setup failed.')
  process.exitCode = 1
}
