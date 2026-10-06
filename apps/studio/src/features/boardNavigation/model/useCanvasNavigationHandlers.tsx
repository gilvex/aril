import { useCallback } from 'react'

import type { CanvasNavigationHandlersProps } from '../types/useCanvasNavigationHandlersProps.ts'
export function useCanvasNavigationHandlers({
  setOpen,
  open,
  setRenaming,
  onNew,
  name,
  onRename,
  toggle,
  setName,
  board,
  onDelete,
}: CanvasNavigationHandlersProps) {
  const toggleBoardPicker = useCallback<() => void>(() => {
    setOpen(!open)
    setRenaming(false)
  }, [setOpen, open, setRenaming])
  const createBoard = useCallback<() => void>(() => {
    setOpen(false)
    onNew()
  }, [setOpen, onNew])
  const renameBoard = useCallback<
    (e: import('react').SubmitEvent<HTMLFormElement>) => void
  >(
    (e) => {
      e.preventDefault()
      if (name.trim()) {
        onRename(name.trim())
        setRenaming(false)
        setOpen(false)
        toggle.current?.focus()
      }
    },
    [name, onRename, setRenaming, setOpen, toggle],
  )
  const beginRenaming = useCallback<() => void>(() => {
    setName(board.name)
    setRenaming(true)
  }, [setName, board, setRenaming])
  const deleteBoard = useCallback<() => void>(() => {
    setOpen(false)
    onDelete()
  }, [setOpen, onDelete])
  return {
    toggleBoardPicker,
    createBoard,
    renameBoard,
    beginRenaming,
    deleteBoard,
  }
}
