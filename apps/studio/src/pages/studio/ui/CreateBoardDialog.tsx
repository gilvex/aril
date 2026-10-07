import { useTranslation } from '@/shared/i18n/index.ts'
import { useCreateBoardDialogHandlers } from '../model/useCreateBoardDialogHandlers.tsx'

import { StudioSelect } from '@/shared/ui/index.tsx'
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
      <h2 id="modal-title">{t('Room for another idea.')}</h2>
      <p>
        {t(
          'Create a board for a user flow, a system, or something you haven’t quite figured out yet.',
        )}
      </p>
      <label>
        {t('Board name')}
        <input
          autoFocus
          placeholder={t('e.g. Team onboarding')}
          required
          maxLength={100}
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
        />
      </label>
      <label>
        {t('Start with')}
        <StudioSelect
          value={newBoardType}
          onChange={(event) =>
            setNewBoardType(event.target.value as typeof newBoardType)
          }
        >
          <option value="canvas">{t('Blueprint')}</option>
          <option value="wireframes">{t('Wireframes')}</option>
          <option value="design">{t('Design')}</option>
        </StudioSelect>
      </label>
      <p>{t('You can add other sections later.')}</p>
      <div className="modal-actions">
        <button className="button" type="button" onClick={() => setModal(null)}>
          {t('Cancel')}
        </button>
        <button
          className="button primary"
          disabled={!boardName.trim() || workspace.boards.length >= 50}
        >
          {t('Create board')}
        </button>
      </div>
    </form>
  )
}
