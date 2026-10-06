import { kindLabels } from '@/widgets/board/config/kindLabels.ts'
import type { Idea } from '@pomegranate/domain/workspace'
import { type Node } from '@xyflow/react'
import { useCallback } from 'react'
import type { UseBlueprintActionsProps } from '../types/useBlueprintActionsProps.ts'
export function useBlueprintActions({
  update,
  board,
  setSelected,
  setSelectedEdge,
  flow,
  setPalette,
  node,
}: UseBlueprintActionsProps) {
  const onDelete = useCallback(
    ({ nodes, edges }: { nodes: Node[]; edges: { id: string }[] }) => {
      const nodeIds = new Set(nodes.map((n) => n.id))
      const edgeIds = new Set(edges.map((e) => e.id))
      update(
        {
          ...board,
          nodes: board.nodes.filter((n) => !nodeIds.has(n.id)),
          edges: board.edges.filter(
            (e) =>
              !edgeIds.has(e.id) &&
              !nodeIds.has(e.source) &&
              !nodeIds.has(e.target),
          ),
        },
        false,
      )
      setSelected(null)
      setSelectedEdge(null)
    },
    [update, board, setSelected, setSelectedEdge],
  )
  const addNode = useCallback(
    (kind: Idea['data']['kind'], at?: { x: number; y: number }) => {
      if (board.nodes.length >= 500) return
      const surface = document
        .querySelector('.canvas-surface')
        ?.getBoundingClientRect()
      const position =
        flow && surface
          ? flow.screenToFlowPosition({
              x: surface.x + surface.width / 2 - 100,
              y: surface.y + surface.height / 2 - 60,
            })
          : { x: 100, y: 100 }
      const id = crypto.randomUUID()
      update({
        ...board,
        nodes: [
          ...board.nodes,
          {
            id,
            type: 'idea',
            position: at || position,
            data: {
              title: `New ${kindLabels[kind].toLowerCase()}`,
              kind,
              description: 'What role does this play?',
              notes: '',
              status: 'Exploring',
              requirements: [],
            },
          },
        ],
      })
      setSelected(id)
      setSelectedEdge(null)
      setPalette(false)
    },
    [board, flow, update, setSelected, setSelectedEdge, setPalette],
  )
  const removeNode = useCallback(() => {
    if (!node) return
    update({
      ...board,
      nodes: board.nodes.filter((n) => n.id !== node.id),
      edges: board.edges.filter(
        (e) => e.source !== node.id && e.target !== node.id,
      ),
    })
    setSelected(null)
  }, [node, update, board, setSelected])
  return { addNode, onDelete, removeNode }
}
