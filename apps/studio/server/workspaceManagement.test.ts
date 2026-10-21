import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createWorkspaceManagementModel } from '../src/features/workspaceManagement/model/createWorkspaceManagementModel.ts'

test('settings management retains drafts and refuses actions while pending edits cannot save', async () => {
  const model = createWorkspaceManagementModel()
  const studio = {
    id: 'fixture',
    name: 'Original',
    role: 'owner' as const,
    createdAt: '2026-10-21',
  }
  model.set({ management: { studio, mode: 'rename' }, name: 'New name' })
  let calls = 0
  let finish!: (saved: boolean) => void
  const pending = model.save(() => {
    calls++
    return new Promise<boolean>((resolve) => {
      finish = resolve
    })
  })
  assert.equal(model.store.getState().busy, true)
  assert.equal(
    await model.save(async () => {
      calls++
      return false
    }),
    undefined,
  )
  finish(false)
  assert.equal(await pending, undefined)
  assert.equal(calls, 1)
  assert.equal(model.store.getState().name, 'New name')
  assert.equal(model.store.getState().management?.mode, 'rename')
  assert.equal(model.store.getState().busy, false)
  assert.equal(
    model.store.getState().error,
    'Save your pending changes before managing this workspace.',
  )
})

test('settings management requires ownership and the exact deletion name before saving', async () => {
  const model = createWorkspaceManagementModel()
  const studio = {
    id: 'fixture',
    name: 'Original',
    role: 'owner' as const,
    createdAt: '2026-10-21',
  }
  const unexpectedSave = async () => {
    assert.fail('Invalid action must not save or send a request')
  }
  model.set({ management: { studio, mode: 'delete' }, name: 'Wrong name' })
  assert.equal(await model.save(unexpectedSave), undefined)
  model.set({
    management: { studio: { ...studio, role: 'viewer' }, mode: 'rename' },
    name: 'New name',
  })
  assert.equal(await model.save(unexpectedSave), undefined)
})
