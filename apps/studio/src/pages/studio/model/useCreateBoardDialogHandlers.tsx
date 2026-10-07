import { useCallback } from 'react'

import type { CreateBoardDialogHandlersProps } from '../types/useCreateBoardDialogHandlersProps.ts'
export function useCreateBoardDialogHandlers({
  state,
  change,
  boardName,
  newBoardType,
  setCanvasMode,
  setBoardId,
  setView,
  setModal,
}: CreateBoardDialogHandlersProps) {
  const handleSubmit = useCallback<
    (e: import('react').SubmitEvent<HTMLFormElement>) => void
  >(
    (e) => {
      e.preventDefault()
      const id = crypto.randomUUID()
      state.checkpoint()
      change(
        (w) => ({
          ...w,
          boards: [
            ...w.boards,
            {
              id,
              name: boardName.trim(),
              description: 'A new space to connect your ideas.',
              sections: [newBoardType],
              nodes: [],
              edges: [],
            },
          ],
        }),
        false,
      )
      setBoardId(id)
      setCanvasMode(newBoardType)
      setView('canvas')
      setModal(null)
    },
    [
      state,
      change,
      boardName,
      newBoardType,
      setCanvasMode,
      setBoardId,
      setView,
      setModal,
    ],
  )
  return { handleSubmit }
}
