import { useTranslation } from '@/shared/i18n/index.ts'
import type { WireFlowNode } from '@/widgets/board/types/wireFlowNode.ts'
import { wireConnectionSides } from '@/widgets/board/utils/wireConnectionSides.ts'
import {
  removeWireNodes,
  wireLabels,
  wirePosition,
} from '@pomegranate/domain/wireframe'
import { MarkerType } from '@xyflow/react'
import type { CSSProperties } from 'react'
import { useCallback, useMemo } from 'react'

import type { WireframeFlowHandlersProps } from '../types/useWireframeFlowHandlersProps.ts'
export function useWireframeFlowHandlers({
  liveNodes,
  selection,
  preview,
  checkpoint,
  graph,
  follow,
  profile,
  peers,
  edgeId,
  routes,
  setEdgeId,
  setSelection,
  compact,
  touchSelection,
  selectionBefore,
  editItem,
  setPalette,
  save,
}: WireframeFlowHandlersProps) {
  const { t } = useTranslation()
  const nodes = useMemo(
    () =>
      [...liveNodes]
        .sort((a, b) => Number(!!a.parentId) - Number(!!b.parentId))
        .map((n) => ({
          ...n,
          selected: selection.has(n.id),
          measured: { width: n.width, height: n.height },
          dragHandle:
            n.data.kind === 'screen' ? '.wire-screen-title' : undefined,
          zIndex: n.data.kind === 'screen' ? 0 : 1,
          ariaLabel: `${t(wireLabels[n.data.kind])}: ${n.data.title}`,
          data: {
            ...n.data,
            preview,
            checkpoint,
            follow: graph.edges.some((e) => e.source === n.id)
              ? () => follow(n.id)
              : undefined,
            selectorColor: selection.has(n.id)
              ? profile.color
              : peers.find((p) => p.selected.includes(n.id))?.profile.color,
          },
        })),
    [
      liveNodes,
      selection,
      t,
      preview,
      checkpoint,
      graph.edges,
      profile.color,
      peers,
      follow,
    ],
  )
  const edges = useMemo(
    () =>
      graph.edges.map((e, index) => {
        const source = liveNodes.find((n) => n.id === e.source)!
        const target = liveNodes.find((n) => n.id === e.target)!
        const sides = wireConnectionSides(source, target, liveNodes)
        const selectors = [
          ...(edgeId === e.id ? [profile] : []),
          ...peers
            .filter((p) => p.selectedEdges?.includes(e.id))
            .map((p) => p.profile),
        ]
        const color = selectors[0]?.color || 'var(--wire-edge, #a34d6c)'
        return {
          ...e,
          sourceHandle: sides.sourceSide,
          targetHandle: sides.targetSide,
          hidden: preview,
          selected: edgeId === e.id,
          zIndex: 2,
          data: {
            selectors,
            currentUserId: profile.id,
            route: routes.get(e.id),
            number: index + 1,
            muted: !!edgeId && edgeId !== e.id,
            select: () => {
              setEdgeId(e.id)
              setSelection(new Set())
            },
          },
          markerEnd: { type: MarkerType.ArrowClosed, color },
          ariaLabel: `${e.label}: ${graph.nodes.find((n) => n.id === e.source)?.data.title} to ${graph.nodes.find((n) => n.id === e.target)?.data.title}`,
          style: {
            '--edge-selection-color': color,
            '--edge-selection-width': selectors.length ? 3 : 2,
          } as CSSProperties,
        }
      }),
    [
      graph,
      liveNodes,
      edgeId,
      profile,
      peers,
      preview,
      routes,
      setEdgeId,
      setSelection,
    ],
  )
  const handleNodeClick = useCallback<
    (
      event: import('react').MouseEvent<Element, MouseEvent>,
      clicked: WireFlowNode,
    ) => void
  >(
    (event, clicked) => {
      if (preview) {
        follow(clicked.id)
        return
      }
      if (event.ctrlKey || event.metaKey || (compact && touchSelection)) {
        const next = new Set(selectionBefore.current)
        if (next.has(clicked.id)) next.delete(clicked.id)
        else next.add(clicked.id)
        setSelection(next)
      }
      setEdgeId(null)
    },
    [
      preview,
      follow,
      compact,
      touchSelection,
      selectionBefore,
      setSelection,
      setEdgeId,
    ],
  )
  const handleNodeDoubleClick = useCallback<
    (
      event: import('react').MouseEvent<Element, MouseEvent>,
      clicked: WireFlowNode,
    ) => void
  >(
    (event, clicked) => {
      event.stopPropagation()
      editItem(clicked.id)
    },
    [editItem],
  )
  const handleEdgeDoubleClick = useCallback<
    (
      event: import('react').MouseEvent<Element, MouseEvent>,
      clicked: import('@xyflow/react').Edge,
    ) => void
  >(
    (event, clicked) => {
      event.stopPropagation()
      editItem(clicked.id, true)
    },
    [editItem],
  )
  const handleEdgeClick = useCallback<
    (
      _: import('react').MouseEvent<Element, MouseEvent>,
      clicked: import('@xyflow/react').Edge,
    ) => void
  >(
    (_, clicked) => {
      setEdgeId(clicked.id)
      setSelection(new Set())
    },
    [setEdgeId, setSelection],
  )
  const handlePaneClick = useCallback<() => void>(() => {
    setSelection(new Set())
    setEdgeId(null)
    setPalette(false)
  }, [setSelection, setEdgeId, setPalette])
  const handleDelete = useCallback<
    ({
      nodes,
      edges,
    }: {
      nodes: WireFlowNode[]
      edges: import('@xyflow/react').Edge[]
    }) => void
  >(
    ({ nodes, edges }) => {
      const next = removeWireNodes(graph, new Set(nodes.map((n) => n.id)))
      save({
        ...next,
        edges: next.edges.filter(
          (e) => !edges.some((removed) => removed.id === e.id),
        ),
      })
      setSelection(new Set())
      setEdgeId(null)
    },
    [graph, save, setSelection, setEdgeId],
  )
  const cursorNodes = useMemo(
    () =>
      liveNodes.map((n) => ({
        ...n,
        position: wirePosition(n, liveNodes),
      })),
    [liveNodes],
  )
  const getNodeColor = useCallback<
    (
      n: import('@xyflow/react').Node,
    ) => 'var(--surface-raised, #ede8ef)' | 'var(--minimap-node, #b9a7b8)'
  >(
    (n) =>
      n.data.kind === 'screen'
        ? 'var(--surface-raised, #ede8ef)'
        : 'var(--minimap-node, #b9a7b8)',
    [],
  )
  return {
    nodes,
    edges,
    handleNodeClick,
    handleNodeDoubleClick,
    handleEdgeDoubleClick,
    handleEdgeClick,
    handlePaneClick,
    handleDelete,
    cursorNodes,
    getNodeColor,
  }
}
