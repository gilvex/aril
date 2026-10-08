import { designDocumentOf } from './designDocumentOf.ts'
import { type Workspace } from '../../workspace/index.ts'
import type { Json } from '../types/json.ts'
import { indexed } from './indexed.ts'
export function documentOf(workspace: Workspace): Json {
  return JSON.parse(
    JSON.stringify({
      schemaVersion: 1,
      boards: Object.fromEntries(
        workspace.boards.map(
          ({
            viewport: _viewport,
            wireframeViewport: _wireframeViewport,
            ...board
          }) => [
            board.id,
            {
              ...board,
              strokes: board.strokes || {},
              ...(board.design
                ? { design: designDocumentOf(board.design) }
                : {}),
              nodes: indexed(board.nodes),
              edges: indexed(board.edges),
              wireframe: {
                strokes: board.wireframe?.strokes || {},
                nodes: indexed(board.wireframe?.nodes || []),
                edges: indexed(board.wireframe?.edges || []),
              },
            },
          ],
        ),
      ),
      requirements: indexed(workspace.requirements),
      notes: workspace.notes,
      noteStates: workspace.noteStates || {},
      noteComments: indexed(workspace.noteComments || []),
      notesTitle: workspace.notesTitle,
      documents: indexed(workspace.documents || []),
      design: designDocumentOf(workspace.design),
    }),
  ) as Json
}
