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
              nodes: indexed(board.nodes),
              edges: indexed(board.edges),
              wireframe: {
                nodes: indexed(board.wireframe?.nodes || []),
                edges: indexed(board.wireframe?.edges || []),
              },
            },
          ],
        ),
      ),
      requirements: indexed(workspace.requirements),
      notes: workspace.notes,
      design: workspace.design,
    }),
  ) as Json
}
