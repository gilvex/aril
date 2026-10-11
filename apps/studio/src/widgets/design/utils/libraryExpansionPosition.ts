import type { LibraryMapNode } from '../types/libraryMapNode.ts'
/** Find nearby free space without moving any existing node. */
export function libraryExpansionPosition(
  anchor: LibraryMapNode,
  nodes: LibraryMapNode[],
) {
  for (let ring = 1; ; ring++) {
    for (let x = ring; x >= -ring; x--) {
      for (let y = -ring; y <= ring; y++) {
        if (Math.max(Math.abs(x), Math.abs(y)) !== ring) continue
        const position = {
          x: anchor.position.x + x * 250,
          y: anchor.position.y + y * 180,
        }
        if (
          nodes.every(
            (node) =>
              Math.abs(node.position.x - position.x) >= 220 ||
              Math.abs(node.position.y - position.y) >= 150,
          )
        )
          return position
      }
    }
  }
}
