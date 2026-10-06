import { useCallback } from 'react'
import type { UseWireframePreviewProps } from '../types/useWireframePreviewProps.ts'
export function useWireframePreview({
  graph,
  flow,
  select,
  setPreviewMessage,
  t,
}: UseWireframePreviewProps) {
  const focus = useCallback(
    (id: string) => {
      const target = graph.nodes.find((n) => n.id === id)
      if (!target || !flow) return
      const screen = graph.nodes.find((n) => n.id === target.parentId) || target
      void flow.fitView({
        nodes: [{ id: screen.id }],
        padding: 0.25,
        maxZoom: 1,
        duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 0
          : 280,
      })
      select(id)
    },
    [graph, flow, select],
  )
  const follow = useCallback(
    (id: string) => {
      const links = graph.edges.filter((e) => e.source === id)
      if (links.length === 1) {
        focus(links[0].target)
        setPreviewMessage(
          `${links[0].label || 'On click'} → ${graph.nodes.find((n) => n.id === links[0].target)?.data.title}`,
        )
      } else {
        select(id)
        setPreviewMessage(
          links.length
            ? t('Choose a destination in the flow panel.')
            : t('This block has no outgoing flow yet.'),
        )
      }
    },
    [graph, focus, setPreviewMessage, select, t],
  )
  return { follow, focus }
}
