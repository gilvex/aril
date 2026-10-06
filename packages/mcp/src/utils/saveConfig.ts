import { spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { chmod, mkdir, rename, unlink, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { AgentConfig } from '../types/agentConfig.ts'
import { defaultConfigPath } from './defaultConfigPath.ts'
import { validateConfig } from './validateConfig.ts'
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
