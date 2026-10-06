import { useTranslation } from '@/shared/i18n/index.ts'
import { useReloadWorkspaceDialogHandlers } from '../model/useReloadWorkspaceDialogHandlers.tsx'

import type { ReloadWorkspaceDialogProps } from '../types/reloadWorkspaceDialogProps.ts'
export function ReloadWorkspaceDialog({
  setModal,
  exportWorkspace,
  state,
}: ReloadWorkspaceDialogProps) {
  const { t } = useTranslation()

  const { handleClick } = useReloadWorkspaceDialogHandlers({ state, setModal })
  return (
    <>
      <h2 id="modal-title">{t('Reload the saved workspace?')}</h2>
      <p>
        {t(
          'This discards this tab’s unsaved edits and opens the latest server version. Export your edits first if you want to keep them.',
        )}
      </p>
      <div className="modal-actions">
        <button className="button" onClick={() => setModal(null)}>
          {t('Keep editing')}
        </button>
        <button className="button" onClick={exportWorkspace}>
          {t('Export my edits')}
        </button>
        <button className="button destructive" onClick={handleClick}>
          {t('Discard edits and reload')}
        </button>
      </div>
    </>
  )
}
