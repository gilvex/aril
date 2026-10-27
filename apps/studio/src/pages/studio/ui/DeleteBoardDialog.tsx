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
      <h2 id="modal-title">
        {t('Delete “')}
        {board.name}”?
      </h2>
      <p>
        {t(
          'Its nodes and connections will be removed. You can undo this or restore a saved revision.',
        )}
      </p>
      <div className="modal-actions">
        <button className="button" onClick={() => setModal(null)}>
          {t('Keep board')}
        </button>
        <button className="button destructive" onClick={handleClick}>
          {t('Delete board')}
        </button>
      </div>
    </>
  )
}
