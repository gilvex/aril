import type { Operation } from '../types/operation.ts'
export function describeOperations(operations: Operation[]): string {
  if (operations.some((o) => o.path[2] === 'wireframe')) {
    if (operations.every((o) => o.path.at(-1) === 'position'))
      return 'Moved wireframe blocks'
    return operations.some((o) => o.path[3] === 'edges')
      ? 'Updated wireframe flows'
      : 'Edited wireframe blocks'
  }
  const nodes = new Set(
    operations
      .filter((o) => o.path[2] === 'nodes')
      .map((o) => `${o.path[1]}/${o.path[3]}`),
  )
  if (nodes.size) {
    const moved = operations.every((o) => o.path.at(-1) === 'position')
    return `${moved ? 'Moved' : 'Edited'} ${nodes.size} node${nodes.size === 1 ? '' : 's'}`
  }
  if (operations.some((o) => o.path[2] === 'edges'))
    return 'Updated connections'
  if (operations.some((o) => o.path[0] === 'requirements'))
    return 'Updated requirements'
  if (operations.some((o) => o.path[0] === 'notes'))
    return 'Updated project notes'
  if (operations.some((o) => o.path[0] === 'design'))
    return 'Updated design direction'
  return 'Updated boards'
}
