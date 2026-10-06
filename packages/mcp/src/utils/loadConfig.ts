import { readFile } from 'node:fs/promises'
import type { AgentConfig } from '../types/agentConfig.ts'
import { defaultConfigPath } from './defaultConfigPath.ts'
import { validateConfig } from './validateConfig.ts'
export async function loadConfig(): Promise<AgentConfig> {
  if (process.env.POMEGRANATE_AGENT_TOKEN)
    return validateConfig({
      origin:
        process.env.POMEGRANATE_AGENT_ORIGIN ||
        'https://arilapp.vercel.app',
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
