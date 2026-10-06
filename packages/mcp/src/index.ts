import { serveStdio } from '@modelcontextprotocol/server/stdio'
import { loadConfig } from './config/index.ts'
import { createMcpServer } from './server/index.ts'

try {
  const config = await loadConfig()
  serveStdio(() => createMcpServer(config), {
    onerror: () => console.error('Aril MCP transport error.'),
  })
} catch (error) {
  console.error(
    error instanceof Error ? error.message : 'Aril MCP could not start.',
  )
  process.exitCode = 1
}
