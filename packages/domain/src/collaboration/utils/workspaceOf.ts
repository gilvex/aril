import { syncDesignInstances } from '../../designLibrary/index.ts'
import { designWorkspaceOf } from './designWorkspaceOf.ts'
import { workspaceSchema, type Workspace } from '../../workspace/index.ts'
import type { Json } from '../types/json.ts'
export function workspaceOf(document: Json): Workspace {
  const value = document as Record<string, Json>
  const design = value.design as Record<string, Json>
  const boards = Object.values(value.boards as Record<string, Json>).map(
    (entry) => {
      const board = entry as Record<string, Json>
      return {
        ...board,
        ...(board.design
          ? { design: designWorkspaceOf(board.design as Record<string, Json>) }
          : {}),
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
  const workspace = workspaceSchema.parse({
    ...value,
    noteStates: Object.fromEntries(
      Object.entries((value.noteStates || {}) as Record<string, Json>).filter(
        ([id]) =>
          id === 'project-notes' ||
          Object.hasOwn((value.documents || {}) as object, id),
      ),
    ),
    design: designWorkspaceOf(design),
    boards,
    requirements: Object.values(value.requirements as object),
    noteComments: Object.values((value.noteComments || {}) as object),
    documents: Object.values((value.documents || {}) as object),
  })
  for (const design of [
    workspace.design,
    ...workspace.boards.flatMap((board) =>
      board.design ? [board.design] : [],
    ),
  ]) {
    if (design.library && design.pages)
      design.pages = design.pages.map((page) => ({
        ...page,
        nodes: syncDesignInstances(page.nodes, design.library!),
      }))
  }
  return workspaceSchema.parse(workspace)
}
