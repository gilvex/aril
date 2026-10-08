import {
  noteTextSnapshot,
  noteTextStateSchema,
  mergeNoteText,
  setNoteText,
  isNoteTextUndo,
  writeNoteText,
  readNoteText,
} from '../../noteText/index.ts'
import { type Workspace } from '../../workspace/index.ts'
import { operationsSchema } from '../config/operationsSchema.ts'
import type { Json } from '../types/json.ts'
import type { Operation } from '../types/operation.ts'
import { documentOf } from './documentOf.ts'
import { equal } from './equal.ts'
import { MergeConflict } from './mergeConflict.ts'
import { object } from './object.ts'
import { workspaceOf } from './workspaceOf.ts'
export function applyOperations(
  workspace: Workspace,
  operations: Operation[],
  check = true,
): Workspace {
  const doc = documentOf(workspace)
  const conflicts: string[] = []
  for (const op of operationsSchema.parse(operations) as Operation[]) {
    if (op.path[0] === 'noteText') continue
    if (
      ![
        'boards',
        'requirements',
        'notes',
        'noteComments',
        'notesTitle',
        'documents',
        'design',
      ].includes(op.path[0])
    )
      throw new Error('Unsupported change path')
    let parent = doc as Record<string, Json>
    let missing = false
    for (const part of op.path.slice(0, -1)) {
      if (!Object.hasOwn(parent, part) || !object(parent[part])) {
        missing = true
        break
      }
      parent = parent[part] as Record<string, Json>
    }
    const key = op.path.at(-1)!
    const current = missing ? undefined : parent[key]
    if (!missing && equal(current, op.after)) continue
    if (missing || (check && !equal(current, op.before))) {
      conflicts.push(op.path.join(' / '))
      continue
    }
    if (op.after === undefined) delete parent[key]
    else parent[key] = structuredClone(op.after)
  }
  if (conflicts.length) throw new MergeConflict(conflicts)
  workspace = workspaceOf(doc)
  for (const op of operationsSchema
    .parse(operations)
    .filter((entry) => entry.path[0] === 'noteText')) {
    const id = op.path[1]
    const current = noteTextSnapshot(workspace, id)
    if (op.path.length === 2 && !current && op.after === undefined) continue
    const after = noteTextStateSchema.parse(op.after)
    if (
      op.before === undefined &&
      op.path.length === 2 &&
      current &&
      readNoteText(current) === readNoteText(after)
    ) {
      workspace = setNoteText(workspace, id, after)
      continue
    }
    const before = noteTextStateSchema.parse(op.before)
    if (
      op.path.length !== 2 ||
      !current ||
      current.seed !== before.seed ||
      after.seed !== before.seed
    )
      throw new MergeConflict(['noteText / ' + id])
    const next = isNoteTextUndo(before, after)
      ? writeNoteText(before, readNoteText(after))
      : after
    workspace = setNoteText(workspace, id, mergeNoteText(current, next))
  }
  return workspace
}
