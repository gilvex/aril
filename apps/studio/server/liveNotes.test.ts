import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createSeed } from '@pomegranate/domain/seed'
import {
  applyOperations,
  diffWorkspace,
} from '@pomegranate/domain/collaboration'
import {
  writeNoteText,
  readNoteText,
  mergeNoteText,
  noteTextDelta,
  noteTextVector,
  noteTextMissing,
  setNoteText,
  mapNoteSelection,
  noteTextSnapshot,
} from '@pomegranate/domain/noteText'

test('concurrent same-note typing converges and duplicate deltas are harmless', () => {
  const base = { seed: 'Hello world', update: '' }
  const alice = writeNoteText(base, 'Hello brave world')
  const bob = writeNoteText(base, 'Hello world!')
  const ab = mergeNoteText(alice, bob),
    ba = mergeNoteText(bob, alice)
  assert.equal(readNoteText(ab), 'Hello brave world!')
  assert.equal(readNoteText(ba), readNoteText(ab))
  const delta = { seed: base.seed, update: noteTextDelta(base, alice) }
  assert.equal(
    readNoteText(mergeNoteText(mergeNoteText(bob, delta), delta)),
    readNoteText(ab),
  )
  assert.deepEqual(mapNoteSelection(base, alice, 6, 11), [12, 17])
})

test('missing and out-of-order chunks recover from state vectors without full text broadcasts', () => {
  const base = { seed: 'Long initial note. '.repeat(1000), update: '' }
  const first = writeNoteText(base, base.seed + 'A')
  const second = writeNoteText(first, base.seed + 'AB')
  const firstDelta = noteTextDelta(base, first),
    secondDelta = noteTextDelta(first, second)
  assert.ok(firstDelta.length < 200)
  let receiver = mergeNoteText(base, { seed: base.seed, update: secondDelta })
  receiver = mergeNoteText(receiver, { seed: base.seed, update: firstDelta })
  assert.equal(readNoteText(receiver), base.seed + 'AB')
  const missed = noteTextMissing(second, noteTextVector(base))
  assert.equal(
    readNoteText(mergeNoteText(base, { seed: base.seed, update: missed })),
    base.seed + 'AB',
  )
})

test('background saves merge concurrent text and undo preserves another writer', () => {
  const workspace = { ...createSeed(), notes: 'Hello world' }
  const base = noteTextSnapshot(workspace, 'project-notes')!
  const alice = setNoteText(
    workspace,
    'project-notes',
    writeNoteText(base, 'Hello brave world'),
  )
  const bob = setNoteText(
    workspace,
    'project-notes',
    writeNoteText(base, 'Hello world!'),
  )
  const operations = diffWorkspace(workspace, alice)
  const merged = applyOperations(bob, operations)
  assert.equal(merged.notes, 'Hello brave world!')
  const undone = applyOperations(
    merged,
    operations.map((op) => ({ ...op, before: op.after, after: op.before })),
  )
  assert.equal(undone.notes, 'Hello world!')
  const redone = applyOperations(undone, diffWorkspace(undone, merged))
  assert.equal(redone.notes, 'Hello brave world!')
  assert.throws(() =>
    applyOperations({ ...workspace, notes: 'Replaced elsewhere' }, operations),
  )
})

test('new notes retain CRDT state on their first save and subsequent typing rebases', () => {
  const initial = createSeed()
  const base = { seed: '', update: '' }
  const created = setNoteText(
    { ...initial, documents: [{ id: 'new-note', title: 'New', body: '' }] },
    'new-note',
    writeNoteText(base, 'First'),
  )
  const saved = applyOperations(initial, diffWorkspace(initial, created))
  assert.equal(readNoteText(noteTextSnapshot(saved, 'new-note')!), 'First')
  assert.equal(saved.noteStates?.['new-note'].seed, '')
  const typed = setNoteText(
    created,
    'new-note',
    writeNoteText(created.noteStates!['new-note'], 'First second'),
  )
  assert.equal(
    applyOperations(saved, diffWorkspace(created, typed)).documents?.[0].body,
    'First second',
  )
  const removed = applyOperations(saved, [
    { path: ['documents', 'new-note'], before: saved.documents![0] },
  ])
  assert.equal(removed.noteStates?.['new-note'], undefined)
})

test('concurrent deletion, insertion and Unicode composition preserve both writers', () => {
  const base = { seed: 'Hello world', update: '' }
  const deleted = writeNoteText(base, 'world')
  const inserted = writeNoteText(base, 'Hello 🌍world')
  assert.equal(readNoteText(mergeNoteText(deleted, inserted)), '🌍world')
  const composition = writeNoteText(base, 'Hello 世界')
  const peer = writeNoteText(base, 'Welcome! Hello world')
  assert.equal(
    readNoteText(mergeNoteText(composition, peer)),
    'Welcome! Hello 世界',
  )
  assert.throws(() => writeNoteText(base, 'a'.repeat(50001)))
  assert.throws(() =>
    mergeNoteText(base, { seed: base.seed, update: 'invalid' }),
  )
})
