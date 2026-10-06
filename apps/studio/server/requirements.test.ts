import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createSeed } from '@pomegranate/domain/seed'
import { createRequirementsState } from '../src/widgets/requirements/model/createRequirementsState.ts'
import { createRequirementsModel } from '../src/widgets/requirements/model/createRequirementsModel.ts'
import { filterRequirements } from '../src/widgets/requirements/utils/filterRequirements.ts'
import { moveRequirements } from '../src/widgets/requirements/utils/moveRequirements.ts'
import { readRequirementsPreference } from '../src/widgets/requirements/utils/readRequirementsPreference.ts'

test('requirements filters combine without changing document contents', () => {
  const workspace = createSeed()
  const original = JSON.stringify(workspace)
  const item = workspace.requirements[0]
  assert.deepEqual(filterRequirements(workspace.requirements, { query: `  ${item.id.toLowerCase()}  `, category: item.category, priority: item.priority, status: item.status }), [item])
  assert.equal(filterRequirements(workspace.requirements, { query: item.id, category: item.category, priority: item.priority, status: 'Ready' }).length, 0)
  assert.equal(filterRequirements(workspace.requirements, createRequirementsState()).length, workspace.requirements.length)
  assert.equal(JSON.stringify(workspace), original)
})

test('card and bulk moves change only targeted fields and preserve links and concurrent text', () => {
  const workspace = createSeed()
  const [first, second, third] = workspace.requirements
  first.description = 'A collaborator just edited this description'
  const next = moveRequirements(workspace, [first.id, second.id, 'deleted-id'], 'status', 'Ready')
  assert.equal(next.requirements[0].status, 'Ready')
  assert.equal(next.requirements[1].status, 'Ready')
  assert.equal(next.requirements[0].description, first.description)
  assert.equal(next.requirements[0].priority, first.priority)
  assert.equal(next.requirements[2], third)
  assert.equal(next.boards, workspace.boards)
  assert.equal(workspace.requirements[0].status, 'Captured')
  assert.equal(moveRequirements(next, [first.id], 'status', 'Ready'), next)
  assert.equal(moveRequirements(next, [first.id], 'priority', 'Ready'), next)
  const priority = moveRequirements(next, [first.id], 'priority', 'Later')
  assert.equal(priority.requirements[0].priority, 'Later')
  assert.equal(priority.requirements[0].status, 'Ready')
})

test('requirements preferences are validated and selection stays in isolated Redux models', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => key === 'owner:one' ? JSON.stringify({ view: 'board', groupBy: 'priority', detailWidth: 99999, checkedIds: ['R01'], query: 'hidden' }) : '{bad' } })
  try {
    const state = createRequirementsState('owner:one')
    assert.equal(state.view, 'board')
    assert.equal(state.groupBy, 'priority')
    assert.equal(state.detailWidth, 850)
    assert.deepEqual(state.checkedIds, [])
    assert.equal(state.query, '')
    assert.deepEqual(readRequirementsPreference('other'), {})
    const one = createRequirementsModel(state)
    const two = createRequirementsModel(createRequirementsState('other'))
    one.actions.setViewState({ checkedIds: ['R01'], status: 'Ready' })
    assert.deepEqual(one.getSnapshot().checkedIds, ['R01'])
    assert.deepEqual(two.getSnapshot().checkedIds, [])
    assert.equal(two.getSnapshot().view, 'list')
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous)
    else Reflect.deleteProperty(globalThis, 'localStorage')
  }
})
