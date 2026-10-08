import {
  noteTextSnapshot,
  writeNoteText,
  setNoteText,
} from '@pomegranate/domain/noteText'
import { applyOperations } from '@pomegranate/domain/collaboration'
import { createSeed } from '@pomegranate/domain/seed'
import type { Envelope } from '@pomegranate/domain/workspace'
import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { setTimeout as sleep } from 'node:timers/promises'
import { createWorkspaceSession } from '../src/entities/workspace/model/createWorkspaceSession.ts'
import { createCanvasBoardModel } from '../src/widgets/board/model/createCanvasBoardModel.ts'

const originalFetch = globalThis.fetch
let memory = new Map<string, string>()
beforeEach(() => {
  memory = new Map()
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => memory.set(key, value),
      removeItem: (key: string) => memory.delete(key),
    },
  })
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => null },
  })
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: new EventTarget(),
  })
})
afterEach(() => {
  globalThis.fetch = originalFetch
})
const envelope = (): Envelope => ({
  workspace: createSeed(),
  revision: 1,
  savedAt: new Date().toISOString(),
})

test('Redux workspace autosave coalesces edits and preserves undo/redo and private cameras', async () => {
  let saved = envelope(),
    writes = 0
  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(String(init?.body))
    assert.equal(body.baseRevision, saved.revision)
    saved = {
      ...saved,
      workspace: applyOperations(saved.workspace, body.operations),
      revision: saved.revision + 1,
    }
    writes++
    return Response.json(saved)
  }
  const session = createWorkspaceSession(saved, 'fixture', 'owner')
  const stop = session.start()
  try {
    session.change((workspace) => ({ ...workspace, notes: 'first' }))
    session.change((workspace) => ({ ...workspace, notes: 'second' }))
    assert.equal(session.store.getState().canUndo, true)
    assert.equal(writes, 0)
    await sleep(330)
    assert.equal(writes, 1)
    assert.equal(saved.workspace.notes, 'second')
    assert.equal(session.store.getState().saveState, 'saved')
    assert.equal(
      [...memory.keys()].some((key) => key.includes('draft')),
      false,
    )
    session.undo()
    assert.equal(session.store.getState().workspace.notes, createSeed().notes)
    assert.equal(session.store.getState().canRedo, true)
    session.redo()
    assert.equal(session.store.getState().workspace.notes, 'second')
    session.change((workspace) => ({
      ...workspace,
      boards: workspace.boards.map((board, index) =>
        index ? board : { ...board, viewport: { x: 123, y: 456, zoom: 1.2 } },
      ),
    }))
    await session.flush()
    assert.equal(writes, 1)
    assert.deepEqual(session.store.getState().workspace.boards[0].viewport, {
      x: 123,
      y: 456,
      zoom: 1.2,
    })
  } finally {
    stop()
  }
})

test('edits made during a save are committed in order without being lost', async () => {
  let saved = envelope(),
    writes = 0
  let release!: () => void
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(String(init?.body))
    if (++writes === 1) await pending
    assert.equal(body.baseRevision, saved.revision)
    saved = {
      ...saved,
      workspace: applyOperations(saved.workspace, body.operations),
      revision: saved.revision + 1,
    }
    return Response.json(saved)
  }
  const session = createWorkspaceSession(saved, 'fixture', 'owner')
  session.change((workspace) => ({ ...workspace, notes: 'first' }))
  const saving = session.flush()
  session.change((workspace) => ({ ...workspace, notes: 'while saving' }))
  release()
  assert.equal(await saving, true)
  assert.equal(writes, 2)
  assert.equal(saved.workspace.notes, 'while saving')
  assert.equal(session.store.getState().revision, 3)
})

test('stale destructive drafts stop; reloading keeps the newest document and clears undo history', async () => {
  const initial = envelope()
  const session = createWorkspaceSession(initial, 'fixture', 'owner')
  session.change((workspace) => ({
    ...workspace,
    boards: workspace.boards.slice(1),
  }))
  const incoming = {
    ...initial,
    revision: 2,
    workspace: { ...initial.workspace, notes: 'Collaborator work' },
  }
  session.receive(incoming)
  assert.equal(session.store.getState().saveState, 'error')
  assert.equal(await session.flush(), false)
  assert.equal(
    [...memory.keys()].some((key) => key.includes('draft')),
    true,
  )
  globalThis.fetch = async () => Response.json(incoming)
  await session.reloadSaved()
  assert.equal(session.store.getState().workspace.notes, 'Collaborator work')
  assert.equal(
    session.store.getState().workspace.boards.length,
    initial.workspace.boards.length,
  )
  assert.equal(session.store.getState().canUndo, false)
  assert.equal(session.store.getState().canRedo, false)
})

test('unrelated remote edits merge and survive local undo', () => {
  const initial = envelope(),
    session = createWorkspaceSession(initial, 'fixture', 'owner')
  session.change((workspace) => ({ ...workspace, notes: 'My edit' }))
  const workspace = structuredClone(initial.workspace)
  workspace.boards[0].name = 'Their board'
  session.receive({ ...initial, revision: 2, workspace })
  session.undo()
  assert.equal(session.store.getState().workspace.boards[0].name, 'Their board')
  assert.equal(
    session.store.getState().workspace.notes,
    initial.workspace.notes,
  )
})

test('canvas Redux models keep multi-selection serializable and isolated between boards', () => {
  const state = {
    localDragging: [],
    tool: 'select' as const,
    inspectorPreference: null,
    touchSelection: false,
    selectedIds: [],
    selectedEdge: null,
    dimensions: {},
    palette: false,
    insertPoint: null,
  }
  const a = createCanvasBoardModel(state),
    b = createCanvasBoardModel(state)
  a.actions.setSelectedIds(new Set(['one']))
  a.actions.setSelectedIds((current) => new Set([...current, 'two']))
  assert.deepEqual(a.store.getState().selectedIds, ['one', 'two'])
  assert.equal(a.getSnapshot().selectedIds.has('two'), true)
  assert.deepEqual(b.store.getState().selectedIds, [])
  assert.deepEqual(
    JSON.parse(JSON.stringify(a.store.getState())),
    a.store.getState(),
  )
})

test('live Notes undo and redo preserve a peer edit received before the background save', async () => {
  const initial = {
    ...envelope(),
    workspace: { ...createSeed(), notes: 'Hello world' },
  }
  const session = createWorkspaceSession(initial, 'fixture', 'owner')
  const base = noteTextSnapshot(initial.workspace, 'project-notes')!
  const remote = writeNoteText(base, 'Hello world!')
  const local = writeNoteText(remote, 'Hello brave world!')
  session.change(
    (w) => setNoteText(w, 'project-notes', local),
    true,
    (w) => setNoteText(w, 'project-notes', remote),
  )
  session.receive({
    ...initial,
    revision: 2,
    workspace: setNoteText(initial.workspace, 'project-notes', remote),
  })
  assert.equal(session.store.getState().workspace.notes, 'Hello brave world!')
  session.undo()
  assert.equal(session.store.getState().workspace.notes, 'Hello world!')
  session.redo()
  assert.equal(session.store.getState().workspace.notes, 'Hello brave world!')
  session.undo()
  assert.equal(session.store.getState().workspace.notes, 'Hello world!')
  assert.equal(session.store.getState().error, '')
})
