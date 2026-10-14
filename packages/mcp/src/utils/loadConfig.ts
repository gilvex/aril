import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { AgentConfig } from '../types/agentConfig.ts'
import { defaultConfigPath } from './defaultConfigPath.ts'
import { validateConfig } from './validateConfig.ts'
export async function loadConfig(): Promise<AgentConfig> {
  const token =
    process.env.ARIL_AGENT_TOKEN || process.env.POMEGRANATE_AGENT_TOKEN
  if (token)
    return validateConfig({
      origin:
        process.env.ARIL_AGENT_ORIGIN ||
        process.env.POMEGRANATE_AGENT_ORIGIN ||
        'https://www.aril.studio',
      token,
    })
  const configured =
    process.env.ARIL_MCP_CONFIG || process.env.POMEGRANATE_MCP_CONFIG
  let source: string
  try {
    try {
      source = await readFile(configured || defaultConfigPath(), 'utf8')
    } catch (error) {
      if (configured || (error as NodeJS.ErrnoException).code !== 'ENOENT')
        throw error
      source = await readFile(
        join(homedir(), '.config', 'pomegranate', 'mcp.json'),
        'utf8',
      )
    }
    return validateConfig(JSON.parse(source))
  } catch {
    throw new Error(
      'Run pnpm mcp:setup to connect your account or a file, or set ARIL_AGENT_ORIGIN and ARIL_AGENT_TOKEN.',
    )
  }
}
