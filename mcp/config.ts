import {
  readFile,
  mkdir,
  writeFile,
  chmod,
  rename,
  unlink,
} from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { spawnSync } from 'node:child_process'

export const defaultConfigPath = () =>
  join(homedir(), '.config', 'pomegranate', 'mcp.json')
export type AgentConfig = { origin: string; token: string }
export async function saveConfig(
  config: AgentConfig,
  path = defaultConfigPath(),
) {
  const value = validateConfig(config)
  await mkdir(dirname(path), { recursive: true, mode: 0o700 })
  const temporary = `${path}.${randomUUID()}.tmp`
  await writeFile(temporary, '', { mode: 0o600, flag: 'wx' })
  try {
    // Restrict the empty file before writing any secret. Never alter a caller's parent directory ACL.
    if (process.platform === 'win32') {
      const account = `${process.env.USERDOMAIN}\\${process.env.USERNAME}`
      const restricted = spawnSync(
        'icacls.exe',
        [temporary, '/inheritance:r', '/grant:r', `${account}:F`],
        { windowsHide: true, stdio: 'ignore' },
      )
      if (restricted.status !== 0)
        throw new Error('Could not restrict credential file permissions.')
    } else await chmod(temporary, 0o600)
    await writeFile(temporary, JSON.stringify(value))
    await rename(temporary, path)
  } finally {
    await unlink(temporary).catch(() => {})
  }
}
export function validateConfig(value: AgentConfig): AgentConfig {
  const url = new URL(value.origin)
  if (
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    (url.protocol !== 'https:' &&
      !(
        url.protocol === 'http:' &&
        ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
      ))
  ) {
    throw new Error(
      'Studio address must be an HTTPS origin, or loopback HTTP for development.',
    )
  }
  if (!/^pome_agent_[\w-]{43}$/.test(value.token))
    throw new Error('A valid studio agent credential is required.')
  return { origin: url.origin, token: value.token }
}
export async function loadConfig(): Promise<AgentConfig> {
  if (process.env.POMEGRANATE_AGENT_TOKEN)
    return validateConfig({
      origin:
        process.env.POMEGRANATE_AGENT_ORIGIN ||
        'https://pomegrenate.vercel.app',
      token: process.env.POMEGRANATE_AGENT_TOKEN,
    })
  try {
    return validateConfig(
      JSON.parse(
        await readFile(
          process.env.POMEGRANATE_MCP_CONFIG || defaultConfigPath(),
          'utf8',
        ),
      ),
    )
  } catch {
    throw new Error(
      'Run pnpm mcp:setup to connect a workspace, or set POMEGRANATE_AGENT_ORIGIN and POMEGRANATE_AGENT_TOKEN.',
    )
  }
}
