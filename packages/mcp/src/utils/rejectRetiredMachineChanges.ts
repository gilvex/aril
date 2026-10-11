import { isDeepStrictEqual } from 'node:util'
import type { Operation } from '@pomegranate/domain/collaboration'
/** Retired definitions can round-trip or be removed, but cannot be created or edited. */
export function rejectRetiredMachineChanges(operations: Operation[]) {
  const changed = (
    path: string[],
    before: unknown,
    after: unknown,
  ): boolean => {
    if (after === undefined) return false
    const design =
      path[0] === 'design'
        ? 0
        : path[0] === 'boards' && path[2] === 'design'
          ? 2
          : -1
    if (
      design >= 0 &&
      path[design + 1] === 'library' &&
      path[design + 2] === 'machines'
    ) {
      if (isDeepStrictEqual(before, after)) return false
      if (
        path.length === design + 3 &&
        after &&
        typeof after === 'object' &&
        !Object.keys(after).length
      )
        return false
      return true
    }
    if (!after || typeof after !== 'object' || Array.isArray(after))
      return false
    const previous =
      before && typeof before === 'object'
        ? (before as Record<string, unknown>)
        : {}
    return Object.entries(after).some(([key, value]) =>
      changed([...path, key], previous[key], value),
    )
  }
  for (const op of operations)
    if (changed(op.path, op.before, op.after))
      throw new Error(
        'State machines are retired. Use component variants and variables; preserve archived machines unchanged.',
      )
}
