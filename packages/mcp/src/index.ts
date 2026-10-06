import { serveStdio } from '@modelcontextprotocol/server/stdio'
import { createMcpServer } from './server.ts'
import { loadConfig } from './config.ts'

try {
  const config = await loadConfig()
  serveStdio(() => createMcpServer(config), {
    onerror: () => console.error('Pomegranate MCP transport error.'),
  })
} catch (error) {
  console.error(
    error instanceof Error ? error.message : 'Pomegranate MCP could not start.',
  )
  process.exitCode = 1
}
