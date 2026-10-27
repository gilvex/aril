import { useCallback } from 'react'
import { CanvasDrawing } from '@/features/canvasTools/index.ts'
import type { Board } from '@aril/domain/workspace'
import type { CanvasStrokes } from '@aril/domain/drawing'
export function BoardDrawing({
  board,
  update,
  checkpoint,
  wireframe = false,
  disabled = false,
}: {
  board: Board
  update: (board: Board) => void
  checkpoint: () => void
  wireframe?: boolean
  disabled?: boolean
}) {
  const save = useCallback(
    (strokes: CanvasStrokes) => {
      checkpoint()
      update(
        wireframe
          ? {
              ...board,
              wireframe: { nodes: [], edges: [], ...board.wireframe, strokes },
            }
          : { ...board, strokes },
      )
    },
    [board, update, wireframe, checkpoint],
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
