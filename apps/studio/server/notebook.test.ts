import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  applyOperations,
  diffWorkspace,
} from '@pomegranate/domain/collaboration'
import { createSeed } from '@pomegranate/domain/seed'
import { workspaceSchema } from '@pomegranate/domain/workspace'
import { noteDocuments } from '../src/widgets/notes/utils/noteDocuments.ts'
import { updateNote } from '../src/widgets/notes/utils/updateNote.ts'
import { noteHeadings } from '../src/widgets/notes/utils/noteHeadings.ts'
import { formatNote } from '../src/widgets/notes/utils/formatNote.ts'

test('legacy notes remain the first document and legacy edits preserve notebook entries', () => {
  const original = createSeed()
  const parsed = workspaceSchema.parse(original)
  assert.equal(noteDocuments(parsed, 'Project notes')[0].body, original.notes)
  const added = {
    ...original,
    documents: [{ id: 'recipe', title: 'Recipe', body: 'Immutable layers' }],
  }
  const withNotes = applyOperations(added, [
    { path: ['notes'], before: original.notes, after: 'Legacy MCP edit' },
  ])
  assert.equal(withNotes.documents?.[0].body, 'Immutable layers')
  assert.equal(withNotes.notes, 'Legacy MCP edit')
  const renamed = updateNote(withNotes, 'project-notes', { title: 'Brief' })
  assert.equal(renamed.notesTitle, 'Brief')
  assert.equal(renamed.notes, withNotes.notes)
})

test('notebook operations merge independent additions and edits, protect conflicts, and undo only local changes', () => {
  const base = createSeed()
  const a = { ...base, documents: [{ id: 'a', title: 'A', body: 'Alpha' }] }
  const b = { ...base, documents: [{ id: 'b', title: 'B', body: 'Beta' }] }
  const merged = applyOperations(a, diffWorkspace(base, b))
  assert.equal(merged.documents?.length, 2)
  const editA = updateNote(merged, 'a', { body: 'Changed Alpha' })
  const editB = updateNote(merged, 'b', { title: 'Renamed B' })
  const both = applyOperations(editA, diffWorkspace(merged, editB))
  const undone = applyOperations(both, diffWorkspace(editA, merged))
  assert.equal(undone.documents?.find((n) => n.id === 'a')?.body, 'Alpha')
  assert.equal(undone.documents?.find((n) => n.id === 'b')?.title, 'Renamed B')
  assert.throws(
    () =>
      applyOperations(
        editA,
        diffWorkspace(
          merged,
          updateNote(merged, 'a', { body: 'Competing edit' }),
        ),
      ),
    /Someone changed/,
  )
  const removed = {
    ...merged,
    documents: merged.documents?.filter((n) => n.id !== 'a'),
  }
  assert.throws(
    () => applyOperations(editA, diffWorkspace(merged, removed)),
    /Someone changed/,
  )
  assert.throws(
    () => applyOperations(removed, diffWorkspace(merged, editA)),
    /Someone changed/,
  )
})

test('documents and font selections enforce limits without requiring migration', () => {
  const base = createSeed()
  assert.equal(workspaceSchema.safeParse(base).success, true)
  for (const documents of [
    [{ id: 'project-notes', title: 'Override', body: '' }],
    [
      { id: 'a', title: 'A', body: '' },
      { id: 'a', title: 'B', body: '' },
    ],
    [{ id: 'a', title: 'A', body: 'x'.repeat(50001) }],
  ])
    assert.equal(
      workspaceSchema.safeParse({ ...base, documents }).success,
      false,
    )
  assert.equal(
    workspaceSchema.safeParse({
      ...base,
      design: { ...base.design, headingFont: 'Georgia', bodyFont: 'System' },
    }).success,
    true,
  )
  assert.equal(
    workspaceSchema.safeParse({
      ...base,
      design: { ...base.design, headingFont: 'url(bad)' },
    }).success,
    false,
  )
})

test('Markdown formatting preserves surrounding text and outline ignores fenced code', () => {
  assert.deepEqual(formatNote('Before word after', 7, 11, 'Bold'), {
    body: 'Before **word** after',
    start: 9,
    end: 13,
  })
  assert.equal(
    formatNote('first\nsecond', 0, 12, 'Checklist').body,
    '- [ ] first\n- [ ] second',
  )
  assert.deepEqual(
    noteHeadings(
      '# Title\n```md\n## Not a heading\n```\n## Details\n~~~\n# Hidden\n~~~',
    ),
    [
      { line: 1, depth: 1, title: 'Title' },
      { line: 5, depth: 2, title: 'Details' },
    ],
  )
})
