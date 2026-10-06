import { useTranslation } from '@/shared/i18n/index.ts'
import { useCallback } from 'react'

import type { ImportWorkspaceDialogHandlersProps } from '../types/useImportWorkspaceDialogHandlersProps.ts'
export function useImportWorkspaceDialogHandlers({
  state,
  change,
  pendingImport,
  setBoardId,
  setModal,
  setView,
  setNotice,
}: ImportWorkspaceDialogHandlersProps) {
  const { t } = useTranslation()

  const handleClick = useCallback<() => void>(() => {
    state.checkpoint()
    change(() => pendingImport, false)
    setBoardId(pendingImport.boards[0].id)
    setModal(null)
    setView('canvas')
    setNotice(t('Workspace imported. You can undo this change.'))
  }, [
    state,
    change,
    setBoardId,
    pendingImport,
    setModal,
    setView,
    setNotice,
    t,
  ])
  return { handleClick }
}
