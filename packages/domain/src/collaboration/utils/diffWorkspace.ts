import { noteTextSnapshot, readNoteText } from '../../noteText/index.ts'
import { type Workspace } from '../../workspace/index.ts'
import type { Json } from '../types/json.ts'
import type { Operation } from '../types/operation.ts'
import { documentOf } from './documentOf.ts'
import { equal } from './equal.ts'
import { object } from './object.ts'
export function diffWorkspace(
  before: Workspace,
  after: Workspace,
): Operation[] {
  const operations: Operation[] = []
  const liveNotes = new Set<string>()
  for (const [id, state] of Object.entries(after.noteStates || {})) {
    const previous = noteTextSnapshot(before, id)
    const body =
      id === 'project-notes'
        ? after.notes
        : after.documents?.find((note) => note.id === id)?.body
    if (readNoteText(state) !== body) continue
    liveNotes.add(id)
    if (!equal(previous as unknown as Json, state as unknown as Json))
      operations.push({
        path: ['noteText', id],
        before: previous ? (previous as unknown as Json) : undefined,
        after: state as unknown as Json,
      })
  }
  function visit(a: Json | undefined, b: Json | undefined, path: string[]) {
    if (
      path[0] === 'noteStates' ||
      (path[0] === 'notes' && liveNotes.has('project-notes')) ||
      (path[0] === 'documents' && path[2] === 'body' && liveNotes.has(path[1]))
    )
      return
    if (equal(a, b)) return
    if (object(a) && object(b) && path.at(-1) !== 'position') {
      for (const key of new Set([...Object.keys(a), ...Object.keys(b)]))
        visit(a[key], b[key], [...path, key])
    } else operations.push({ path, before: a, after: b })
  }
  visit(documentOf(before), documentOf(after), [])
  return operations
}
