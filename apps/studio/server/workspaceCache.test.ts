import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createSeed } from '@pomegranate/domain/seed'
import { appSlice } from '../src/app/model/slices/appSlice.ts'
import type { AppState } from '../src/app/types/appState.ts'

test('workspace cache retains independent entries, updates in place, and evicts on close or account change', () => {
  const profile = { id: 'owner', name: 'Owner', avatar: '', color: '#123456' }
  const studio = {
    id: 'first',
    name: 'First',
    role: 'owner' as const,
    createdAt: '2026-01-01',
  }
  const first = { workspace: createSeed(), revision: 1, savedAt: '2026-01-01' }
  const second = {
    ...first,
    workspace: { ...first.workspace, notes: 'Second workspace' },
  }
  let state = { sessions: [], profile, studio } as unknown as AppState
  const dispatch = (action: Parameters<typeof appSlice.reducer>[1]) => {
    state = appSlice.reducer(state, action)
  }
  const { setInitial, setStudio, setProfile, closeWorkspace } = appSlice.actions
  dispatch(setInitial(first))
  dispatch(setStudio({ ...studio, id: 'second', name: 'Second' }))
  dispatch(setInitial(second))
  const retained = state.sessions[0]
  // Returning home hides editors; it does not discard their mounted session.
  dispatch(setStudio(null))
  dispatch(setInitial(null))
  assert.equal(state.sessions.length, 2)
  assert.equal(state.sessions[0], retained)
  assert.equal(state.sessions[1].initial.workspace.notes, 'Second workspace')
  dispatch(setStudio(studio))
  dispatch(setInitial({ ...first, revision: 2 }))
  assert.equal(state.sessions.length, 2)
  assert.equal(state.sessions[0].initial.revision, 2)
  dispatch(setProfile({ ...profile, name: 'Renamed' }))
  assert.equal(state.sessions.length, 2)
  dispatch(closeWorkspace('second'))
  assert.deepEqual(
    state.sessions.map((entry) => entry.studio.id),
    ['first'],
  )
  dispatch(setProfile({ ...profile, id: 'another-user' }))
  assert.deepEqual(state.sessions, [])
  dispatch(setInitial(first))
  dispatch(setProfile(null))
  assert.deepEqual(state.sessions, [])
})
