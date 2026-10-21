import { Text } from '@/shared/ui/Text.tsx'
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
      <Text as="h2" id="modal-title">
        {t('Reload the saved workspace?')}
      </Text>
      <Text as="p">
        {t(
          'This discards this tab’s unsaved edits and opens the latest server version. Export your edits first if you want to keep them.',
        )}
      </Text>
      <div className="modal-actions">
        <button className="button" onClick={() => setModal(null)}>
          <Text>{t('Keep editing')}</Text>
        </button>
        <button className="button" onClick={exportWorkspace}>
          <Text>{t('Export my edits')}</Text>
        </button>
        <button className="button destructive" onClick={handleClick}>
          <Text>{t('Discard edits and reload')}</Text>
        </button>
      </div>
    </>
  )
}
