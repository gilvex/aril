import { useTranslation } from '@/shared/i18n/index.ts'
import { useCompactLayout } from '@/shared/model/useCompactLayout.ts'
import { empty } from '@/widgets/board/config/wireframeBoardEmpty.ts'
import { createWireframeBoardState } from '@/widgets/board/model/createWireframeBoardState.ts'
import { useFollowViewport } from '@/widgets/board/model/useFollowViewport.ts'
import { useLiveNodePositions } from '@/widgets/board/model/useLiveNodePositions.ts'
import { useWireframeBoardModel } from '@/widgets/board/model/useWireframeBoardModel.ts'
import type { WireFlowNode } from '@/widgets/board/types/wireFlowNode.ts'
import { routeWireframes } from '@/widgets/board/utils/routeWireframes.ts'
import type { DragPosition } from '@pomegranate/domain/collaboration'
import { type Wireframe } from '@pomegranate/domain/wireframe'
import { type ReactFlowInstance } from '@xyflow/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useWireframeChanges } from '../model/useWireframeChanges.ts'
import { useWireframeConnections } from '../model/useWireframeConnections.ts'
import { useWireframeEditing } from '../model/useWireframeEditing.ts'
import { useWireframeInsertion } from '../model/useWireframeInsertion.ts'
import { useWireframePreview } from '../model/useWireframePreview.ts'
import type { UseWireframeControllerProps } from '../types/useWireframeControllerProps.ts'
export function useWireframeController({
  board,
  following,
  sendPresence,
  peers,
  update,
  saveState,
}: UseWireframeControllerProps) {
  const { t } = useTranslation()

  const graph = board.wireframe || empty
  const compact = useCompactLayout()
  const {
    tool,
    setTool,
    inspectorPreference,
    setInspectorOpen,
    touchSelection,
    setTouchSelection,
    selection,
    setSelection,
    edgeId,
    setEdgeId,
    palette,
    setPalette,
    insertPoint,
    setInsertPoint,
    preview,
    setPreview,
    previewMessage,
    setPreviewMessage,
    targetId,
    setTargetId,
    trigger,
    setTrigger,
    moving,
    setMoving,
  } = useWireframeBoardModel(() => createWireframeBoardState())

  const inspectorOpen = inspectorPreference ?? false

  const inspectorToggle = useRef<HTMLButtonElement>(null)
  const editField = useRef<HTMLInputElement>(null)
  const [flow, setFlow] = useState<ReactFlowInstance<WireFlowNode> | null>(null)

  const followingClientId = following?.clientId
  useEffect(() => {
    if (followingClientId) {
      setSelection(new Set())
      setEdgeId(null)
    }
  }, [followingClientId, setEdgeId, setSelection])

  const dragPositions = useRef(new Map<string, DragPosition>())
  const selectionBefore = useRef(selection)
  const surface = useRef<HTMLDivElement>(null)
  const publishCamera = useFollowViewport(
    flow,
    surface,
    following,
    sendPresence,
  )
  const pendingFocus = useRef<string | null>(null)
  const liveNodes = useLiveNodePositions(graph.nodes, peers, moving)
  const routes = useMemo(
    () => routeWireframes(liveNodes, graph.edges),
    [liveNodes, graph.edges],
  )
  const selected = useMemo(
    () => graph.nodes.filter((n) => selection.has(n.id)),
    [graph, selection],
  )
  const node = selected.length === 1 ? selected[0] : undefined
  const edge = useMemo(
    () => graph.edges.find((e) => e.id === edgeId),
    [graph, edgeId],
  )
  const editItem = useCallback(
    (id: string, connection = false) => {
      if (preview) return
      flushSync(() => {
        setSelection(new Set(connection ? [] : [id]))
        setEdgeId(connection ? id : null)
        setInspectorOpen(true)
        setTouchSelection(false)
        setTool('select')
        setPalette(false)
        setInsertPoint(null)
      })
      editField.current?.focus()
      editField.current?.select()
    },
    [
      preview,
      setSelection,
      setEdgeId,
      setInspectorOpen,
      setTouchSelection,
      setTool,
      setPalette,
      setInsertPoint,
      editField,
    ],
  )
  const screens = useMemo(
    () => graph.nodes.filter((n) => n.data.kind === 'screen'),
    [graph],
  )
  const save = useCallback(
    (next: Wireframe, record = true) =>
      update({ ...board, wireframe: next }, record),
    [update, board],
  )
  useEffect(() => {
    const id = pendingFocus.current
    if (!id || !flow || !graph.nodes.some((n) => n.id === id)) return
    const frame = requestAnimationFrame(() => {
      pendingFocus.current = null
      void flow.fitView({ nodes: [{ id }], padding: 0.25, maxZoom: 1 })
    })
    return () => cancelAnimationFrame(frame)
  }, [flow, graph.nodes])
  useEffect(() => {
    sendPresence(
      { selected: [...selection], selectedEdges: edgeId ? [edgeId] : [] },
      true,
    )
  }, [selection, edgeId, sendPresence])
  useEffect(() => {
    if (!moving.size && (saveState === 'saved' || saveState === 'error')) {
      dragPositions.current.clear()
      sendPresence({ dragging: [] }, true)
    }
  }, [moving, saveState, sendPresence])
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (surface.current?.closest('[hidden]')) return
      if (event.key === 'Escape') {
        setPreview(false)
        setPalette(false)
      }
    }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [setPalette, setPreview])

  const { select, editData, editNode } = useWireframeEditing({
    setSelection,
    setEdgeId,
    node,
    save,
    graph,
  })
  const { follow, focus } = useWireframePreview({
    graph,
    flow,
    select,
    setPreviewMessage,
    t,
  })
  const { add, openInsertMenu, starter } = useWireframeInsertion({
    preview,
    flow,
    surface,
    setPalette,
    setInsertPoint,
    graph,
    node,
    liveNodes,
    screens,
    pendingFocus,
    save,
    select,
  })
  const { connect, duplicate } = useWireframeConnections({
    graph,
    save,
    setSelection,
    setEdgeId,
    setTargetId,
    selection,
  })
  const { onNodesChange } = useWireframeChanges({
    setSelection,
    moving,
    dragPositions,
    setMoving,
    sendPresence,
    save,
    graph,
  })
  return {
    preview,
    selectionBefore,
    selection,
    surface,
    flow,
    tool,
    setTool,
    touchSelection,
    setTouchSelection,
    inspectorToggle,
    inspectorOpen,
    setInspectorOpen,
    setPreview,
    setPalette,
    palette,
    graph,
    add,
    screens,
    compact,
    liveNodes,
    follow,
    edgeId,
    routes,
    setEdgeId,
    setSelection,
    setFlow,
    publishCamera,
    openInsertMenu,
    setInsertPoint,
    onNodesChange,
    editItem,
    connect,
    save,
    insertPoint,
    starter,
    previewMessage,
    selected,
    node,
    edge,
    focus,
    setPreviewMessage,
    duplicate,
    editField,
    editData,
    editNode,
    trigger,
    setTrigger,
    targetId,
    setTargetId,
  }
}
