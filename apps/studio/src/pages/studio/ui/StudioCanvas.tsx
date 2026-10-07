import { BoardDesignCanvas } from './BoardDesignCanvas.tsx'
import { LoadingStatus } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useStudioCanvasHandlers } from '../model/useStudioCanvasHandlers.tsx'

import { CanvasNavigation } from '@/features/boardNavigation/index.ts'
import { Suspense, useMemo, useCallback } from 'react'

import type { StudioCanvasProps } from '../types/studioCanvasProps.ts'
export function StudioCanvas(props: StudioCanvasProps) {
  const {
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
  } = props
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
  const addSection = useCallback(
    (section: StudioCanvasProps['canvasMode']) => {
      change((current) => ({
        ...current,
        boards: current.boards.map((item) =>
          item.id === board.id
            ? {
                ...item,
                sections: [
                  ...(item.sections || (['canvas', 'wireframes'] as const)),
                  section,
                ].filter((value, index, all) => all.indexOf(value) === index),
              }
            : item,
        ),
      }))
      setCanvasMode(section)
    },
    [board.id, change, setCanvasMode],
  )
  const chooseBoard = useCallback(
    (id: string) => {
      setBoardId(id)
      setCanvasMode(
        workspace.boards.find((item) => item.id === id)?.sections?.[0] ||
          'canvas',
      )
    },
    [setBoardId, setCanvasMode, workspace.boards],
  )
  const navigation = (
    <>
      {followStatus}
      <CanvasNavigation
        board={board}
        boards={workspace.boards}
        mode={canvasMode}
        onBoard={chooseBoard}
        onMode={setCanvasMode}
        onAdd={addSection}
        present={present}
        onNew={createBoard}
        onDelete={() => setModal('delete')}
        onRename={renameBoard}
      />
    </>
  )
  if (canvasMode === 'design')
    return (
      <Suspense
        fallback={<LoadingStatus centered label={t('Opening your canvas…')} />}
      >
        <BoardDesignCanvas key={board.id} {...props} navigation={navigation} />
      </Suspense>
    )
  return (
    <Suspense
      fallback={<LoadingStatus centered label={t('Opening your canvas…')} />}
    >
      <BoardCanvas
        full={full}
        key={board.id + ':' + canvasMode}
        following={
          followed?.boardId === board.id && followed?.view === canvasMode
            ? followed
            : null
        }
        navigation={navigation}
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
