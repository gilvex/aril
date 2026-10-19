import { canvasClipboardSchema } from '../config/canvasClipboardSchema.ts'
import type { Board } from '../types/board.ts'
export function pasteCanvasNodes(
  board: Board,
  input: unknown,
  offset = 40,
  id: () => string = () => crypto.randomUUID(),
) {
  const parsed = canvasClipboardSchema.safeParse(input)
  if (
    !parsed.success ||
    board.nodes.length + parsed.data.nodes.length > 500 ||
    board.edges.length + parsed.data.edges.length > 2000
  )
    return null
  while(parsed.data.nodes.some(node=>board.nodes.some(existing=>existing.position.x===node.position.x+offset && existing.position.y===node.position.y+offset)))offset+=40
  const ids = new Map(parsed.data.nodes.map((node) => [node.id, id()]))
  const nodes = parsed.data.nodes.map((node) => ({
    ...node,
    id: ids.get(node.id)!,
    position: { x: node.position.x + offset, y: node.position.y + offset },
  }))
  const edges = parsed.data.edges.map((edge) => ({
    ...edge,
    id: id(),
    source: ids.get(edge.source)!,
    target: ids.get(edge.target)!,
  }))
  return {
    board: {
      ...board,
      nodes: [...board.nodes, ...nodes],
      edges: [...board.edges, ...edges],
    },
    selected: nodes.map((node) => node.id),
  }
}
