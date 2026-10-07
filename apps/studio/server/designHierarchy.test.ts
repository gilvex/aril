import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  makeDesignElement as make,
  designPageSchema,
  groupDesignElements,
  ungroupDesignElements,
  designPosition,
  duplicateDesignElements,
  removeDesignElements,
  reparentDesignElement,
  normalizeDesignGroups,
  applyDesignChanges,
} from '@pomegranate/domain/design'
import { createSeed } from '@pomegranate/domain/seed'
import {
  applyOperations,
  diffWorkspace,
} from '@pomegranate/domain/collaboration'
import { designClipShapes } from '../src/widgets/design/utils/designClipShapes.ts'
import { designTreeRows } from '../src/widgets/design/utils/designTreeRows.ts'

test('nested groups preserve world positions, resize descendants, duplicate masks and ungroup safely', () => {
  const original = [
    make('frame', 'frame', { x: 100, y: 80 }),
    make('ellipse', 'mask', {
      parentId: 'frame',
      x: 20,
      y: 30,
      width: 100,
      height: 100,
      order: 1,
    }),
    make('rectangle', 'art', {
      parentId: 'frame',
      x: 0,
      y: 10,
      width: 200,
      height: 150,
      order: 2,
    }),
  ]
  const grouped = groupDesignElements(
    original,
    ['mask', 'art'],
    'group',
    'Mask group',
    'mask',
  )
  assert.equal(grouped.length, 4)
  for (const id of ['mask', 'art'])
    assert.deepEqual(
      designPosition(
        grouped,
        grouped.find((n) => n.id === id)!,
      ),
      designPosition(
        original,
        original.find((n) => n.id === id)!,
      ),
    )
  assert.ok(
    designPageSchema.safeParse({ id: 'p', name: 'P', nodes: grouped }).success,
  )
  const resized = applyDesignChanges(grouped, {
    group: { width: 400, height: 300 },
  })
  assert.equal(resized.find((n) => n.id === 'mask')!.width, 200)
  assert.equal(resized.find((n) => n.id === 'art')!.width, 400)
  assert.deepEqual(
    designTreeRows(grouped).map((row) => [row.node.id, row.depth]),
    [
      ['frame', 0],
      ['group', 1],
      ['art', 2],
      ['mask', 2],
    ],
  )
  assert.deepEqual(
    designTreeRows(grouped, ['group']).map((row) => row.node.id),
    ['frame', 'group'],
  )
  let id = 0
  const copies = duplicateDesignElements(
    grouped,
    ['frame', 'group'],
    () => `copy${++id}`,
  )
  const copyGroup = copies.find((n) => n.kind === 'group')!
  assert.ok(
    copies.some(
      (n) => n.id === copyGroup.maskId && n.parentId === copyGroup.id,
    ),
  )
  assert.equal(copies.length, 4)
  assert.equal(removeDesignElements(grouped, ['frame']).length, 0)
  assert.equal(
    removeDesignElements(grouped, ['mask']).find((n) => n.id === 'group')!
      .maskId,
    undefined,
  )
  const ungrouped = ungroupDesignElements(grouped, 'group')
  for (const node of original)
    assert.deepEqual(
      designPosition(
        ungrouped,
        ungrouped.find((n) => n.id === node.id)!,
      ),
      designPosition(original, node),
    )
  const moved = reparentDesignElement(grouped, 'art')
  assert.deepEqual(
    designPosition(
      moved,
      moved.find((n) => n.id === 'art')!,
    ),
    { x: 100, y: 90 },
  )
  assert.equal(reparentDesignElement(grouped, 'frame', 'group'), grouped)
})

test('masks and frame clips intersect in nested local coordinates and group bounds follow edits', () => {
  const nodes = [
    make('frame', 'f', { x: 100, y: 100, clipContent: true }),
    make('group', 'g', {
      parentId: 'f',
      x: 50,
      y: 60,
      maskId: 'm',
      fill: 'transparent',
    }),
    make('ellipse', 'm', { parentId: 'g', x: 5, y: 10, width: 80, height: 80 }),
    make('rectangle', 'r', { parentId: 'g', x: 20, y: 30 }),
  ]
  const clips = designClipShapes(nodes, nodes[3])
  assert.deepEqual(
    clips.map((n) => [n.kind, n.x, n.y]),
    [
      ['ellipse', -15, -20],
      ['frame', -70, -90],
    ],
  )
  assert.equal(designClipShapes(nodes, nodes[2]).length, 1)
  const normalized = normalizeDesignGroups(nodes)
  for (const node of nodes.filter((n) => n.kind !== 'group'))
    assert.deepEqual(
      designPosition(
        normalized,
        normalized.find((n) => n.id === node.id)!,
      ),
      designPosition(nodes, node),
    )
  assert.equal(normalized.find((n) => n.id === 'g')!.x, 55)
  for (const invalid of [
    nodes.map((n) => (n.id === 'f' ? { ...n, parentId: 'g' } : n)),
    nodes.map((n) => (n.id === 'g' ? { ...n, maskId: 'f' } : n)),
    nodes.map((n) => (n.id === 'r' ? { ...n, clipContent: true } : n)),
  ])
    assert.equal(
      designPageSchema.safeParse({ id: 'p', name: 'P', nodes: invalid })
        .success,
      false,
    )
})

test('grouping and masks persist atomically, merge unrelated edits and undo without losing children', () => {
  const base = createSeed()
  const nodes = [
    make('rectangle', 'shape', { order: 1 }),
    make('text', 'label', { x: 20, y: 20, order: 2 }),
  ]
  base.design.pages = [{ id: 'p', name: 'P', nodes }]
  const edited = structuredClone(base)
  edited.design.pages![0].nodes = groupDesignElements(
    nodes,
    ['shape', 'label'],
    'g',
    'Masked',
    'mask',
  )
  const ops = diffWorkspace(base, edited)
  const remote = structuredClone(base)
  remote.design.pages![0].nodes[1].text = 'Remote edit'
  const merged = applyOperations(remote, ops)
  assert.equal(
    merged.design.pages![0].nodes.find((n) => n.id === 'label')!.text,
    'Remote edit',
  )
  const restored = applyOperations(
    merged,
    ops.map((op) => ({ path: op.path, before: op.after, after: op.before })),
  )
  assert.deepEqual(restored.design, remote.design)
})
