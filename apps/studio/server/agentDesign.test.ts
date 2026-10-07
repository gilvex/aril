import { Client } from '@modelcontextprotocol/client'
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio'
import { makeDesignElement, type DesignPage } from '@pomegranate/domain/design'
import type { Envelope } from '@pomegranate/domain/workspace'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { createApp } from './app.ts'

test('MCP discovers and safely edits design pages in legacy workspaces', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'aril-design-agent-'))
  const instance = createApp(join(directory, 'studio.sqlite'))
  const owner = instance.store.identity.bootstrap()!
  const credential = await instance.store.agents.create(
    owner.profile.id,
    'default',
    'Designer',
    'write',
    7,
  )
  const server = instance.app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`
  const client = new Client({ name: 'aril-design-test', version: '1.0.0' })
  try {
    await client.connect(
      new StdioClientTransport({
        command: process.execPath,
        args: [fileURLToPath(import.meta.resolve('@pomegranate/mcp/index'))],
        env: {
          POMEGRANATE_AGENT_ORIGIN: origin,
          POMEGRANATE_AGENT_TOKEN: credential.token,
        },
        stderr: 'pipe',
      }),
    )
    const read = async <T>(name: string, args = {}) => {
      const response = await client.callTool({ name, arguments: args })
      assert.ok(!response.isError, JSON.stringify(response))
      return JSON.parse((response.content as { text: string }[])[0].text) as T
    }
    const initial = await read<Envelope>('get_workspace', { full: true })
    assert.equal(initial.workspace.design.pages, undefined)
    const missing = await client.callTool({
      name: 'get_design_page',
      arguments: { pageId: 'missing' },
    })
    assert.equal(missing.isError, true)
    const schema = await read<{
      properties: {
        design: {
          properties: { pages: { items: { properties: { nodes: unknown } } } }
        }
      }
    }>('get_schema')
    assert.ok(schema.properties.design.properties.pages.items.properties.nodes)
    const frame = makeDesignElement('frame', 'desktop', {
      name: 'Desktop',
      x: 80,
      y: 100,
    })
    const heading = makeDesignElement('text', 'heading', {
      parentId: frame.id,
      name: 'Heading',
      text: 'Fleet',
      x: 24,
      y: 24,
      order: 1,
    })
    const batch = {
      baseRevision: initial.revision,
      requestId: randomUUID(),
      operations: [
        {
          path: ['design', 'pages'],
          after: {
            dashboard: {
              id: 'dashboard',
              name: 'Dashboard',
              nodes: { desktop: frame, heading },
            },
          },
        },
      ],
    }
    const reader = await instance.store.agents.create(
      owner.profile.id,
      'default',
      'Reader',
      'read',
      7,
    )
    const denied = await fetch(`${origin}/api/agent/workspace`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${reader.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batch),
    })
    assert.equal(denied.status, 403)
    assert.equal(instance.store.read().revision, initial.revision)
    await read('apply_changes', batch)
    // Retrying the exact request must not create another revision or page.
    await read('apply_changes', batch)
    assert.equal(instance.store.read().revision, initial.revision + 1)
    const overview = await read<{
      workspace: { design: { pages: unknown[] } }
    }>('get_workspace')
    assert.deepEqual(overview.workspace.design.pages, [
      { id: 'dashboard', name: 'Dashboard', layers: 2, frames: 1 },
    ])
    const full = await read<Envelope>('get_workspace', { full: true })
    assert.equal(full.workspace.design.pages?.[0].nodes[1].text, 'Fleet')
    const page = await read<{
      revision: number
      page: DesignPage
      settings: unknown
      url: string
    }>('get_design_page', { pageId: 'dashboard' })
    assert.deepEqual(page.page.nodes, [frame, heading])
    assert.deepEqual(page.settings, initial.workspace.design)
    assert.equal(new URL(page.url).searchParams.get('workspace'), 'default')
    assert.equal(new URL(page.url).searchParams.get('view'), 'design')
    const update = {
      baseRevision: page.revision,
      requestId: randomUUID(),
      operations: [
        {
          path: ['design', 'pages', 'dashboard', 'nodes', 'heading', 'text'],
          before: 'Fleet',
          after: 'Your servers',
        },
      ],
    }
    await read('apply_changes', update)
    const stale = await client.callTool({
      name: 'apply_changes',
      arguments: {
        ...update,
        requestId: randomUUID(),
        operations: [
          {
            path: ['design', 'pages', 'dashboard'],
            before: { ...page.page, nodes: { desktop: frame, heading } },
          },
        ],
      },
    })
    assert.equal(stale.isError, true)
    const changed = await read<{ revision: number; page: DesignPage }>(
      'get_design_page',
      { pageId: 'dashboard' },
    )
    assert.equal(changed.page.nodes[1].text, 'Your servers')
    const orphan = await client.callTool({
      name: 'apply_changes',
      arguments: {
        baseRevision: changed.revision,
        requestId: randomUUID(),
        operations: [
          {
            path: ['design', 'pages', 'dashboard', 'nodes', 'desktop'],
            before: frame,
          },
        ],
      },
    })
    assert.equal(orphan.isError, true)
    assert.equal(instance.store.read().revision, changed.revision)
    const conflict = await client.callTool({
      name: 'apply_changes',
      arguments: {
        ...update,
        baseRevision: changed.revision,
        requestId: randomUUID(),
        operations: [{ ...update.operations[0], after: 'Must not overwrite' }],
      },
    })
    assert.equal(conflict.isError, true)
    // Existing pages are addressed individually; adding another cannot replace them.
    await read('apply_changes', {
      baseRevision: changed.revision,
      requestId: randomUUID(),
      operations: [
        {
          path: ['design', 'pages', 'mobile'],
          after: { id: 'mobile', name: 'Mobile', nodes: {} },
        },
      ],
    })
    const after = instance.store.read()
    assert.equal(after.workspace.design.pages?.length, 2)
    assert.deepEqual(
      after.workspace.boards,
      initial.workspace.boards.map((board) => ({
        ...board,
        wireframe: board.wireframe ?? { nodes: [], edges: [] },
      })),
    )
    assert.equal(
      after.workspace.design.direction,
      initial.workspace.design.direction,
    )
    assert.match(instance.store.activity()[0].name, /Designer \(agent/)
    await read('apply_changes', {
      baseRevision: after.revision,
      requestId: randomUUID(),
      operations: changed.page.nodes.map((node) => ({
        path: ['design', 'pages', 'dashboard', 'nodes', node.id],
        before: node,
      })),
    })
    const cleared = await read<{ page: DesignPage }>('get_design_page', {
      pageId: 'dashboard',
    })
    assert.deepEqual(cleared.page.nodes, [])
    const boardId = initial.workspace.boards[0].id
    const current = instance.store.read()
    await read('apply_changes', {
      baseRevision: current.revision,
      requestId: randomUUID(),
      operations: [
        { path: ['boards', boardId, 'sections'], after: ['design'] },
        {
          path: ['boards', boardId, 'design'],
          after: {
            ...initial.workspace.design,
            pages: {
              dashboard: {
                id: 'dashboard',
                name: 'Board dashboard',
                nodes: { desktop: frame, heading },
              },
            },
          },
        },
      ],
    })
    const boardPage = await read<{ page: DesignPage; url: string }>(
      'get_design_page',
      { boardId, pageId: 'dashboard' },
    )
    assert.equal(boardPage.page.name, 'Board dashboard')
    assert.equal(boardPage.page.nodes.length, 2)
    assert.equal(new URL(boardPage.url).searchParams.get('board'), boardId)
    assert.equal(new URL(boardPage.url).searchParams.get('canvas'), 'design')
    assert.deepEqual(
      (
        await read<{ page: DesignPage }>('get_design_page', {
          pageId: 'dashboard',
        })
      ).page.nodes,
      [],
    )
  } finally {
    await client.close()
    instance.collaboration.close()
    server.closeAllConnections()
    await new Promise<void>((resolve) => server.close(() => resolve()))
    instance.store.close()
    await rm(directory, { recursive: true, force: true })
  }
})
