import type { DesignElement } from '../types/designElement.ts'
import { designDescendants } from './designDescendants.ts'

export function removeDesignElements(
  nodes: DesignElement[],
  selected: string[],
) {
  const ids = designDescendants(nodes, selected)
  return nodes
    .filter((node) => !ids.has(node.id))
    .map((node) =>
      node.maskId && ids.has(node.maskId)
        ? { ...node, maskId: undefined }
        : node,
    )
}
