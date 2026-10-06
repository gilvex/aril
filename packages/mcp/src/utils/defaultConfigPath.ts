import { homedir } from 'node:os'
import { join } from 'node:path'

export const defaultConfigPath = () =>
  join(homedir(), '.config', 'pomegranate', 'mcp.json')
