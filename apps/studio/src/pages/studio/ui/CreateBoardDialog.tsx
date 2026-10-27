import { Text } from '@/shared/ui/Text.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useCreateBoardDialogHandlers } from '../model/useCreateBoardDialogHandlers.tsx'

import { BoardTypeChoices } from './BoardTypeChoices.tsx'
import { Workflow } from 'lucide-react'

import type { CreateBoardDialogProps } from '../types/createBoardDialogProps.ts'
export function CreateBoardDialog({
  state,
  change,
  boardName,
  newBoardType,
  setNewBoardType,
  setCanvasMode,
  setBoardId,
  setView,
  setModal,
  setBoardName,
  workspace,
}: CreateBoardDialogProps) {
  const { t } = useTranslation()

  const { handleSubmit } = useCreateBoardDialogHandlers({
    state,
    change,
    boardName,
    newBoardType,
    setNewBoardType,
    setCanvasMode,
    setBoardId,
    setView,
    setModal,
  })
  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-symbol">
        <Workflow size={25} />
      </div>
      <Text as="h2" id="modal-title">
        {t('Room for another idea.')}
      </Text>
      <Text as="p">
        {t(
          'Create a board for a user flow, a system, or something you haven’t quite figured out yet.',
        )}
      </Text>
      <Text as="label">
        {t('Board name')}
        <input
          autoFocus
          placeholder={t('e.g. Team onboarding')}
          required
          maxLength={100}
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
        />
      </Text>
      <BoardTypeChoices
        newBoardType={newBoardType}
        setNewBoardType={setNewBoardType}
      />
      <Text as="p">{t('You can add other sections later.')}</Text>
      <div className="modal-actions">
        <button className="button" type="button" onClick={() => setModal(null)}>
          <Text>{t('Cancel')}</Text>
        </button>
        <button
          className="button primary"
          disabled={!boardName.trim() || workspace.boards.length >= 50}
        >
          <Text>{t('Create board')}</Text>
        </button>
      </div>
    </form>
  )
}
