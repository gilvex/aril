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
  function visit(a: Json | undefined, b: Json | undefined, path: string[]) {
    if (equal(a, b)) return
    if (object(a) && object(b) && path.at(-1) !== 'position') {
      for (const key of new Set([...Object.keys(a), ...Object.keys(b)]))
        visit(a[key], b[key], [...path, key])
    } else operations.push({ path, before: a, after: b })
  }
  visit(documentOf(before), documentOf(after), [])
  return operations
}
