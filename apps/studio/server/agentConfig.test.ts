import { loadConfig, validateConfig, defaultConfigPath } from '@aril/mcp/config'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

test('Aril config prefers new names, reads legacy explicit configuration and fails closed on malformed files', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'aril-mcp-config-'))
  const keys = [
    'ARIL_AGENT_ORIGIN',
    'ARIL_AGENT_TOKEN',
    'ARIL_MCP_CONFIG',
    'POMEGRANATE_AGENT_ORIGIN',
    'POMEGRANATE_AGENT_TOKEN',
    'POMEGRANATE_MCP_CONFIG',
  ]
  const previous = keys.map((key) => process.env[key])
  for (const key of keys) delete process.env[key]
  t.after(async () => {
    keys.forEach((key, index) => {
      if (previous[index] === undefined) delete process.env[key]
      else process.env[key] = previous[index]
    })
    await rm(directory, { recursive: true, force: true })
  })
  const legacy = {
    origin: 'https://legacy.example.test',
    token: 'pome_agent_' + 'a'.repeat(43),
  }
  const modern = {
    origin: 'https://aril.example.test',
    token: 'aril_agent_' + 'b'.repeat(43),
  }
  process.env.POMEGRANATE_MCP_CONFIG = join(directory, 'legacy.json')
  await writeFile(process.env.POMEGRANATE_MCP_CONFIG, JSON.stringify(legacy))
  assert.deepEqual(await loadConfig(), legacy)
  process.env.ARIL_MCP_CONFIG = join(directory, 'aril.json')
  await writeFile(process.env.ARIL_MCP_CONFIG, JSON.stringify(modern))
  assert.deepEqual(await loadConfig(), modern)
  await writeFile(process.env.ARIL_MCP_CONFIG, 'not json')
  await assert.rejects(loadConfig, /ARIL_AGENT_TOKEN/)
  process.env.ARIL_MCP_CONFIG = join(directory, 'missing.json')
  await assert.rejects(loadConfig)
  process.env.POMEGRANATE_AGENT_TOKEN = legacy.token
  process.env.POMEGRANATE_AGENT_ORIGIN = legacy.origin
  assert.deepEqual(await loadConfig(), legacy)
  process.env.ARIL_AGENT_TOKEN = modern.token
  process.env.ARIL_AGENT_ORIGIN = modern.origin
  assert.deepEqual(await loadConfig(), modern)
  assert.deepEqual(validateConfig(modern), modern)
  assert.match(defaultConfigPath(), /[\\/]aril[\\/]mcp\.json$/)
})
