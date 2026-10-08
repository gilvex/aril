import type { DesignElement } from '../../design/types/designElement.ts'
import { designElementSchema } from '../../design/config/designElementSchema.ts'
import type { DesignLibrary } from '../types/designLibrary.ts'
import { designVariableValues } from './designVariableValues.ts'
export function resolveDesignBindings(
  nodes: DesignElement[],
  library: DesignLibrary,
  modes: Record<string, string> = {},
  runtime: Record<string, string | number | boolean> = {},
) {
  const values = { ...designVariableValues(library, modes), ...runtime }
  return nodes.map((node) => {
    let resolved = node
    for (const [property, id] of Object.entries(node.bindings || {})) {
      if (!Object.hasOwn(values, id)) continue
      const parsed = designElementSchema.safeParse({
        ...resolved,
        [property]: values[id],
      })
      if (parsed.success) resolved = parsed.data
    }
    return resolved
  })
}
