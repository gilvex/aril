import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  presenceSchema,
  type Presence,
  type RequirementDisclosure,
} from '@pomegranate/domain/collaboration'
import { createRequirementsModel } from '../src/widgets/requirements/model/createRequirementsModel.ts'
import { createRequirementsState } from '../src/widgets/requirements/model/createRequirementsState.ts'
import { latestRequirementDisclosure } from '../src/widgets/requirements/utils/latestRequirementDisclosure.ts'

const open: RequirementDisclosure = {
  open: true,
  version: 1,
  id: '00000000-0000-4000-8000-000000000001',
}
const closed: RequirementDisclosure = {
  open: false,
  version: 2,
  id: '00000000-0000-4000-8000-000000000002',
}
const peer: Presence = {
  clientId: '00000000-0000-4000-8000-000000000003',
  profile: { id: 'peer', name: 'Peer', color: '#aabbcc', avatar: '' },
  view: 'requirements',
  boardId: null,
  selected: [],
  cursor: null,
  seenAt: 1000,
  requirement: { id: 'R04', field: null, typing: false, properties: open },
}

test('opening and closing properties sync to a watcher without creating document edits', () => {
  const watcher = createRequirementsModel(createRequirementsState())
  const initial = watcher.getSnapshot()
  const received = latestRequirementDisclosure('R04', undefined, [peer], 1000)!
  watcher.actions.setViewState({ properties: { R04: received } })
  assert.equal(watcher.getSnapshot().properties.R04.open, true)
  const closePeer = {
    ...peer,
    requirement: { ...peer.requirement!, properties: closed },
  }
  const next = latestRequirementDisclosure('R04', received, [closePeer], 1000)!
  watcher.actions.setViewState({ properties: { R04: next } })
  assert.equal(watcher.getSnapshot().properties.R04.open, false)
  assert.deepEqual({ ...watcher.getSnapshot(), properties: {} }, initial)
  // Old heartbeats and our replicated state cannot reopen the accordion.
  assert.equal(
    latestRequirementDisclosure('R04', next, [peer, closePeer], 1000),
    next,
  )
})

test('disclosure sync ignores other requirements, other pages, and stale sessions', () => {
  assert.equal(
    latestRequirementDisclosure('R05', undefined, [peer], 1000),
    undefined,
  )
  assert.equal(
    latestRequirementDisclosure(
      'R04',
      undefined,
      [{ ...peer, view: 'notes' }],
      1000,
    ),
    undefined,
  )
  assert.equal(
    latestRequirementDisclosure('R04', undefined, [peer], 20000),
    undefined,
  )
  assert.equal(
    latestRequirementDisclosure(null, undefined, [peer], 1000),
    undefined,
  )
  assert.equal(latestRequirementDisclosure('R04', closed, [], 1000), closed)
})

test('simultaneous toggles converge independently of peer order and do not echo', () => {
  const competing = { ...closed, version: 1 }
  const other = {
    ...peer,
    requirement: { ...peer.requirement!, properties: competing },
  }
  const left = latestRequirementDisclosure(
    'R04',
    undefined,
    [peer, other],
    1000,
  )
  const right = latestRequirementDisclosure(
    'R04',
    undefined,
    [other, peer],
    1000,
  )
  assert.equal(left, competing)
  assert.equal(right, competing)
  assert.equal(
    latestRequirementDisclosure('R04', competing, [other], 1000),
    competing,
  )
})

test('presence accepts disclosure without breaking legacy clients and validates its bounds', () => {
  assert.deepEqual(presenceSchema.parse(peer).requirement?.properties, open)
  const legacy = {
    ...peer,
    requirement: { id: 'R04', field: null, typing: false },
  }
  assert.equal(presenceSchema.parse(legacy).requirement?.properties, undefined)
  for (const properties of [
    { ...open, open: 'true' },
    { ...open, version: -1 },
    { ...open, version: Infinity },
    { ...open, id: 'invalid' },
  ])
    assert.equal(
      presenceSchema.safeParse({
        ...peer,
        requirement: { ...peer.requirement, properties },
      }).success,
      false,
    )
})
