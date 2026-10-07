import assert from 'node:assert/strict'
import { test } from 'node:test'
import { diffWorkspace } from '@pomegranate/domain/collaboration'
import {
  workspaceSchema,
  type Envelope,
  type Workspace,
} from '@pomegranate/domain/workspace'
import { createDemoWorkspace } from '../src/app/utils/createDemoWorkspace.ts'
import { createDemoState } from '../src/app/utils/createDemoState.ts'
import { createDemoTransport } from '../src/app/utils/createDemoTransport.ts'
import { demoStorageKey } from '../src/app/config/demoStorageKey.ts'

test('demo starts with deterministic editable desktop/mobile designs inside valid frames', () => {
  const workspace = workspaceSchema.parse(createDemoWorkspace())
  const page = workspace.design.pages![0]
  assert.equal(page.id, 'demo-design-dashboard')
  assert.deepEqual(workspace.design.pages, createDemoWorkspace().design.pages)
  const frames = page.nodes.filter((node) => node.kind === 'frame')
  assert.deepEqual(
    frames.map((frame) => frame.width),
    [1000, 390],
  )
  assert.ok(
    page.nodes.some(
      (node) => node.kind === 'text' && node.text === 'Weekend servers',
    ),
  )
  assert.ok(
    page.nodes.some(
      (node) => node.kind === 'button' && node.text === 'Create server',
    ),
  )
  for (const node of page.nodes.filter((node) => node.parentId)) {
    const frame = frames.find((item) => item.id === node.parentId)!
    assert.ok(frame)
    assert.ok(
      node.x >= 0 &&
        node.y >= 0 &&
        node.x + node.width <= frame.width &&
        node.y + node.height <= frame.height,
      node.name,
    )
  }
})

test('existing demos gain missing design examples without resetting work or deliberately empty pages', () => {
  const saved = createDemoState({ getItem: () => null })
  delete saved.envelope.workspace.design.pages
  saved.envelope.workspace.notes = 'My visitor notes'
  saved.envelope.workspace.design.direction = 'Keep my design decisions'
  saved.history = [structuredClone(saved.envelope)]
  const restore = () =>
    createDemoState({
      getItem: (key) => (key === demoStorageKey ? JSON.stringify(saved) : null),
    })
  const upgraded = restore()
  assert.ok(upgraded.envelope.workspace.design.pages?.[0].nodes.length)
  assert.deepEqual(
    upgraded.history[0].workspace.design.pages,
    upgraded.envelope.workspace.design.pages,
  )
  assert.equal(upgraded.envelope.workspace.notes, 'My visitor notes')
  assert.equal(
    upgraded.envelope.workspace.design.direction,
    'Keep my design decisions',
  )
  assert.deepEqual(
    upgraded.envelope.workspace.boards,
    saved.envelope.workspace.boards,
  )
  saved.envelope.workspace.design.pages = []
  assert.deepEqual(restore().envelope.workspace.design.pages, [])
  saved.envelope.workspace.design.pages = [
    { id: 'custom', name: 'My design', nodes: [] },
  ]
  assert.deepEqual(
    restore().envelope.workspace.design.pages,
    saved.envelope.workspace.design.pages,
  )
})

test('demo layer edits and page deletion survive refresh with recoverable design history', async () => {
  const values = new Map<string, string>()
  const storage = {
    getItem: (key: string) => values.get(key) || null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
  }
  const transport = createDemoTransport(storage)
  const original = (await (
    await transport('/api/workspace')
  ).json()) as Envelope
  const edited = structuredClone(original.workspace)
  const layer = edited.design.pages![0].nodes.find(
    (node) => node.kind === 'text',
  )!
  layer.text = 'Visitor edited this'
  layer.x += 8
  const save = (before: Workspace, after: Workspace, revision: number) =>
    transport('/api/workspace', {
      method: 'PATCH',
      headers: { 'x-workspace-id': 'demo' },
      body: JSON.stringify({
        baseRevision: revision,
        operations: diffWorkspace(before, after),
      }),
    })
  assert.equal(
    (await save(original.workspace, edited, original.revision)).status,
    200,
  )
  const refreshed = createDemoState(storage).envelope
  assert.deepEqual(refreshed.workspace.design.pages, edited.design.pages)
  const history = (await (
    await transport('/api/history/1')
  ).json()) as Workspace
  assert.deepEqual(history.design.pages, original.workspace.design.pages)
  const empty = structuredClone(refreshed.workspace)
  empty.design.pages = []
  assert.equal(
    (await save(refreshed.workspace, empty, refreshed.revision)).status,
    200,
  )
  assert.deepEqual(createDemoState(storage).envelope.workspace.design.pages, [])
})
