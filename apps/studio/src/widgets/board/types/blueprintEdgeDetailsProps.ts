import type * as React from 'react'

export type BlueprintEdgeDetailsProps = {
  board: import('@aril/domain/workspace').Board
  edge: {
    id: string
    source: string
    target: string
    type: 'smoothstep'
    label?: string | undefined
  }
  editField: React.RefObject<HTMLInputElement | null>
  update: (
    board: import('@aril/domain/workspace').Board,
    record?: boolean,
  ) => void
  setSelectedEdge: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['selectedEdge']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['selectedEdge'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['selectedEdge']),
  ) => void
}
