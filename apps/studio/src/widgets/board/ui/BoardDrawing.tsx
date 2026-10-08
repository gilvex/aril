import { useCallback } from 'react'
import { CanvasDrawing } from '@/features/canvasTools/index.ts'
import type { Board } from '@pomegranate/domain/workspace'
import type { CanvasStrokes } from '@pomegranate/domain/drawing'
export function BoardDrawing({
  board,
  update,
  wireframe = false,
  disabled = false,
}: {
  board: Board
  update: (board: Board) => void
  wireframe?: boolean
  disabled?: boolean
}) {
  const save = useCallback(
    (strokes: CanvasStrokes) => {
      update(
        wireframe
          ? {
              ...board,
              wireframe: { nodes: [], edges: [], ...board.wireframe, strokes },
            }
          : { ...board, strokes },
      )
    },
    [board, update, wireframe],
  )
  return (
    <CanvasDrawing
      scope={`${board.id}:${wireframe}`}
      disabled={disabled}
      strokes={wireframe ? board.wireframe?.strokes : board.strokes}
      onChange={save}
    />
  )
}
