import { useCallback } from 'react'

import type { ReloadWorkspaceDialogHandlersProps } from '../types/useReloadWorkspaceDialogHandlersProps.ts'
export function useReloadWorkspaceDialogHandlers({
  state,
  setModal,
}: ReloadWorkspaceDialogHandlersProps) {
  const handleClick = useCallback<() => Promise<void>>(async () => {
    await state.reloadSaved()
    setModal(null)
  }, [state, setModal])
  return { handleClick }
}
