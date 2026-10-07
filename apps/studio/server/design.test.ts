import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createSeed } from '@pomegranate/domain/seed'
import {
  makeDesignElement,
  duplicateDesignElements,
  removeDesignElements,
  designPageSchema,
} from '@pomegranate/domain/design'
import {
  diffWorkspace,
  applyOperations,
  presenceSchema,
} from '@pomegranate/domain/collaboration'
import { workspaceSchema } from '@pomegranate/domain/workspace'

test('design layers round-trip, merge independent edits, reject conflicts, and undo removals', () => {
  const legacy = createSeed()
  assert.deepEqual(applyOperations(legacy, []).design, legacy.design)
  const base = structuredClone(legacy)
  base.design.pages = [
    {
      id: 'page',
      name: 'Screens',
      nodes: [
        makeDesignElement('frame', 'frame'),
        makeDesignElement('text', 'title', {
          parentId: 'frame',
          text: 'Hello',
        }),
        makeDesignElement('button', 'action', {
          parentId: 'frame',
          text: 'Create',
        }),
      ],
    },
  ]
  const initial = diffWorkspace(legacy, base)
  assert.deepEqual(applyOperations(legacy, initial).design, base.design)
  assert.deepEqual(
    workspaceSchema.parse(JSON.parse(JSON.stringify(base))).design,
    base.design,
  )
  const alice = structuredClone(base),
    bob = structuredClone(base)
  alice.design.pages![0].nodes[1].text = 'Hello everyone'
  bob.design.pages![0].nodes[2].fill = '#123456'
  const merged = applyOperations(alice, diffWorkspace(base, bob))
  assert.equal(merged.design.pages![0].nodes[1].text, 'Hello everyone')
  assert.equal(merged.design.pages![0].nodes[2].fill, '#123456')
  const competing = structuredClone(base)
  competing.design.pages![0].nodes[1].text = 'Competing'
  assert.throws(
    () => applyOperations(alice, diffWorkspace(base, competing)),
    /Someone changed/,
  )
  const deleted = structuredClone(merged)
  deleted.design.pages![0].nodes = removeDesignElements(
    deleted.design.pages![0].nodes,
    ['frame'],
  )
  assert.equal(deleted.design.pages![0].nodes.length, 0)
  const removal = diffWorkspace(merged, deleted)
  const restored = applyOperations(
    deleted,
    removal.map((operation) => ({
      path: operation.path,
      before: operation.after,
      after: operation.before,
    })),
  )
  assert.deepEqual(restored.design, merged.design)
  assert.equal(restored.design.accent, legacy.design.accent)
  assert.equal(restored.design.direction, legacy.design.direction)
})

test('duplicating frames remaps children and shifts only top-level layers', () => {
  const frame = makeDesignElement('frame', 'frame', { x: 100, y: 50 })
  const text = makeDesignElement('text', 'text', {
    parentId: frame.id,
    x: 20,
    y: 30,
  })
  let id = 0
  const copies = duplicateDesignElements(
    [frame, text],
    ['frame', 'text'],
    () => `copy-${++id}`,
  )
  assert.equal(copies.length, 2)
  assert.equal(copies[1].parentId, copies[0].id)
  assert.equal(copies[0].x, 132)
  assert.equal(copies[1].x, 20)
  assert.equal(copies[1].y, 30)
  assert.ok(
    designPageSchema.safeParse({
      id: 'page',
      name: 'Page',
      nodes: [...copies, frame, text],
    }).success,
  )
})

test('design validation rejects broken frames, unsafe image schemes and duplicate pages', () => {
  const frame = makeDesignElement('frame', 'frame')
  const text = makeDesignElement('text', 'text', { parentId: 'frame' })
  const page = { id: 'page', name: 'Page', nodes: [frame, text] }
  for (const nodes of [
    [frame, { ...text, parentId: 'missing' }],
    [{ ...frame, parentId: 'text' }, text],
    [frame, frame],
    [frame, { ...text, width: -1 }],
    [frame, { ...text, imageUrl: 'javascript:alert(1)' }],
  ])
    assert.equal(designPageSchema.safeParse({ ...page, nodes }).success, false)
  const workspace = createSeed()
  workspace.design.pages = [page, page]
  assert.equal(workspaceSchema.safeParse(workspace).success, false)
  const presence = presenceSchema.parse({
    clientId: crypto.randomUUID(),
    boardId: null,
    designPageId: 'page',
    view: 'design',
    cursor: null,
    selected: ['text'],
  })
  assert.equal(presence.designPageId, 'page')
})
