import assert from 'node:assert/strict'
import { test } from 'node:test'
import { syncWorkspaceTabs } from '../src/shared/utils/syncWorkspaceTabs.ts'
import { workspaceTabsSlice } from '../src/pages/studio/model/slices/workspaceTabsSlice.ts'

test('saved open tabs drop deleted workspaces, refresh metadata and preserve order without opening other workspaces', (t) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage')
  const memory = new Map()
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => memory.set(key, value),
    },
  })
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'sessionStorage', original)
    else Reflect.deleteProperty(globalThis, 'sessionStorage')
  })
  const studio = {
    id: 'kept',
    name: 'Renamed',
    role: 'owner',
    createdAt: 'fixture',
  }
  const removed = { ...studio, id: 'deleted', name: 'Deleted' }
  const unopened = { ...studio, id: 'unopened', name: 'Unopened' }
  memory.set(
    'aril:workspaceTabs:owner',
    JSON.stringify([removed, { ...studio, name: 'Old' }, studio]),
  )
  memory.set('aril:workspaceTabs:other', JSON.stringify([removed]))
  const tabs = syncWorkspaceTabs('owner', [studio, unopened])
  assert.deepEqual(tabs, [studio])
  assert.deepEqual(JSON.parse(memory.get('aril:workspaceTabs:owner')), [studio])
  assert.deepEqual(JSON.parse(memory.get('aril:workspaceTabs:other')), [
    removed,
  ])
  const state = { tabs: [removed, { ...studio, name: 'Old' }] }
  assert.deepEqual(
    workspaceTabsSlice.reducer(state, workspaceTabsSlice.actions.replaced(tabs))
      .tabs,
    [studio],
  )
  assert.deepEqual(syncWorkspaceTabs('owner', []), [])
  assert.deepEqual(JSON.parse(memory.get('aril:workspaceTabs:owner')), [])
  memory.set('aril:workspaceTabs:owner', '{"bad":"shape"}')
  assert.deepEqual(syncWorkspaceTabs('owner', [studio]), [])
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: {
      getItem: () => {
        throw Error('Blocked')
      },
    },
  })
  assert.equal(syncWorkspaceTabs('owner', [studio]), null)
  // Failed/offline refreshes cannot supply an authoritative list and never replace these tabs.
  assert.deepEqual(state.tabs, [removed, { ...studio, name: 'Old' }])
})
