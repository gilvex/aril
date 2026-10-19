import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createWorkspaceHomeModel } from '../src/pages/workspaces/model/createWorkspaceHomeModel.ts'
import { createWorkspaceHomeState } from '../src/pages/workspaces/model/createWorkspaceHomeState.ts'
import { createAppModel } from '../src/app/model/createAppModel.ts'
import { createAppState } from '../src/app/model/createAppState.ts'
import { createSeed } from '@aril/domain/seed'

test('workspace list keeps failed changes retryable and synchronizes renamed and removed editor caches', async (t) => {
  const originalFetch = globalThis.fetch
  const originalLocation = Object.getOwnPropertyDescriptor(
    globalThis,
    'location',
  )
  const originalStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    'localStorage',
  )
  Object.defineProperty(globalThis, 'location', {
    configurable: true,
    value: { pathname: '/', search: '', hash: '' },
  })
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => null },
  })
  t.after(() => {
    globalThis.fetch = originalFetch
    for (const [key, value] of [
      ['location', originalLocation],
      ['localStorage', originalStorage],
    ]) {
      if (value) Object.defineProperty(globalThis, key, value)
      else Reflect.deleteProperty(globalThis, key)
    }
  })
  const studio = {
    id: 'fixture',
    name: 'Before',
    role: 'owner',
    createdAt: '2026-10-19',
  }
  const overview = {
    ...studio,
    nodes: [],
    edges: [],
    members: [],
    memberCount: 1,
    boardCount: 1,
  }
  const model = createWorkspaceHomeModel({
    ...createWorkspaceHomeState(),
    studios: [overview],
  })
  let finishRequest
  let mutations = 0
  globalThis.fetch = async (input, init) => {
    if (String(input).endsWith('/overview'))
      return Response.json([{ ...overview, name: 'After' }])
    mutations++
    assert.equal(init?.method, 'PATCH')
    return new Promise((resolve) => {
      finishRequest = resolve
    })
  }
  model.actions.setManagement({ studio, mode: 'rename' })
  model.actions.setName('After')
  const failed = new Promise((resolve) => {
    const stop = model.store.subscribe(() => {
      if (model.getSnapshot().error) {
        stop()
        resolve()
      }
    })
  })
  model.actions.changeWorkspace()
  model.actions.changeWorkspace()
  assert.equal(mutations, 1)
  finishRequest(
    Response.json(
      { error: 'The workspace changed. Refresh the list and try again.' },
      { status: 409 },
    ),
  )
  await failed
  assert.equal(model.getSnapshot().name, 'After')
  assert.ok(model.getSnapshot().management)
  await new Promise((resolve) => setImmediate(resolve))
  const changed = new Promise((resolve) => {
    const stop = model.store.subscribe(() => {
      if (
        model.getSnapshot().studios?.[0].name === 'After' &&
        !model.getSnapshot().busy
      ) {
        stop()
        resolve()
      }
    })
  })
  model.actions.changeWorkspace()
  finishRequest(new Response(null, { status: 204 }))
  await changed
  assert.equal(model.getSnapshot().management, null)
  globalThis.fetch = async (input) =>
    String(input).endsWith('/overview')
      ? Response.json({ error: 'Offline refresh' }, { status: 503 })
      : new Response(null, { status: 204 })
  model.actions.setManagement({
    studio: { ...studio, name: 'After' },
    mode: 'delete',
  })
  model.actions.setName('After')
  const deleted = new Promise((resolve) => {
    const stop = model.store.subscribe(() => {
      if (!model.getSnapshot().busy && model.getSnapshot().error) {
        stop()
        resolve()
      }
    })
  })
  model.actions.changeWorkspace()
  await deleted
  assert.deepEqual(model.getSnapshot().studios, [])
  assert.equal(model.getSnapshot().management, null)
  const app = createAppModel({
    ...createAppState(),
    sessions: [
      {
        studio,
        initial: { workspace: createSeed(), revision: 1, savedAt: 'fixture' },
        recovery: undefined,
      },
    ],
  })
  app.actions.syncWorkspaces([{ ...studio, name: 'After' }])
  assert.equal(app.getSnapshot().sessions[0].studio.name, 'After')
  app.actions.syncWorkspaces([])
  assert.deepEqual(app.getSnapshot().sessions, [])
})
