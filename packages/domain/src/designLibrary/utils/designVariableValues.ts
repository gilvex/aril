import type { DesignLibrary } from '../types/designLibrary.ts'
export function designVariableValues(
  library: DesignLibrary,
  modes: Record<string, string> = {},
) {
  return Object.fromEntries(
    Object.values(library.variables).map((variable) => [
      variable.id,
      variable.values[modes[variable.collectionId]] ??
        variable.values[library.collections[variable.collectionId]?.modes[0]],
    ]),
  )
}
