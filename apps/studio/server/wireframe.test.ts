import {
  applyOperations,
  diffWorkspace,
  presenceSchema,
} from '@pomegranate/domain/collaboration'
import { createSeed } from '@pomegranate/domain/seed'
import {
  makeWireNode,
  removeWireNodes,
  wireframeSchema,
  wirePosition,
} from '@pomegranate/domain/wireframe'
import { workspaceSchema } from '@pomegranate/domain/workspace'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'

test('wireframes merge by block, preserve blueprints, support undo and keep cameras private', () => {
  const original = createSeed()
  const alice = structuredClone(original),
    bob = structuredClone(original)
  const screen = makeWireNode('screen', 'screen-a', { x: 100, y: 80 })
  const button = makeWireNode('button', 'button-a', { x: 30, y: 60 }, screen.id)
  const destination = makeWireNode('screen', 'screen-b', { x: 900, y: 80 })
  alice.boards[0].wireframe = {
    nodes: [screen, button, destination],
    edges: [
      {
        id: 'flow',
        source: button.id,
        target: destination.id,
        label: 'On click',
        type: 'smoothstep',
      },
    ],
  }
  bob.boards[0].wireframe = {
    nodes: [makeWireNode('text', 'text-b', { x: 10, y: 20 })],
    edges: [],
  }
  const aliceOps = diffWorkspace(original, alice)
  const merged = applyOperations(
    applyOperations(original, aliceOps),
    diffWorkspace(original, bob),
  )
  assert.equal(merged.boards[0].wireframe!.nodes.length, 4)
  assert.deepEqual(merged.boards[0].nodes, original.boards[0].nodes)
  assert.deepEqual(merged.boards[0].edges, original.boards[0].edges)
  assert.equal(merged.boards[1].wireframe?.nodes.length || 0, 0)
  assert.deepEqual(wirePosition(button, [screen, button]), { x: 130, y: 140 })
  const camera = structuredClone(merged)
  camera.boards[0].wireframeViewport = { x: 320, y: 400, zoom: 0.5 }
  assert.deepEqual(diffWorkspace(merged, camera), [])
  const undone = applyOperations(
    merged,
    aliceOps.map((op) => ({
      path: op.path,
      before: op.after,
      after: op.before,
    })),
  )
  assert.deepEqual(
    undone.boards[0].wireframe!.nodes.map((n) => n.id),
    ['text-b'],
  )
  const resized = structuredClone(merged),
    typed = structuredClone(merged)
  resized.boards[0].wireframe!.nodes.find((n) => n.id === button.id)!.width =
    200
  typed.boards[0].wireframe!.nodes.find((n) => n.id === button.id)!.data.title =
    'Deploy'
  const together = applyOperations(resized, diffWorkspace(merged, typed))
  assert.equal(
    together.boards[0].wireframe!.nodes.find((n) => n.id === button.id)!.width,
    200,
  )
  assert.equal(
    together.boards[0].wireframe!.nodes.find((n) => n.id === button.id)!.data
      .title,
    'Deploy',
  )
  assert.throws(
    () =>
      applyOperations(
        together,
        diffWorkspace(merged, {
          ...resized,
          boards: resized.boards.map((b, i) =>
            i
              ? b
              : {
                  ...b,
                  wireframe: {
                    ...b.wireframe!,
                    nodes: b.wireframe!.nodes.map((n) =>
                      n.id === button.id
                        ? {
                            ...n,
                            data: { ...n.data, title: 'Competing title' },
                          }
                        : n,
                    ),
                  },
                },
          ),
        }),
      ),
    /Someone changed/,
  )
  const deleted = removeWireNodes(
    merged.boards[0].wireframe!,
    new Set([screen.id]),
  )
  assert.equal(
    deleted.nodes.some((n) => n.id === button.id),
    false,
  )
  assert.equal(deleted.edges.length, 0)
  const afterDelete = structuredClone(merged)
  afterDelete.boards[0].wireframe = deleted
  const deletion = diffWorkspace(merged, afterDelete)
  const restored = applyOperations(
    afterDelete,
    deletion.map((op) => ({
      path: op.path,
      before: op.after,
      after: op.before,
    })),
  )
  assert.equal(restored.boards[0].wireframe!.nodes.length, 4)
  assert.equal(restored.boards[0].wireframe!.edges.length, 1)
  assert.equal(
    workspaceSchema.parse(JSON.parse(JSON.stringify(together))).boards[0]
      .wireframe!.nodes.length,
    4,
  )
})

test('wireframes reject invalid parentage, dangling flows, duplicate IDs and invalid sizes', () => {
  const screen = makeWireNode('screen', 'screen', { x: 0, y: 0 })
  const child = makeWireNode('button', 'button', { x: 10, y: 50 }, screen.id)
  assert.equal(
    wireframeSchema.safeParse({ nodes: [screen, child], edges: [] }).success,
    true,
  )
  for (const nodes of [
    [screen, { ...child, parentId: 'missing' }],
    [screen, { ...child, parentId: child.id }],
    [{ ...screen, parentId: child.id }, child],
    [screen, screen],
    [screen, { ...child, width: -10 }],
  ])
    assert.equal(wireframeSchema.safeParse({ nodes, edges: [] }).success, false)
  assert.equal(
    wireframeSchema.safeParse({
      nodes: [screen],
      edges: [
        {
          id: 'bad',
          source: screen.id,
          target: 'missing',
          type: 'smoothstep',
          label: 'Click',
        },
      ],
    }).success,
    false,
  )
  const presence = presenceSchema.parse({
    clientId: randomUUID(),
    boardId: 'layers',
    view: 'wireframes',
    selected: [child.id],
    selectedEdges: ['flow'],
    cursor: { x: 10, y: 20 },
    dragging: [{ id: child.id, position: { x: 70, y: 80 } }],
  })
  assert.equal(presence.view, 'wireframes')
  assert.equal(presence.dragging[0].id, child.id)
})
