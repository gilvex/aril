import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createSeed } from '@pomegranate/domain/seed'
import { makeDesignElement } from '@pomegranate/domain/design'
import { workspaceSchema } from '@pomegranate/domain/workspace'
import {
  applyOperations,
  diffWorkspace,
  presenceSchema,
} from '@pomegranate/domain/collaboration'
import { readStudioRoute } from '../src/shared/utils/readStudioRoute.ts'
import { studioRouteUrl } from '../src/shared/utils/studioRouteUrl.ts'

test('board designs round-trip and merge independent layers without changing workspace design', () => {
  const legacy = createSeed()
  const base = structuredClone(legacy)
  base.boards[0].sections = ['design']
  base.boards[0].design = {
    ...base.design,
    pages: [
      {
        id: 'page',
        name: 'Screen',
        nodes: [
          makeDesignElement('text', 'title'),
          makeDesignElement('button', 'action'),
        ],
      },
    ],
  }
  const saved = applyOperations(legacy, diffWorkspace(legacy, base))
  assert.deepEqual(saved.boards[0].design, base.boards[0].design)
  assert.deepEqual(saved.design, legacy.design)
  assert.deepEqual(saved.boards[0].sections, ['design'])
  const alice = structuredClone(saved),
    bob = structuredClone(saved)
  alice.boards[0].design!.pages![0].nodes[0].text = 'Alice'
  bob.boards[0].design!.pages![0].nodes[1].text = 'Bob'
  const operations = diffWorkspace(saved, bob)
  assert.deepEqual(operations[0].path, [
    'boards',
    base.boards[0].id,
    'design',
    'pages',
    'page',
    'nodes',
    'action',
    'text',
  ])
  const merged = applyOperations(alice, operations)
  assert.equal(merged.boards[0].design!.pages![0].nodes[0].text, 'Alice')
  assert.equal(merged.boards[0].design!.pages![0].nodes[1].text, 'Bob')
  const expanded = structuredClone(merged)
  expanded.boards[0].sections!.push('wireframes')
  assert.deepEqual(
    applyOperations(merged, diffWorkspace(merged, expanded)).boards[0].design,
    merged.boards[0].design,
  )
  assert.equal(
    workspaceSchema.safeParse({
      ...base,
      boards: [{ ...base.boards[0], sections: [] }],
    }).success,
    false,
  )
  assert.equal(
    workspaceSchema.safeParse({
      ...base,
      boards: [{ ...base.boards[0], sections: ['design', 'design'] }],
    }).success,
    false,
  )
})

test('board design routes preserve board and section on refresh', () => {
  const route = readStudioRoute('/w/default/canvas/layers?canvas=design')
  assert.equal(route.canvasMode, 'design')
  assert.equal(route.boardId, 'layers')
  assert.equal(route.view, 'canvas')
  assert.deepEqual(
    readStudioRoute(studioRouteUrl('https://aril.studio', route)),
    route,
  )
})

test('cursor chat travels in presence with bounded text, never in saved documents', () => {
  const input = {
    clientId: crypto.randomUUID(),
    boardId: 'layers',
    view: 'canvas',
    cursor: { x: 10, y: 20 },
    selected: [],
    chat: { text: 'Look here', expiresAt: Date.now() + 6000 },
  }
  assert.deepEqual(presenceSchema.parse(input).chat, input.chat)
  assert.equal(
    presenceSchema.safeParse({
      ...input,
      chat: { ...input.chat, text: 'x'.repeat(161) },
    }).success,
    false,
  )
  const workspace = workspaceSchema.parse({ ...createSeed(), chat: input.chat })
  assert.equal('chat' in workspace, false)
})
