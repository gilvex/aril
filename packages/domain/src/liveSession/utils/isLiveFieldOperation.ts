import type { Operation } from '../../collaboration/types/operation.ts'
export function isLiveFieldOperation(operation: Operation) {
  const { path, before, after } = operation
  // Existing document fields only: never credentials, cameras, entity removal or creation.
  if (
    ![
      'boards',
      'requirements',
      'design',
      'documents',
      'notesTitle',
      'noteComments',
    ].includes(path[0])
  )
    return false
  if (
    path.length < (path[0] === 'notesTitle' ? 1 : path[0] === 'design' ? 2 : 3)
  )
    return false
  if (['id', 'source', 'target', 'parentId', 'maskId'].includes(path.at(-1)!))
    return false
  if (path[0] === 'documents' && path[2] === 'body') return false
  if (
    after === undefined ||
    (typeof after === 'object' && !Array.isArray(after))
  )
    return false
  if (
    before !== undefined &&
    typeof before === 'object' &&
    !Array.isArray(before)
  )
    return false
  return true
}
