import { Text } from '@/shared/ui/Text.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useDeleteBoardDialogHandlers } from '../model/useDeleteBoardDialogHandlers.tsx'

import type { DeleteBoardDialogProps } from '../types/deleteBoardDialogProps.ts'
export function DeleteBoardDialog({
  board,
  setModal,
  state,
  change,
}: DeleteBoardDialogProps) {
  const { t } = useTranslation()

  const { handleClick } = useDeleteBoardDialogHandlers({
    state,
    change,
    board,
    setModal,
  })
  return (
    <>
      <Text as="h2" id="modal-title">
        {t('Delete “')}
        {board.name}”?
      </Text>
      <Text as="p">
        {t(
          'Its nodes and connections will be removed. You can undo this or restore a saved revision.',
        )}
      </Text>
      <div className="modal-actions">
        <button className="button" onClick={() => setModal(null)}>
          <Text>{t('Keep board')}</Text>
        </button>
        <button className="button destructive" onClick={handleClick}>
          <Text>{t('Delete board')}</Text>
        </button>
      </div>
    </>
  )
}
