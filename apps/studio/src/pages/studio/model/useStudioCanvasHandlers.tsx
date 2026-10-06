import { useCallback } from 'react'

import type { StudioCanvasHandlersProps } from '../types/useStudioCanvasHandlersProps.ts'
export function useStudioCanvasHandlers({
  setBoardName,
  setModal,
  change,
  board,
  setRequirementId,
  setView,
}: StudioCanvasHandlersProps) {
  const createBoard = useCallback<() => void>(() => {
    setBoardName('')
    setModal('new')
  }, [setBoardName, setModal])
  const renameBoard = useCallback<(name: string) => void>(
    (name) =>
      change((w) => ({
        ...w,
        boards: w.boards.map((b) => (b.id === board.id ? { ...b, name } : b)),
      })),
    [change, board],
  )
  const updateBoard = useCallback<
    (
      next: import('@pomegranate/domain/workspace').Board,
      record: boolean | undefined,
    ) => void
  >(
    (next, record) =>
      change(
        (w) => ({
          ...w,
          boards: w.boards.map((b) => (b.id === next.id ? next : b)),
        }),
        record,
      ),
    [change],
  )
  const openRequirement = useCallback<(id: string) => void>(
    (id) => {
      setRequirementId(id)
      setView('requirements')
    },
    [setRequirementId, setView],
  )
  return { createBoard, renameBoard, updateBoard, openRequirement }
}
