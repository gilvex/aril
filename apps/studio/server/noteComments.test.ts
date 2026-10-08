import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
import { createSeed } from '@pomegranate/domain/seed'
import {
  applyOperations,
  diffWorkspace,
  presenceSchema,
} from '@pomegranate/domain/collaboration'
import { workspaceSchema } from '@pomegranate/domain/workspace'
import { noteBodyKey } from '../src/widgets/notes/utils/noteBodyKey.ts'

test('independent note comments merge by ID, survive body edits, and retain conflict protection', () => {
  const base = createSeed()
  const comment = {
    id: randomUUID(),
    noteId: 'project-notes',
    authorId: randomUUID(),
    authorName: 'Alex',
    body: 'Review this decision',
    quote: 'Original wording',
    createdAt: Date.now(),
    resolved: false,
  }
  const alice = { ...base, noteComments: [comment] }
  const bob = {
    ...base,
    noteComments: [{ ...comment, id: randomUUID(), body: 'Another comment' }],
  }
  const first = applyOperations(base, diffWorkspace(base, alice))
  const merged = applyOperations(first, diffWorkspace(base, bob))
  assert.equal(merged.noteComments?.length, 2)
  const edited = applyOperations(
    merged,
    diffWorkspace(base, { ...base, notes: 'Changed note text' }),
  )
  assert.equal(edited.noteComments?.[0].quote, comment.quote)
  assert.equal(edited.notes, 'Changed note text')
  const resolved = applyOperations(edited, [
    {
      path: ['noteComments', comment.id, 'resolved'],
      before: false,
      after: true,
    },
  ])
  assert.equal(resolved.noteComments?.[0].resolved, true)
  assert.throws(() =>
    applyOperations(resolved, [
      {
        path: ['noteComments', comment.id, 'body'],
        before: 'stale',
        after: 'Replacement',
      },
    ]),
  )
  assert.equal(
    workspaceSchema.safeParse({ ...base, noteComments: [comment, comment] })
      .success,
    false,
  )
  assert.equal(
    workspaceSchema.safeParse({
      ...base,
      noteComments: [{ ...comment, body: '   ' }],
    }).success,
    false,
  )
})

test('Notes presence bounds selections and pointers without changing legacy presence', () => {
  const base = {
    clientId: randomUUID(),
    boardId: null,
    view: 'notes',
    cursor: null,
    selected: ['note:project-notes'],
  }
  const note = {
    id: 'project-notes',
    surface: 'edit',
    bodyKey: noteBodyKey('hello'),
    selection: { start: 0, end: 5, quote: 'hello' },
    pointer: { x: 0.5, y: 0.25 },
  }
  assert.deepEqual(presenceSchema.parse({ ...base, note }).note, note)
  assert.equal(presenceSchema.parse(base).note, undefined)
  assert.equal(presenceSchema.parse({ ...base, note: null }).note, null)
  assert.equal(
    presenceSchema.safeParse({
      ...base,
      note: { ...note, selection: { start: 5, end: 0, quote: '' } },
    }).success,
    false,
  )
  assert.equal(
    presenceSchema.safeParse({
      ...base,
      note: { ...note, pointer: { x: Infinity, y: 0 } },
    }).success,
    false,
  )
  assert.equal(
    presenceSchema.safeParse({
      ...base,
      note: {
        ...note,
        selection: { start: 0, end: 5000, quote: 'x'.repeat(2001) },
      },
    }).success,
    false,
  )
  assert.notEqual(noteBodyKey('hello'), noteBodyKey('world'))
})
