import { Text } from '@/shared/ui/Text.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useExportWorkspaceDialogHandlers } from '../model/useExportWorkspaceDialogHandlers.tsx'

import { Download, FileJson } from 'lucide-react'

import type { ExportWorkspaceDialogProps } from '../types/exportWorkspaceDialogProps.ts'
export function ExportWorkspaceDialog({
  workspace,
  setNotice,
  setModal,
  downloadWorkspace,
}: ExportWorkspaceDialogProps) {
  const { t } = useTranslation()

  const { handleClick } = useExportWorkspaceDialogHandlers({
    workspace,
    setNotice,
    setModal,
  })
  return (
    <>
      <div className="modal-symbol">
        <FileJson size={25} />
      </div>
      <Text as="h2" id="modal-title">
        {t('Take your ideas with you.')}
      </Text>
      <Text as="p">
        {t(
          'Download your workspace as JSON, or copy it if your browser does not support downloads.',
        )}
      </Text>
      <textarea
        className="export-json"
        aria-label={t('Workspace JSON')}
        readOnly
        value={JSON.stringify(workspace, null, 2)}
        onFocus={(e) => e.target.select()}
      />
      <div className="modal-actions">
        <button className="button" onClick={handleClick}>
          <Text>{t('Copy JSON')}</Text>
        </button>
        <button className="button primary" onClick={downloadWorkspace}>
          <Download size={15} />
          <Text>{t('Download JSON')}</Text>
        </button>
      </div>
    </>
  )
}
