import assert from 'node:assert/strict'
import { test } from 'node:test'
import { blankStudio } from '@aril/domain/studios'
import {
  canvasClipboardSchema,
  pasteCanvasNodes,
  workspaceSchema,
} from '@aril/domain/workspace'
import {
  applyOperations,
  diffWorkspace,
  documentOf,
} from '@aril/domain/collaboration'

test('canvas paste remaps graph IDs, keeps content and icons, offsets repeats and is one undoable change', () => {
  const workspace = blankStudio('Clipboard')
  const board = workspace.boards[0]
  const node = {
    id: 'a',
    type: 'idea' as const,
    position: { x: 0, y: 0 },
    data: {
      title: '',
      description: 'First line\nSecond line',
      kind: 'block' as const,
      icon: 'router' as const,
      notes: '192.0.2.1',
      status: 'Exploring' as const,
      requirements: [],
    },
  }
  board.nodes = [node, { ...node, id: 'b', position: { x: 320, y: 0 } }]
  board.edges = [
    {
      id: 'edge',
      source: 'a',
      target: 'b',
      type: 'smoothstep',
      label: 'Ethernet',
    },
  ]
  const payload = {
    format: 'aril-canvas',
    version: 1,
    nodes: board.nodes,
    edges: board.edges,
  }
  let sequence = 0
  const pasted = pasteCanvasNodes(
    board,
    payload,
    40,
    () => `new-${++sequence}`,
  )!
  assert.deepEqual(pasted.selected, ['new-1', 'new-2'])
  assert.equal(pasted.board.edges[1].source, 'new-1')
  assert.equal(pasted.board.edges[1].target, 'new-2')
  assert.equal(
    pasted.board.nodes[2].data.description,
    'First line\nSecond line',
  )
  assert.equal(pasted.board.nodes[2].data.icon, 'router')
  assert.equal(pasted.board.nodes[2].position.x, 40)
  const repeated = pasteCanvasNodes(
    pasted.board,
    payload,
    40,
    () => `new-${++sequence}`,
  )!
  assert.equal(repeated.board.nodes[4].position.x, 80)
  const next = workspaceSchema.parse({ ...workspace, boards: [pasted.board] })
  const undo = diffWorkspace(next, workspace)
  assert.deepEqual(
    documentOf(applyOperations(next, undo)),
    documentOf(workspace),
  )
  assert.equal(pasteCanvasNodes(board, { ...payload, format: 'text' }), null)
  assert.equal(
    canvasClipboardSchema.safeParse({
      ...payload,
      edges: [{ ...board.edges[0], target: 'missing' }],
    }).success,
    false,
  )
  assert.equal(
    pasteCanvasNodes(
      {
        ...board,
        nodes: Array.from({ length: 500 }, (_, i) => ({
          ...node,
          id: String(i),
        })),
      },
      payload,
    ),
    null,
  )
})
