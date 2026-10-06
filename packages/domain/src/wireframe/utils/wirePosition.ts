import type { WireNode } from '../types/wireNode.ts'
export function wirePosition(node: WireNode, nodes: WireNode[]) {
  const parent = nodes.find((n) => n.id === node.parentId)
  return {
    x: node.position.x + (parent?.position.x || 0),
    y: node.position.y + (parent?.position.y || 0),
  }
}
