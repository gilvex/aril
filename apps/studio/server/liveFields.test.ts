import { runSaga } from 'redux-saga'
import { setTimeout as wait } from 'node:timers/promises'
import { shareWorkspaceFields } from '../src/pages/studio/model/iterators/shareWorkspaceFields.ts'
import type { LiveDocumentMessage } from '@pomegranate/domain/liveSession'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createSeed } from '@pomegranate/domain/seed'
import {
  applyOperations,
  diffWorkspace,
  presenceSchema,
  type Operation,
} from '@pomegranate/domain/collaboration'
import {
  liveDocumentMessageSchema,
  liveFieldsMessageSchema,
} from '@pomegranate/domain/liveSession'
import { projectLiveFields } from '../src/entities/workspace/utils/projectLiveFields.ts'
import { editLiveFields } from '../src/entities/workspace/utils/editLiveFields.ts'
import { isLiveFieldOperation } from '@pomegranate/domain/liveSession'
import { workspaceSlice } from '../src/entities/workspace/model/slices/workspaceSlice.ts'
import type { WorkspaceState } from '../src/entities/workspace/types/workspaceState.ts'
import type { LiveFieldPreview } from '../src/entities/workspace/types/liveFieldPreview.ts'
const peer = '00000000-0000-4000-8000-000000000001'

test('live text, select and toggle previews are immediate but never mutate durable data', () => {
  const base = createSeed()
  const changed = structuredClone(base)
  changed.requirements[0].description = 'Live description'
  changed.requirements[0].priority = 'Later'
  changed.requirements[0].workspaceWide = true
  const packet: LiveFieldPreview = {
    kind: 'fields',
    id: peer,
    sequence: 1,
    receivedAt: 100,
    operations: diffWorkspace(base, changed),
  }
  const rendered = projectLiveFields(base, { [peer]: packet })
  assert.equal(rendered.requirements[0].description, 'Live description')
  assert.equal(rendered.requirements[0].priority, 'Later')
  assert.equal(rendered.requirements[0].workspaceWide, true)
  assert.notEqual(base.requirements[0].description, 'Live description')
  assert.deepEqual(projectLiveFields(changed, { [peer]: packet }), changed)
})

test('editing beside a remote preview persists only the local edit, and conflicts keep local text', () => {
  const base = createSeed()
  const remote = structuredClone(base)
  remote.requirements[0].description = 'Peer is typing'
  const packet: LiveFieldPreview = {
    kind: 'fields',
    id: peer,
    sequence: 2,
    receivedAt: 100,
    operations: diffWorkspace(base, remote),
  }
  const previews = { [peer]: packet }
  const own = editLiveFields(base, previews, (displayed) => ({
    ...displayed,
    requirements: displayed.requirements.map((item, index) =>
      index ? item : { ...item, priority: 'Later' },
    ),
  }))
  assert.equal(
    own.requirements[0].description,
    base.requirements[0].description,
  )
  assert.deepEqual(
    diffWorkspace(base, own).map((operation) => operation.path.at(-1)),
    ['priority'],
  )
  const typing = structuredClone(base)
  typing.requirements[0].description = 'My unsaved draft'
  assert.equal(
    projectLiveFields(typing, previews).requirements[0].description,
    'My unsaved draft',
  )
  assert.throws(() => applyOperations(remote, diffWorkspace(base, typing)))
})

test('previews cannot create or delete entities, overwrite Notes CRDT, or expose personal fields', () => {
  for (const operation of [
    { path: ['profile', 'email'], before: 'a', after: 'b' },
    { path: ['boards', 'new'], after: { id: 'new', name: 'new' } },
    { path: ['requirements', 'R01'], before: {}, after: undefined },
    { path: ['documents', 'note', 'body'], before: 'a', after: 'b' },
    { path: ['noteText', 'project-notes'], before: {}, after: {} },
    { path: ['boards'], before: [], after: [] },
  ] as Operation[])
    assert.equal(isLiveFieldOperation(operation), false)
  const base = createSeed()
  const bad = {
    kind: 'fields' as const,
    id: peer,
    sequence: 3,
    receivedAt: 100,
    operations: [
      {
        path: ['requirements', base.requirements[0].id, 'priority'],
        before: base.requirements[0].priority,
        after: 'Invalid priority',
      },
    ],
  }
  assert.deepEqual(projectLiveFields(base, { [peer]: bad }), base)
})

test('out-of-order field packets cannot roll previews back and drafts expire after disconnect', () => {
  const workspace = createSeed()
  const packet: LiveFieldPreview = {
    kind: 'fields',
    id: peer,
    sequence: 8,
    receivedAt: 100,
    operations: [{ path: ['notesTitle'], after: 'Live title' }],
  }
  let state = {
    workspace,
    liveFields: {},
    saveState: 'saved',
    error: '',
    revision: 1,
    historyVersion: 0,
    tick: 0,
    canUndo: false,
    canRedo: false,
  } as WorkspaceState
  state = workspaceSlice.reducer(
    state,
    workspaceSlice.actions.liveFieldsReceived(packet),
  )
  state = workspaceSlice.reducer(
    state,
    workspaceSlice.actions.liveFieldsReceived({
      ...packet,
      sequence: 7,
      operations: [],
    }),
  )
  assert.equal(state.liveFields[peer].sequence, 8)
  state = workspaceSlice.reducer(
    state,
    workspaceSlice.actions.liveFieldsReceived({
      ...packet,
      sequence: 9,
      receivedAt: 200,
      operations: [],
    }),
  )
  assert.equal(state.liveFields[peer].operations.length, 1)
  assert.equal(state.liveFields[peer].receivedAt, 100)
  state = workspaceSlice.reducer(
    state,
    workspaceSlice.actions.liveFieldsPruned(101),
  )
  assert.deepEqual(state.liveFields, {})
  assert.equal(state.tick, 0)
  assert.equal(state.saveState, 'saved')
  assert.equal(state.canUndo, false)
})

test('live field messages are bounded and control presence never accepts raw input values', () => {
  assert.equal(
    liveDocumentMessageSchema.safeParse({ kind: 'sync', id: 'project-notes' })
      .success,
    true,
  )
  assert.equal(
    liveFieldsMessageSchema.safeParse({
      kind: 'fields',
      id: peer,
      sequence: 1,
      operations: [{ path: ['notesTitle'], after: 'a'.repeat(200001) }],
    }).success,
    false,
  )
  assert.equal(
    liveFieldsMessageSchema.safeParse({
      kind: 'fields',
      id: peer,
      sequence: 1,
      operations: [{ path: ['__proto__'], after: 'x' }],
    }).success,
    false,
  )
  const presence = presenceSchema.parse({
    clientId: peer,
    view: 'requirements',
    boardId: null,
    cursor: null,
    selected: [],
    controls: {
      route: 'requirements:',
      pointer: null,
      focus: {
        scope: 'requirement:R01',
        target: 'name:textarea:title',
        value: 'Never transmit this',
        selection: { start: 0, end: 3, fingerprint: '3:100', quote: 'secret' },
      },
    },
  })
  assert.ok(!JSON.stringify(presence).includes('Never transmit'))
  assert.ok(!JSON.stringify(presence).includes('secret'))
})

test('the live sharing Saga coalesces changes, avoids preview echo and cleans up', async () => {
  const sent: LiveDocumentMessage[] = []
  let notify: (() => void) | undefined
  let receive: ((message: LiveDocumentMessage) => void) | undefined
  let stopped = 0
  let value = 'First'
  const task = runSaga({}, shareWorkspaceFields, {
    clientId: peer,
    canEdit: true,
    pendingFields: () => [{ path: ['notesTitle'], after: value }],
    subscribeFields: (listener) => {
      notify = listener
      return () => {
        stopped++
      }
    },
    receiveFields: () => notify?.(),
    pruneFields: () => {},
    channel: {
      send: (message) => {
        sent.push(message)
      },
      subscribe: (listener) => {
        receive = listener
        return () => {
          stopped++
        }
      },
    },
  })
  try {
    await wait(150)
    assert.equal(sent.length, 1)
    receive?.({
      kind: 'fields',
      id: '00000000-0000-4000-8000-000000000002',
      sequence: 1,
      operations: [],
    })
    await wait(150)
    assert.equal(sent.length, 1)
    value = 'Second'
    notify?.()
    value = 'Latest'
    notify?.()
    await wait(150)
    assert.equal(sent.length, 2)
    assert.equal(
      sent[1].kind === 'fields' && sent[1].operations[0].after,
      'Latest',
    )
  } finally {
    task.cancel()
    await task.toPromise()
  }
  assert.equal(stopped, 2)
})

test('viewers receive shared fields but their live sharing Saga never publishes edits', async () => {
  let delivered = 0
  const sent: LiveDocumentMessage[] = []
  const task = runSaga({}, shareWorkspaceFields, {
    clientId: peer,
    canEdit: false,
    pendingFields: () => [{ path: ['notesTitle'], after: 'Forbidden' }],
    subscribeFields: () => () => {},
    pruneFields: () => {},
    receiveFields: () => {
      delivered++
    },
    channel: {
      send: (message) => {
        sent.push(message)
      },
      subscribe: (listener) => {
        listener({
          kind: 'fields',
          id: '00000000-0000-4000-8000-000000000002',
          sequence: 1,
          operations: [],
        })
        return () => {}
      },
    },
  })
  try {
    await wait(150)
    assert.equal(delivered, 1)
    assert.equal(sent.length, 0)
  } finally {
    task.cancel()
    await task.toPromise()
  }
})
