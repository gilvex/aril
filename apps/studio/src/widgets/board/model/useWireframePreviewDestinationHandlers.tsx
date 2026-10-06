import { useCallback } from 'react'

import type { WireframePreviewDestinationHandlersProps } from '../types/useWireframePreviewDestinationHandlersProps.ts'
export function useWireframePreviewDestinationHandlers({
  focus,
  e,
  setPreviewMessage,
  graph,
}: WireframePreviewDestinationHandlersProps) {
  const handleClick = useCallback<() => void>(() => {
    focus(e.target)
    setPreviewMessage(
      `${e.label} → ${graph.nodes.find((n) => n.id === e.target)?.data.title}`,
    )
  }, [focus, e, setPreviewMessage, graph])
  return { handleClick }
}
