import { useTranslation } from '@/shared/i18n/index.ts'
import { useStudioCanvasHandlers } from '../model/useStudioCanvasHandlers.tsx'

import { CanvasNavigation } from '@/features/boardNavigation/index.ts'
import { Suspense, useMemo } from 'react'

import type { StudioCanvasProps } from '../types/studioCanvasProps.ts'
export function StudioCanvas({
  BoardCanvas,
  full,
  board,
  canvasMode,
  followed,
  followStatus,
  workspace,
  setBoardId,
  setCanvasMode,
  present,
  setBoardName,
  setModal,
  change,
  multiplayer,
  sendPresence,
  state,
  setRequirementId,
  setView,
}: StudioCanvasProps) {
  const { t } = useTranslation()

  const peers = useMemo(
    () =>
      multiplayer.peers.filter(
        (peer) => peer.view === canvasMode && peer.boardId === board.id,
      ),
    [multiplayer.peers, canvasMode, board.id],
  )
  const { createBoard, renameBoard, updateBoard, openRequirement } =
    useStudioCanvasHandlers({
      setBoardName,
      setModal,
      change,
      board,
      setRequirementId,
      setView,
    })
  return (
    <Suspense
      fallback={
        <div className="empty-message">{t('Opening your canvas…')}</div>
      }
    >
      <BoardCanvas
        full={full}
        key={board.id + ':' + canvasMode}
        following={
          followed?.boardId === board.id && followed?.view === canvasMode
            ? followed
            : null
        }
        navigation={
          <>
            {followStatus}
            <CanvasNavigation
              board={board}
              boards={workspace.boards}
              mode={canvasMode}
              onBoard={setBoardId}
              onMode={setCanvasMode}
              present={present}
              onNew={createBoard}
              onDelete={() => setModal('delete')}
              onRename={renameBoard}
            />
          </>
        }
        board={board}
        requirements={workspace.requirements}
        peers={peers}
        sendPresence={sendPresence}
        saveState={state.saveState}
        profile={multiplayer.profile}
        update={updateBoard}
        checkpoint={state.checkpoint}
        openRequirement={openRequirement}
      />
    </Suspense>
  )
}
