import type { CanvasInsertPoint } from '@/widgets/board/types/canvasInsertPoint.ts'
import {
  makeWireNode,
  type WireKind,
  type WireNode,
} from '@pomegranate/domain/wireframe'
import { useCallback } from 'react'
import type { UseWireframeInsertionProps } from '../types/useWireframeInsertionProps.ts'
export function useWireframeInsertion({
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
}: UseWireframeInsertionProps) {
  const openInsertMenu = useCallback(
    (
      event: React.MouseEvent | MouseEvent,
      target?: Pick<WireNode, 'id' | 'data' | 'parentId'>,
    ) => {
      if (preview || !flow || !surface.current) return
      event.preventDefault()
      const bounds = surface.current.getBoundingClientRect()
      setPalette(false)
      setInsertPoint({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        position: flow.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        }),
        parentId: target?.data.kind === 'screen' ? target.id : target?.parentId,
      })
    },
    [preview, flow, surface, setPalette, setInsertPoint],
  )
  const add = useCallback(
    (kind: WireKind, at?: CanvasInsertPoint) => {
      if (graph.nodes.length >= 500) return
      const parentId =
        kind !== 'screen'
          ? at
            ? at.parentId
            : node?.data.kind === 'screen'
              ? node.id
              : node?.parentId
          : undefined
      const bounds = surface.current?.getBoundingClientRect()
      const center =
        bounds && flow
          ? flow.screenToFlowPosition({
              x: bounds.x + bounds.width / 2,
              y: bounds.y + bounds.height / 2,
            })
          : { x: 100, y: 100 }
      const offset =
        (graph.nodes.filter((n) => n.parentId === parentId).length % 6) * 24
      const added = makeWireNode(
        kind,
        crypto.randomUUID(),
        parentId
          ? { x: 32 + offset, y: 70 + offset }
          : { x: center.x - 140 + offset, y: center.y - 80 + offset },
        parentId,
      )
      if (at) {
        const parent = liveNodes.find((n) => n.id === parentId)
        added.position = parent
          ? {
              x: Math.max(
                0,
                Math.min(
                  at.position.x - parent.position.x,
                  parent.width - added.width,
                ),
              ),
              y: Math.max(
                0,
                Math.min(
                  at.position.y - parent.position.y,
                  parent.height - added.height,
                ),
              ),
            }
          : at.position
      }
      if (!at && kind === 'screen' && screens.length)
        added.position = {
          x:
            Math.max(
              ...screens.map((screen) => screen.position.x + screen.width),
            ) + 120,
          y: screens[0].position.y,
        }
      if (!at) pendingFocus.current = parentId || added.id
      save({ ...graph, nodes: [...graph.nodes, added] })
      select(added.id)
      setPalette(false)
    },
    [
      graph,
      node,
      surface,
      flow,
      liveNodes,
      screens,
      pendingFocus,
      save,
      select,
      setPalette,
    ],
  )
  const starter = useCallback(() => {
    const screen = makeWireNode('screen', crypto.randomUUID(), { x: 60, y: 70 })
    pendingFocus.current = screen.id
    screen.data.title = 'Your first screen'
    const heading = makeWireNode(
      'text',
      crypto.randomUUID(),
      { x: 36, y: 90 },
      screen.id,
    )
    heading.data.title = 'What happens here?'
    heading.data.content = 'Arrange blocks to sketch the experience.'
    heading.width = 440
    const card = makeWireNode(
      'card',
      crypto.randomUUID(),
      { x: 36, y: 184 },
      screen.id,
    )
    card.width = 568
    card.data.title = 'Main content'
    const button = makeWireNode(
      'button',
      crypto.randomUUID(),
      { x: 436, y: 370 },
      screen.id,
    )
    save({ ...graph, nodes: [...graph.nodes, screen, heading, card, button] })
    select(screen.id)
  }, [pendingFocus, save, graph, select])
  return { add, openInsertMenu, starter }
}
