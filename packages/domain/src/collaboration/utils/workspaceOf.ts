import { workspaceSchema, type Workspace } from '../../workspace/index.ts'
import type { Json } from '../types/json.ts'
export function workspaceOf(document: Json): Workspace {
  const value = document as Record<string, Json>
  const boards = Object.values(value.boards as Record<string, Json>).map(
    (entry) => {
      const board = entry as Record<string, Json>
      return {
        ...board,
        nodes: Object.values(board.nodes as object),
        edges: Object.values(board.edges as object),
        wireframe: {
          nodes: Object.values(
            (board.wireframe as Record<string, Json> | undefined)?.nodes || {},
          ),
          edges: Object.values(
            (board.wireframe as Record<string, Json> | undefined)?.edges || {},
          ),
        },
      }
    },
  )
  return workspaceSchema.parse({
    ...value,
    boards,
    requirements: Object.values(value.requirements as object),
  })
}
