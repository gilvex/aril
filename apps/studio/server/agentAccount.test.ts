import { Client } from '@modelcontextprotocol/client'
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio'
import assert from 'node:assert/strict'
import { randomUUID, createHash } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { createApp } from './app.ts'

test('account MCP selects files per request, obeys membership and revocation, and keeps old grants limited', async (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'aril-account-agent-'))
  const { app, store, collaboration } = createApp(
    join(directory, 'fixture.sqlite'),
  )
  const owner = store.identity.bootstrap()!
  const editor = store.identity.join(
    store.identity.invite(owner.profile.id).token,
    'Editor',
  )!
  const second = store.createStudio(editor.profile.id, 'Second file')
  const privateFile = store.createStudio(owner.profile.id, 'Private file')
  const server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`
  const client = new Client({ name: 'aril-account-test', version: '1.0.0' })
  t.after(async () => {
    await client?.close()
    collaboration.close()
    server.closeAllConnections()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    store.close()
    rmSync(directory, { recursive: true, force: true })
  })
  const call = (
    token: string,
    path: string,
    workspaceId?: string,
    method = 'GET',
    body?: unknown,
  ) =>
    fetch(origin + path, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(workspaceId ? { 'x-workspace-id': workspaceId } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  const created = await call(
    editor.token,
    '/api/agent-access',
    'default',
    'POST',
    { name: 'Account agent', target: 'account', scope: 'write', days: 30 },
  )
  assert.equal(created.status, 201)
  const account = (await created.json()) as {
    token: string
    credential: { id: string; target: string }
  }
  assert.equal(account.credential.target, 'account')
  assert.match(account.token, /^aril_agent_/)
  const list = (await call(account.token, '/api/agent/workspaces').then((r) =>
    r.json(),
  )) as { workspaces: { id: string; scope: string }[] }
  assert.deepEqual(
    list.workspaces.map((w) => w.id).sort(),
    ['default', second.id].sort(),
  )
  assert.equal((await call(account.token, '/api/agent/workspace')).status, 400)
  assert.equal(
    (await call(account.token, '/api/agent/workspace', privateFile.id)).status,
    403,
  )
  assert.equal((await call(account.token, '/api/agent/schema')).status, 200)
  assert.equal(
    (await call(account.token, '/api/agent-access', 'default')).status,
    401,
  )
  const legacy = await store.agents.create(
    editor.profile.id,
    'default',
    'File only',
    'write',
    7,
  )
  // A pre-upgrade bearer stays valid and remains file-only.
  legacy.token = legacy.token.replace('aril_agent_', 'pome_agent_')
  const fixtureDb = new DatabaseSync(join(directory, 'fixture.sqlite'))
  fixtureDb
    .prepare('UPDATE agent_credentials SET token_hash=? WHERE id=?')
    .run(
      createHash('sha256').update(legacy.token).digest('hex'),
      legacy.credential.id,
    )
  fixtureDb.close()
  assert.equal(
    (await call(legacy.token, '/api/agent/workspace', 'default')).status,
    200,
  )
  assert.equal(legacy.credential.target, 'workspace')
  assert.equal(
    (await call(legacy.token, '/api/agent/workspace', second.id)).status,
    403,
  )
  const legacyList = (await call(legacy.token, '/api/agent/workspaces').then(
    (r) => r.json(),
  )) as { workspaces: unknown[] }
  assert.equal(legacyList.workspaces.length, 1)

  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [fileURLToPath(import.meta.resolve('@aril/mcp/index'))],
      env: { ARIL_AGENT_ORIGIN: origin, ARIL_AGENT_TOKEN: account.token },
      stderr: 'pipe',
    }),
  )
  assert.equal(client.getServerVersion()?.name, 'aril')
  const discovered = await client.callTool({
    name: 'list_workspaces',
    arguments: {},
  })
  assert.ok(!discovered.isError)
  for (const tool of (await client.listTools()).tools.filter(
    (tool) => tool.name !== 'list_workspaces',
  )) {
    assert.ok(
      tool.inputSchema.properties?.workspaceId,
      `${tool.name} exposes workspace selection`,
    )
  }
  const missing = await client.callTool({
    name: 'get_workspace',
    arguments: {},
  })
  assert.ok(missing.isError)
  const reads = await Promise.all(
    ['default', second.id].map((workspaceId) =>
      client!.callTool({ name: 'get_workspace', arguments: { workspaceId } }),
    ),
  )
  for (const [index, read] of reads.entries()) {
    assert.ok(!read.isError)
    const content = read.content as { text: string }[]
    assert.equal(
      JSON.parse(content[0].text).studio.id,
      ['default', second.id][index],
    )
  }
  // The same request ID belongs to each workspace independently.
  const requestId = randomUUID()
  for (const workspaceId of ['default', second.id]) {
    const state = store.read(workspaceId)
    const changed = await client.callTool({
      name: 'apply_changes',
      arguments: {
        workspaceId,
        requestId,
        baseRevision: state.revision,
        operations: [
          {
            path: ['notesTitle'],
            before: state.workspace.notesTitle,
            after: `Edited ${workspaceId}`,
          },
        ],
      },
    })
    assert.ok(!changed.isError, JSON.stringify(changed))
    assert.equal(
      store.read(workspaceId).workspace.notesTitle,
      `Edited ${workspaceId}`,
    )
  }
  await store.access.update(
    owner.profile.id,
    'default',
    editor.profile.id,
    'viewer',
  )
  const viewer = (await call(
    account.token,
    '/api/agent/workspace',
    'default',
  ).then((r) => r.json())) as { scope: string }
  assert.equal(viewer.scope, 'read')
  assert.equal(
    (await call(account.token, '/api/agent/workspace', 'default', 'PATCH', {}))
      .status,
    403,
  )
  // Creating an account grant from a viewer file is allowed, but cannot bypass its role.
  const viewerCreated = await call(
    editor.token,
    '/api/agent-access',
    'default',
    'POST',
    { name: 'Viewer account', target: 'account', scope: 'write', days: 7 },
  )
  assert.equal(viewerCreated.status, 201)
  await store.access.remove(owner.profile.id, 'default', editor.profile.id)
  assert.equal(
    (await call(account.token, '/api/agent/workspace', 'default')).status,
    403,
  )
  assert.equal(
    (await call(account.token, '/api/agent/workspace', second.id)).status,
    200,
  )
  const remaining = (await call(account.token, '/api/agent/workspaces').then(
    (r) => r.json(),
  )) as { workspaces: { id: string }[] }
  assert.deepEqual(
    remaining.workspaces.map((w) => w.id),
    [second.id],
  )
  const listed = await call(editor.token, '/api/agent-access', second.id).then(
    (r) => r.text(),
  )
  assert.ok(listed.includes(account.credential.id))
  assert.ok(!listed.includes(account.token) && !listed.includes('token_hash'))
  await call(
    owner.token,
    `/api/agent-access/${account.credential.id}`,
    'default',
    'DELETE',
  )
  assert.equal(
    (await call(account.token, '/api/agent/workspace', second.id)).status,
    200,
  )
  await call(
    editor.token,
    `/api/agent-access/${account.credential.id}`,
    second.id,
    'DELETE',
  )
  assert.equal((await call(account.token, '/api/agent/workspaces')).status, 401)
  const expired = await store.agents.create(
    editor.profile.id,
    second.id,
    'Expired account',
    'read',
    -1,
    'account',
  )
  assert.equal((await call(expired.token, '/api/agent/workspaces')).status, 401)
})
