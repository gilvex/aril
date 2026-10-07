import { useWorkspace } from '@/entities/workspace/index.ts'
import { useCanvasFullscreen } from '@/features/canvasFullscreen/index.ts'
import { useMultiplayer } from '@/features/liveSession/index.ts'
import { createStudioState } from '@/pages/studio/model/createStudioState.ts'
import { useStudioModel } from '@/pages/studio/model/useStudioModel.ts'
import { CanvasBoard } from '@/pages/studio/ui/CanvasBoard.tsx'
import { WireframeBoard } from '@/pages/studio/ui/WireframeBoard.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useCompactLayout } from '@/shared/model/useCompactLayout.ts'
import { saveStudioRoute } from '@/shared/utils/saveStudioRoute.ts'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useStudioFocusManagement } from '../model/useStudioFocusManagement.ts'
import { useStudioFollowing } from '../model/useStudioFollowing.ts'
import { useStudioWorkspaceActions } from '../model/useStudioWorkspaceActions.ts'
import type { UseStudioControllerProps } from '../types/useStudioControllerProps.ts'
import { FollowStatus } from '../ui/FollowStatus.tsx'
export function useStudioController({
  initial,
  studio,
  initialProfile,
  recovery,
}: UseStudioControllerProps) {
  const { t } = useTranslation()

  const full = useCanvasFullscreen()
  const state = useWorkspace(initial, studio.id, initialProfile.id, recovery)
  const multiplayer = useMultiplayer(initialProfile, state.receive, studio.id)
  const { workspace, change } = state
  const {
    view,
    setView,
    canvasMode,
    setCanvasMode,
    boardId,
    setBoardId,
    requirementId,
    setRequirementId,
    sidebarOpen,
    setSidebarOpen,
    navigationCollapsed,
    setNavigationCollapsed,
    collaborationPanel,
    setCollaborationPanel,
    notice,
    setNotice,
    modal,
    setModal,
    boardName,
    setBoardName,
    pendingImport,
    setPendingImport,
    snapshots,
    setSnapshots,
    historyLoading,
    setHistoryLoading,
    followId,
    setFollowId,
  } = useStudioModel(() => createStudioState(workspace, recovery))

  const BoardCanvas = canvasMode === 'wireframes' ? WireframeBoard : CanvasBoard

  const compact = useCompactLayout()

  const { sidebarRef, actionsMenu, mobileMenuToggle } =
    useStudioFocusManagement({ compact, sidebarOpen, modal })
  const importRef = useRef<HTMLInputElement>(null)
  const board =
    workspace.boards.find((b) => b.id === boardId) || workspace.boards[0]
  const routedRequirementId = workspace.requirements.find(
    (item) => item.id === requirementId,
  )?.id
  useEffect(() => {
    saveStudioRoute({
      workspaceId: studio.id,
      boardId: board.id,
      view,
      canvasMode,
      requirementId: routedRequirementId,
    })
  }, [studio.id, board.id, view, canvasMode, routedRequirementId])
  const { sendPresence } = multiplayer

  const { followed } = useStudioFollowing({
    multiplayer,
    followId,
    sendPresence,
    setFollowId,
    setNotice,
    t,
    workspace,
    setView,
    setCanvasMode,
    setBoardId,
    setRequirementId,
  })
  const followStatus = useMemo(
    () =>
      followed && (
        <FollowStatus followed={followed} setFollowId={setFollowId} />
      ),
    [followed, setFollowId],
  )
  const present = useMemo(
    () => [
      ...(multiplayer.connected
        ? [
            {
              profile: multiplayer.profile,
              view: view === 'canvas' ? canvasMode : view,
              boardId: view === 'canvas' ? board.id : null,
            },
          ]
        : []),
      ...multiplayer.peers,
    ],
    [
      multiplayer.connected,
      multiplayer.profile,
      multiplayer.peers,
      view,
      canvasMode,
      board.id,
    ],
  )
  useEffect(() => {
    sendPresence(
      {
        view: view === 'canvas' ? canvasMode : view,
        boardId: view === 'canvas' ? board.id : null,
        cursor: null,
        ...(view !== 'notes' ? { selected: [] } : {}),
        selectedEdges: [],
        camera: null,
        dragging: [],
        ...(view !== 'requirements' ? { requirement: null } : {}),
      },
      true,
    )
  }, [view, canvasMode, board.id, sendPresence])
  const navigateBoard = useCallback(
    (id: string) => {
      setBoardId(id)
      setView('canvas')
      setSidebarOpen(false)
    },
    [setBoardId, setView, setSidebarOpen],
  )
  const { loadHistory, exportWorkspace, downloadWorkspace } =
    useStudioWorkspaceActions({
      setModal,
      setSidebarOpen,
      state,
      workspace,
      setHistoryLoading,
      setSnapshots,
      studio,
      setNotice,
    })
  return {
    full,
    followed,
    followId,
    setFollowId,
    compact,
    sidebarOpen,
    setSidebarOpen,
    sidebarRef,
    navigationCollapsed,
    setNavigationCollapsed,
    state,
    multiplayer,
    setNotice,
    setCollaborationPanel,
    setModal,
    loadHistory,
    importRef,
    exportWorkspace,
    view,
    setView,
    setRequirementId,
    present,
    actionsMenu,
    collaborationPanel,
    followStatus,
    setPendingImport,
    notice,
    BoardCanvas,
    board,
    canvasMode,
    workspace,
    setBoardId,
    setCanvasMode,
    setBoardName,
    change,
    sendPresence,
    requirementId,
    navigateBoard,
    mobileMenuToggle,
    modal,
    downloadWorkspace,
    boardName,
    pendingImport,
    historyLoading,
    snapshots,
  }
}
