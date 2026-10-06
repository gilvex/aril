import type { CSSProperties } from 'react'
import { useCallback, useMemo } from 'react'

import type { BlueprintFlowHandlersProps } from '../types/useBlueprintFlowHandlersProps.ts'
export function useBlueprintFlowHandlers({
  liveNodes,
  dimensions,
  selectedIds,
  board,
  selectedEdge,
  profile,
  peers,
  flow,
  canvasRef,
  setPalette,
  setInsertPoint,
  compact,
  touchSelection,
  selectionBeforePointerDown,
  setSelectedIds,
  setSelectedEdge,
  editItem,
  setSelected,
  checkpoint,
  following,
  update,
}: BlueprintFlowHandlersProps) {
  const nodes = useMemo(
    () =>
      liveNodes.map((n) => ({
        ...n,
        measured: dimensions[n.id],
        selected: selectedIds.has(n.id),
      })),
    [liveNodes, dimensions, selectedIds],
  )
  const edges = useMemo(
    () =>
      board.edges.map((e) => {
        const selectors = [
          ...(e.id === selectedEdge ? [profile] : []),
          ...peers
            .filter((peer) => peer.selectedEdges?.includes(e.id))
            .map((peer) => peer.profile),
        ]
        const color = selectors[0]?.color
        const names = [...new Set(selectors.map((person) => person.name))].join(
          ', ',
        )
        return {
          ...e,
          selected: e.id === selectedEdge,
          data: { selectors, currentUserId: profile.id },
          ariaLabel: `${e.label || 'Connection'}${names ? ` — selected by ${names}` : ''}`,
          style: color
            ? ({
                '--edge-selection-color': color,
                '--edge-selection-width': 3,
                filter: `drop-shadow(0 0 3px ${color}66)`,
              } as CSSProperties)
            : undefined,
          labelStyle: color ? { fill: color, fontWeight: 700 } : undefined,
        }
      }),
    [board, selectedEdge, profile, peers],
  )
  const handlePaneContextMenu = useCallback<
    (
      event: MouseEvent | import('react').MouseEvent<Element, MouseEvent>,
    ) => void
  >(
    (event) => {
      event.preventDefault()
      if (!flow) return
      const bounds = canvasRef.current
        ?.querySelector('.canvas-surface')
        ?.getBoundingClientRect()
      if (!bounds) return
      setPalette(false)
      setInsertPoint({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        position: flow.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        }),
      })
    },
    [flow, canvasRef, setPalette, setInsertPoint],
  )
  const handleNodeClick = useCallback<
    (
      event: import('react').MouseEvent<Element, MouseEvent>,
      clickedNode: import('@xyflow/react').Node<{
        title: string
        description: string
        kind: 'layer' | 'service' | 'database' | 'instance' | 'person' | 'note'
        status: 'Exploring' | 'Decided' | 'Question'
        notes: string
        requirements: string[]
      }>,
    ) => void
  >(
    (event, clickedNode) => {
      if (event.ctrlKey || event.metaKey || (compact && touchSelection)) {
        const next = new Set(selectionBeforePointerDown.current)
        if (next.has(clickedNode.id)) next.delete(clickedNode.id)
        else next.add(clickedNode.id)
        setSelectedIds(next)
      }
      setSelectedEdge(null)
    },
    [
      compact,
      touchSelection,
      selectionBeforePointerDown,
      setSelectedIds,
      setSelectedEdge,
    ],
  )
  const handleNodeDoubleClick = useCallback<
    (
      event: import('react').MouseEvent<Element, MouseEvent>,
      clickedNode: import('@xyflow/react').Node<{
        title: string
        description: string
        kind: 'layer' | 'service' | 'database' | 'instance' | 'person' | 'note'
        status: 'Exploring' | 'Decided' | 'Question'
        notes: string
        requirements: string[]
      }>,
    ) => void
  >(
    (event, clickedNode) => {
      event.stopPropagation()
      editItem(clickedNode.id)
    },
    [editItem],
  )
  const handleEdgeDoubleClick = useCallback<
    (
      event: import('react').MouseEvent<Element, MouseEvent>,
      clickedEdge: import('@xyflow/react').Edge,
    ) => void
  >(
    (event, clickedEdge) => {
      event.stopPropagation()
      editItem(clickedEdge.id, true)
    },
    [editItem],
  )
  const handleEdgeClick = useCallback<
    (
      _: import('react').MouseEvent<Element, MouseEvent>,
      e: import('@xyflow/react').Edge,
    ) => void
  >(
    (_, e) => {
      setSelectedEdge(e.id)
      setSelected(null)
    },
    [setSelectedEdge, setSelected],
  )
  const handlePaneClick = useCallback<() => void>(() => {
    setSelected(null)
    setSelectedEdge(null)
    setPalette(false)
  }, [setSelected, setSelectedEdge, setPalette])
  const handleBeforeDelete = useCallback<() => Promise<true>>(async () => {
    checkpoint()
    return true
  }, [checkpoint])
  const handleMoveEnd = useCallback<
    (
      _: MouseEvent | TouchEvent | null,
      viewport: import('@xyflow/react').Viewport,
    ) => void
  >(
    (_, viewport) => {
      if (
        !following &&
        JSON.stringify(viewport) !== JSON.stringify(board.viewport)
      )
        update({ ...board, viewport }, false)
    },
    [following, board, update],
  )
  return {
    nodes,
    edges,
    handlePaneContextMenu,
    handleNodeClick,
    handleNodeDoubleClick,
    handleEdgeDoubleClick,
    handleEdgeClick,
    handlePaneClick,
    handleBeforeDelete,
    handleMoveEnd,
  }
}
