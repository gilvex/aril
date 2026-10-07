import type { DesignElement } from '../types/designElement.ts'
export function isDesignContainer(node: DesignElement | undefined) {
  return node?.kind === 'frame' || node?.kind === 'group'
}
