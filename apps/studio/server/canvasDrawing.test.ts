import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createSeed } from '@pomegranate/domain/seed'
import { strokesSchema } from '@pomegranate/domain/drawing'
import {
  diffWorkspace,
  applyOperations,
} from '@pomegranate/domain/collaboration'
import { createCanvasToolsStore } from '../src/features/canvasTools/model/createCanvasToolsStore.ts'
import { canvasToolsSlice } from '../src/features/canvasTools/model/slices/canvasToolsSlice.ts'
import { strokePath } from '../src/features/canvasTools/utils/strokePath.ts'

const stroke = {
  points: [
    { x: -5, y: 10 },
    { x: 12, y: 20 },
    { x: 40, y: 30 },
  ],
  color: '#799fee',
  width: 3,
  opacity: 1,
}

test('strokes round-trip and merge concurrent first strokes on all canvas surfaces', () => {
  for (const surface of ['blueprint', 'wireframe', 'design', 'board-design']) {
    const base = createSeed()
    base.design.pages = [{ id: 'test', name: 'Test', nodes: [] }]
    base.boards[0].design = structuredClone(base.design)
    base.boards[0].wireframe = { nodes: [], edges: [] }
    const locate = (workspace: typeof base) =>
      surface === 'blueprint'
        ? workspace.boards[0]
        : surface === 'wireframe'
          ? workspace.boards[0].wireframe!
          : surface === 'design'
            ? workspace.design.pages![0]
            : workspace.boards[0].design!.pages![0]
    const left = structuredClone(base)
    const right = structuredClone(base)
    locate(left).strokes = { alice: stroke }
    locate(right).strokes = { bob: { ...stroke, color: '#888888' } }
    const merged = applyOperations(left, diffWorkspace(base, right))
    assert.deepEqual(
      Object.keys(locate(merged).strokes!).sort(),
      ['alice', 'bob'],
      surface,
    )
    const removed = structuredClone(merged)
    delete locate(removed).strokes!.alice
    const edited = applyOperations(merged, diffWorkspace(merged, removed))
    assert.deepEqual(Object.keys(locate(edited).strokes!), ['bob'])
    assert.deepEqual(
      locate(applyOperations(edited, diffWorkspace(removed, merged))).strokes,
      locate(merged).strokes,
    )
    assert.deepEqual(applyOperations(base, []).design, base.design)
  }
})

test('drawing schema bounds coordinates and disallows unsafe colors and excessive points', () => {
  assert.equal(strokesSchema.safeParse({ valid: stroke }).success, true)
  assert.equal(
    strokesSchema.safeParse({
      invalid: { ...stroke, color: 'url(https://example.com)' },
    }).success,
    false,
  )
  assert.equal(
    strokesSchema.safeParse({
      invalid: {
        ...stroke,
        points: [
          { x: Infinity, y: 0 },
          { x: 0, y: 0 },
        ],
      },
    }).success,
    false,
  )
  assert.equal(
    strokesSchema.safeParse({
      invalid: { ...stroke, points: Array(2001).fill({ x: 0, y: 0 }) },
    }).success,
    false,
  )
  assert.deepEqual(strokesSchema.parse(JSON.parse('{"__proto__":{}}')), {})
  assert.equal(strokesSchema.safeParse({ constructor: stroke }).success, false)
  assert.match(strokePath(stroke), /Q 12 20 26 25/)
  assert.match(strokePath(stroke), /L 40 30$/)
})

test('mode switches cancel a stroke and stores stay isolated between editors', () => {
  const first = createCanvasToolsStore()
  const second = createCanvasToolsStore()
  first.dispatch(canvasToolsSlice.actions.mode('draw'))
  first.dispatch(
    canvasToolsSlice.actions.patch({
      drawing: 'pencil',
      draft: stroke,
      pointerId: 7,
    }),
  )
  first.dispatch(canvasToolsSlice.actions.mode('dev'))
  assert.equal(first.getState().draft, null)
  assert.equal(first.getState().pointerId, null)
  assert.equal(first.getState().drawing, null)
  assert.equal(second.getState().mode, 'shapes')
})
