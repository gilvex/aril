import { useCallback } from 'react'

import type { DeleteBoardDialogHandlersProps } from '../types/useDeleteBoardDialogHandlersProps.ts'
export function useDeleteBoardDialogHandlers({
  state,
  change,
  board,
  setModal,
}: DeleteBoardDialogHandlersProps) {
  const handleClick = useCallback<() => void>(() => {
    state.checkpoint()
    change(
      (w) => ({
        ...w,
        boards: w.boards.filter((b) => b.id !== board.id),
      }),
      false,
    )
    setModal(null)
  }, [state, change, board, setModal])
  return { handleClick }
}
