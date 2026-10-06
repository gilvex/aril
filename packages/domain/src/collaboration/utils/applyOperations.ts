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
    if (
      ![
        'boards',
        'requirements',
        'notes',
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
  return workspaceOf(doc)
}
