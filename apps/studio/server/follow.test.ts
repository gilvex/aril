import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { cameraFromViewport, viewportFromCamera } from '@pomegranate/domain/follow'
import { presenceSchema, diffWorkspace } from '@pomegranate/domain/collaboration'
import { createSeed } from '@pomegranate/domain/seed'

test('following preserves the world center and zoom across desktop and phone sizes', () => {
  const camera = cameraFromViewport(
    { x: -300, y: 80, zoom: 1.5 },
    { width: 1200, height: 800 },
  )
  const phone = viewportFromCamera(camera, { width: 390, height: 700 })
  assert.equal(phone.zoom, 1.5)
  assert.deepEqual(
    cameraFromViewport(phone, { width: 390, height: 700 }),
    camera,
  )
  assert.deepEqual(viewportFromCamera(camera, { width: 1200, height: 800 }), {
    x: -300,
    y: 80,
    zoom: 1.5,
  })
})

test('follow presence accepts bounded cameras and older peers without cameras', () => {
  const base = {
    clientId: randomUUID(),
    boardId: 'layers',
    view: 'canvas',
    cursor: null,
    selected: [],
  }
  assert.equal(presenceSchema.parse(base).camera, null)
  const following = randomUUID()
  const parsed = presenceSchema.parse({
    ...base,
    camera: { x: 120, y: -50, zoom: 0.5 },
    following,
  })
  assert.equal(parsed.following, following)
  for (const zoom of [0, Infinity, 20])
    assert.equal(
      presenceSchema.safeParse({ ...base, camera: { x: 0, y: 0, zoom } })
        .success,
      false,
    )
  const workspace = createSeed()
  const moved = structuredClone(workspace)
  moved.boards[0].viewport = { x: 100, y: 200, zoom: 2 }
  moved.boards[0].wireframeViewport = { x: 300, y: 400, zoom: 0.5 }
  assert.deepEqual(diffWorkspace(workspace, moved), [])
})
