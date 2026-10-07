import { useCallback } from 'react'
import { StudioModal } from '@/shared/ui/index.tsx'
import { WorkspacePickerDialog } from './WorkspacePickerDialog.tsx'
import { AgentAccess } from '@/features/agentAccess/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { CreateBoardDialog } from './CreateBoardDialog.tsx'
import { DeleteBoardDialog } from './DeleteBoardDialog.tsx'
import { ExportWorkspaceDialog } from './ExportWorkspaceDialog.tsx'
import { ImportWorkspaceDialog } from './ImportWorkspaceDialog.tsx'
import { ReloadWorkspaceDialog } from './ReloadWorkspaceDialog.tsx'
import { WorkspaceHistoryDialog } from './WorkspaceHistoryDialog.tsx'

import type { StudioDialogsProps } from '../types/studioDialogsProps.ts'
export function StudioDialogs({
  setModal,
  modal,
  studio,
  onOpenWorkspace,
  exportWorkspace,
  state,
  workspace,
  setNotice,
  downloadWorkspace,
  change,
  boardName,
  newBoardType,
  setNewBoardType,
  setCanvasMode,
  setBoardId,
  setView,
  setBoardName,
  board,
  pendingImport,
  historyLoading,
  snapshots,
}: StudioDialogsProps) {
  const { t } = useTranslation()
  const close = useCallback(() => setModal(null), [setModal])
  return (
    <StudioModal title={t('Workspace')} close={close}>
      {modal === 'workspaces' && (
        <WorkspacePickerDialog
          current={studio}
          beforeLeave={state.flush}
          onOpen={onOpenWorkspace}
          close={() => setModal(null)}
        />
      )}
      {modal === 'agents' && <AgentAccess workspaceId={studio.id} />}
      {modal === 'reload' && (
        <ReloadWorkspaceDialog
          setModal={setModal}
          exportWorkspace={exportWorkspace}
          state={state}
        />
      )}
      {modal === 'export' && (
        <ExportWorkspaceDialog
          workspace={workspace}
          setNotice={setNotice}
          setModal={setModal}
          downloadWorkspace={downloadWorkspace}
        />
      )}
      {modal === 'new' && (
        <CreateBoardDialog
          state={state}
          change={change}
          boardName={boardName}
          newBoardType={newBoardType}
          setNewBoardType={setNewBoardType}
          setCanvasMode={setCanvasMode}
          setBoardId={setBoardId}
          setView={setView}
          setModal={setModal}
          setBoardName={setBoardName}
          workspace={workspace}
        />
      )}
      {modal === 'delete' && (
        <DeleteBoardDialog
          board={board}
          setModal={setModal}
          state={state}
          change={change}
        />
      )}
      {modal === 'import' && pendingImport && (
        <ImportWorkspaceDialog
          pendingImport={pendingImport}
          exportWorkspace={exportWorkspace}
          state={state}
          change={change}
          setBoardId={setBoardId}
          setModal={setModal}
          setView={setView}
          setNotice={setNotice}
        />
      )}
      {modal === 'history' && (
        <WorkspaceHistoryDialog
          historyLoading={historyLoading}
          snapshots={snapshots}
          studio={studio}
          state={state}
          change={change}
          setModal={setModal}
          setNotice={setNotice}
        />
      )}
    </StudioModal>
  )
}
