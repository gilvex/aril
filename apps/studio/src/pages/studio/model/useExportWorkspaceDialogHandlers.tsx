import { useTranslation } from '@/shared/i18n/index.ts'
import { useCallback } from 'react'

import type { ExportWorkspaceDialogHandlersProps } from '../types/useExportWorkspaceDialogHandlersProps.ts'
export function useExportWorkspaceDialogHandlers({
  workspace,
  setNotice,
  setModal,
}: ExportWorkspaceDialogHandlersProps) {
  const { t } = useTranslation()

  const handleClick = useCallback<() => Promise<void>>(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(workspace, null, 2))
      setNotice(t('Workspace JSON copied.'))
      setModal(null)
    } catch {
      setNotice(t('Select the workspace JSON and copy it with Ctrl/Cmd+C.'))
    }
  }, [workspace, setNotice, t, setModal])
  return { handleClick }
}
