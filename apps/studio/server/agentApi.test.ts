import { Client } from '@modelcontextprotocol/client'
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio'
import type { AgentCredential } from '@pomegranate/domain/agentAccess'
import { validateConfig } from '@pomegranate/mcp/config'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { createApp } from './app.ts'

test('agent credentials restrict access, expire, revoke, and safely attribute atomic edits over MCP stdio', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'pomegranate-agents-'))
  const path = join(directory, 'studio.sqlite')
  const instance = createApp(path)
  const owner = instance.store.identity.bootstrap()!
  const otherWorkspace = instance.store.createStudio(
    owner.profile.id,
    'Other workspace',
  )
  const server = instance.app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`
  const call = (
    path: string,
    token: string,
    method = 'GET',
    body?: unknown,
    workspaceId = 'default',
  ) =>
    fetch(origin + path, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-workspace-id': workspaceId,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  let client: Client | undefined
  try {
    const created = await call('/api/agent-access', owner.token, 'POST', {
      name: 'Test agent',
      scope: 'write',
      days: 30,
    })
    assert.equal(created.status, 201)
    const writer = (await created.json()) as {
      token: string
      credential: AgentCredential
    }
    const reader = await instance.store.agents.create(
      owner.profile.id,
      'default',
      'Reader',
      'read',
      7,
    )
    const expired = await instance.store.agents.create(
      owner.profile.id,
      'default',
      'Expired',
      'write',
      -1,
    )
    assert.equal(
      (await call('/api/agent/workspace', expired.token)).status,
      401,
    )
    assert.equal(
      (await call('/api/agent/workspace', 'pome_agent_' + 'a'.repeat(43)))
        .status,
      401,
    )
    assert.equal((await call('/api/agent/workspace', owner.token)).status, 401)
    assert.equal((await call('/api/agent/workspace', reader.token)).status, 200)
    assert.equal(
      (
        await call(
          '/api/agent/workspace',
          writer.token,
          'GET',
          undefined,
          otherWorkspace.id,
        )
      ).status,
      403,
    )
    for (const path of [
      '/api/workspace',
      '/api/studios',
      '/api/agent-access',
      '/api/invites',
    ]) {
      assert.equal((await call(path, writer.token)).status, 401)
    }
    assert.equal((await call('/api/agent/anything', writer.token)).status, 404)
    const state = instance.store.read()
    const batch = {
      baseRevision: state.revision,
      requestId: randomUUID(),
      operations: [
        {
          path: ['notes'],
          before: state.workspace.notes,
          after: 'Agent planning note',
        },
      ],
    }
    assert.equal(
      (await call('/api/agent/workspace', reader.token, 'PATCH', batch)).status,
      403,
    )
    assert.equal(
      (await call('/api/agent/workspace', writer.token, 'PUT', batch)).status,
      404,
    )
    const schema = await call('/api/agent/schema', writer.token)
    assert.equal(schema.status, 200)
    assert.ok(((await schema.json()) as { properties: unknown }).properties)
    const listed = await (await call('/api/agent-access', owner.token)).text()
    assert.ok(!listed.includes(writer.token) && !listed.includes('token_hash'))

    client = new Client({ name: 'pomegranate-test', version: '1.0.0' })
    await client.connect(
      new StdioClientTransport({
        command: process.execPath,
        args: [fileURLToPath(import.meta.resolve('@pomegranate/mcp/index'))],
        env: {
          POMEGRANATE_AGENT_ORIGIN: origin,
          POMEGRANATE_AGENT_TOKEN: writer.token,
        },
        stderr: 'pipe',
      }),
    )
    const tools = await client.listTools()
    assert.deepEqual(tools.tools.map((t) => t.name).sort(), [
      'apply_changes',
      'get_board',
      'get_history',
      'get_schema',
      'get_workspace',
    ])
    const overview = await client.callTool({
      name: 'get_workspace',
      arguments: {},
    })
    assert.ok(!overview.isError)
    assert.match(JSON.stringify(overview), /Pomegranate/)
    const board = await client.callTool({
      name: 'get_board',
      arguments: { boardId: state.workspace.boards[0].id },
    })
    assert.ok(!board.isError)
    const edited = await client.callTool({
      name: 'apply_changes',
      arguments: batch,
    })
    assert.ok(!edited.isError, JSON.stringify(edited))
    assert.equal(instance.store.read().workspace.notes, 'Agent planning note')
    assert.equal(instance.store.read().revision, state.revision + 1)
    const duplicate = await client.callTool({
      name: 'apply_changes',
      arguments: batch,
    })
    assert.ok(!duplicate.isError)
    assert.equal(instance.store.read().revision, state.revision + 1)
    const stale = await client.callTool({
      name: 'apply_changes',
      arguments: { ...batch, requestId: randomUUID() },
    })
    assert.ok(stale.isError)
    assert.match(JSON.stringify(stale), /409/)
    assert.match(instance.store.activity()[0].name, /Test agent \(agent/)
    assert.ok(instance.store.snapshot(state.revision))
    const invalid = await call('/api/agent/workspace', writer.token, 'PATCH', {
      ...batch,
      baseRevision: state.revision + 1,
      requestId: randomUUID(),
      operations: [
        {
          path: ['boards', state.workspace.boards[0].id, 'edges', 'bad-edge'],
          after: { id: 'bad-edge', source: 'missing', target: 'missing' },
        },
      ],
    })
    assert.equal(invalid.status, 409)
    assert.equal(instance.store.read().revision, state.revision + 1)
    const conflict = await call('/api/agent/workspace', writer.token, 'PATCH', {
      ...batch,
      baseRevision: state.revision + 1,
      requestId: randomUUID(),
    })
    // Matching after is an idempotent field assignment, so use a different proposed value to test before validation.
    assert.equal(conflict.status, 200)
    const beforeConflict = await call(
      '/api/agent/workspace',
      writer.token,
      'PATCH',
      {
        ...batch,
        baseRevision: instance.store.read().revision,
        requestId: randomUUID(),
        operations: [
          { path: ['notes'], before: 'wrong', after: 'must not win' },
        ],
      },
    )
    assert.equal(beforeConflict.status, 409)
    assert.equal(instance.store.read().workspace.notes, 'Agent planning note')
    const invite = instance.store.identity.invite(owner.profile.id)
    const guest = instance.store.identity.join(invite.token, 'Guest')!
    await call(
      `/api/agent-access/${writer.credential.id}`,
      guest.token,
      'DELETE',
    )
    assert.equal((await call('/api/agent/workspace', writer.token)).status, 200)
    assert.equal(
      (
        await call(
          `/api/agent-access/${writer.credential.id}`,
          owner.token,
          'DELETE',
        )
      ).status,
      204,
    )
    const denied = await client.callTool({
      name: 'get_workspace',
      arguments: {},
    })
    assert.ok(denied.isError)
    assert.match(JSON.stringify(denied), /401/)
    assert.equal((await call('/api/agent/workspace', writer.token)).status, 401)
    await client.close()
    client = undefined
    instance.collaboration.close()
    instance.store.close()
    const bytes = await readFile(path)
    assert.ok(
      !bytes.includes(Buffer.from(reader.token)),
      'Database must not store bearer tokens',
    )
  } finally {
    await client?.close()
    instance.collaboration.close()
    server.closeAllConnections()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    // Store may already have been closed above.
    try {
      instance.store.close()
    } catch {
      /* already closed */
    }
    await rm(directory, { recursive: true, force: true })
  }
})

test('MCP credentials only go to configured secure origins', () => {
  const token = 'pome_agent_' + 'a'.repeat(43)
  for (const origin of [
    'http://example.com',
    'https://user:password@example.com',
    'https://example.com/path',
    'https://example.com/?token=secret',
  ]) {
    assert.throws(() => validateConfig({ origin, token }))
  }
  assert.equal(
    validateConfig({ origin: 'https://example.com', token }).origin,
    'https://example.com',
  )
})
