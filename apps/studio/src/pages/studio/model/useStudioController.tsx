import { useSettings } from './useSettings.ts'
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
  active = true,
}: UseStudioControllerProps) {
  const { t } = useTranslation()

  const full = useCanvasFullscreen(active)
  const settings = useSettings(studio, active)
  const canEdit = settings.role !== 'viewer' && settings.role !== null
  const state = useWorkspace(
    initial,
    studio.id,
    initialProfile.id,
    recovery,
    canEdit,
  )
  const multiplayer = useMultiplayer(
    initialProfile,
    state.receive,
    studio.id,
    active && settings.role !== null,
  )
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
    newBoardType,
    setNewBoardType,
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

  const setSettings = settings.set
  const openSettings = useCallback(
    (section: 'file' | 'user') => {
      setSettings({ section })
      setView('settings')
      setCollaborationPanel(null)
    },
    [setSettings, setView, setCollaborationPanel],
  )
  useEffect(() => {
    if (modal === 'agents') {
      setSettings({ section: 'agents' })
      setView('settings')
      setModal(null)
    }
  }, [modal, setSettings, setView, setModal])
  const BoardCanvas = canvasMode === 'wireframes' ? WireframeBoard : CanvasBoard

  const compact = useCompactLayout()

  const { sidebarRef, actionsMenu, mobileMenuToggle } =
    useStudioFocusManagement({
      compact,
      sidebarOpen: active && sidebarOpen,
      modal: active ? modal : null,
    })
  const importRef = useRef<HTMLInputElement>(null)
  const board =
    workspace.boards.find((b) => b.id === boardId) || workspace.boards[0]
  useEffect(() => {
    if (board.sections && !board.sections.includes(canvasMode))
      setCanvasMode(board.sections[0])
  }, [board.sections, canvasMode, setCanvasMode])
  const routedRequirementId = workspace.requirements.find(
    (item) => item.id === requirementId,
  )?.id
  useEffect(() => {
    if (!active) return
    saveStudioRoute({
      workspaceId: studio.id,
      boardId: board.id,
      view,
      canvasMode,
      requirementId: routedRequirementId,
    })
  }, [active, studio.id, board.id, view, canvasMode, routedRequirementId])
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
        ...(view !== 'notes' ? { note: null } : {}),
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
      active,
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
    settings,
    openSettings,
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
    newBoardType,
    setNewBoardType,
    boardName,
    pendingImport,
    historyLoading,
    snapshots,
  }
}
