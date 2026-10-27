import { useTranslation } from '@/shared/i18n/index.ts'
import { useImportWorkspaceDialogHandlers } from '../model/useImportWorkspaceDialogHandlers.tsx'

import { FileJson } from 'lucide-react'

import type { ImportWorkspaceDialogProps } from '../types/importWorkspaceDialogProps.ts'
export function ImportWorkspaceDialog({
  pendingImport,
  exportWorkspace,
  state,
  change,
  setBoardId,
  setModal,
  setView,
  setNotice,
}: ImportWorkspaceDialogProps) {
  const { t } = useTranslation()

  const { handleClick } = useImportWorkspaceDialogHandlers({
    state,
    change,
    pendingImport,
    setBoardId,
    setModal,
    setView,
    setNotice,
  })
  return (
    <>
      <div className="modal-symbol">
        <FileJson size={25} />
      </div>
      <h2 id="modal-title">{t('Import this workspace?')}</h2>
      <p>
        {t(
          'This replaces your current boards, requirements, notes, and design direction with',
        )}
        {pendingImport.boards.length} {t('boards and')}{' '}
        {pendingImport.requirements.length}{' '}
        {t('requirements. Export first if you want a separate backup.')}
      </p>
      <div className="modal-actions">
        <button className="button" onClick={exportWorkspace}>
          {t('Export current')}
        </button>
        <button className="button primary" onClick={handleClick}>
          {t('Import workspace')}
        </button>
      </div>
    </>
  )
}
