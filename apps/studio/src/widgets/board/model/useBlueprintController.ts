import { useCompactLayout } from '@/shared/model/useCompactLayout.ts'
import { createCanvasBoardState } from '@/widgets/board/model/createCanvasBoardState.ts'
import { useCanvasBoardModel } from '@/widgets/board/model/useCanvasBoardModel.ts'
import { useFollowViewport } from '@/widgets/board/model/useFollowViewport.ts'
import { useLiveNodePositions } from '@/widgets/board/model/useLiveNodePositions.ts'
import type { DragPosition } from '@pomegranate/domain/collaboration'
import type { Idea } from '@pomegranate/domain/workspace'
import { type Node, type ReactFlowInstance } from '@xyflow/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useBlueprintActions } from '../model/useBlueprintActions.ts'
import { useBlueprintChanges } from '../model/useBlueprintChanges.ts'
import { useBlueprintEditing } from '../model/useBlueprintEditing.ts'
import type { UseBlueprintControllerProps } from '../types/useBlueprintControllerProps.ts'
export function useBlueprintController({
  board,
  peers,
  saveState,
  sendPresence,
  full,
  following,
  update,
}: UseBlueprintControllerProps) {
  const {
    localDragging,
    setLocalDragging,
    tool,
    setTool,
    inspectorPreference,
    setInspectorOpen,
    touchSelection,
    setTouchSelection,
    selectedIds,
    setSelectedIds,
    selectedEdge,
    setSelectedEdge,
    dimensions,
    setDimensions,
    palette,
    setPalette,
    insertPoint,
    setInsertPoint,
  } = useCanvasBoardModel(() => createCanvasBoardState())
  const compact = useCompactLayout()

  const inspectorOpen = inspectorPreference ?? false

  const inspectorToggle = useRef<HTMLButtonElement>(null)
  const editField = useRef<HTMLInputElement>(null)
  const dragPositions = useRef(new Map<string, DragPosition>())
  const liveNodes = useLiveNodePositions(board.nodes, peers, localDragging)
  useEffect(() => {
    if (
      !localDragging.size &&
      (saveState === 'saved' || saveState === 'error')
    ) {
      dragPositions.current.clear()
      sendPresence({ dragging: [] }, true)
    }
  }, [localDragging, saveState, sendPresence])

  useEffect(() => {
    sendPresence({ selected: [...selectedIds] }, true)
  }, [selectedIds, sendPresence])
  const selectionBeforePointerDown = useRef(selectedIds)
  const selectedNodes = useMemo(
    () => board.nodes.filter((n) => selectedIds.has(n.id)),
    [board, selectedIds],
  )
  const selected = selectedNodes.length === 1 ? selectedNodes[0].id : null
  const setSelected = useCallback(
    (id: string | null) => setSelectedIds(new Set(id ? [id] : [])),
    [setSelectedIds],
  )
  const canvasRef = useRef<HTMLDivElement>(null)
  const {
    fullscreen,
    button: fullscreenButtonRef,
    toggle: toggleFullscreen,
  } = full

  const followingClientId = following?.clientId
  useEffect(() => {
    if (followingClientId) {
      setSelectedIds(new Set())
      setSelectedEdge(null)
    }
  }, [followingClientId, setSelectedEdge, setSelectedIds])
  const visibleSelectedEdge = board.edges.some(
    (edge) => edge.id === selectedEdge,
  )
    ? selectedEdge
    : null
  useEffect(() => {
    sendPresence(
      { selectedEdges: visibleSelectedEdge ? [visibleSelectedEdge] : [] },
      true,
    )
  }, [visibleSelectedEdge, sendPresence])

  const [flow, setFlow] = useState<ReactFlowInstance<
    Node<Idea['data']>
  > | null>(null)
  const surface = useRef<HTMLDivElement>(null)
  const publishCamera = useFollowViewport(
    flow,
    surface,
    following,
    sendPresence,
  )
  const node = useMemo(
    () => board.nodes.find((n) => n.id === selected),
    [board, selected],
  )
  const edge = useMemo(
    () => board.edges.find((e) => e.id === selectedEdge),
    [board, selectedEdge],
  )
  const { onConnect, editItem, updateNode } = useBlueprintEditing({
    setSelected,
    setSelectedEdge,
    setInspectorOpen,
    setTouchSelection,
    setTool,
    setPalette,
    setInsertPoint,
    editField,
    update,
    board,
    selected,
  })
  const { onNodesChange } = useBlueprintChanges({
    setSelectedIds,
    setDimensions,
    board,
    localDragging,
    dragPositions,
    setLocalDragging,
    sendPresence,
    update,
  })
  const { addNode, onDelete, removeNode } = useBlueprintActions({
    update,
    board,
    setSelected,
    setSelectedEdge,
    flow,
    setPalette,
    node,
  })
  return {
    canvasRef,
    selectionBeforePointerDown,
    selectedIds,
    fullscreen,
    surface,
    flow,
    tool,
    setTool,
    touchSelection,
    setTouchSelection,
    inspectorToggle,
    inspectorOpen,
    setInspectorOpen,
    fullscreenButtonRef,
    toggleFullscreen,
    setPalette,
    palette,
    addNode,
    compact,
    liveNodes,
    dimensions,
    selectedEdge,
    setFlow,
    publishCamera,
    setInsertPoint,
    onNodesChange,
    onDelete,
    onConnect,
    setSelectedIds,
    setSelectedEdge,
    editItem,
    setSelected,
    insertPoint,
    selectedNodes,
    node,
    edge,
    editField,
    updateNode,
    removeNode,
  }
}
