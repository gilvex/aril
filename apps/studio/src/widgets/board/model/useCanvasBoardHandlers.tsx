import { useCallback } from 'react'

import type { CanvasBoardHandlersProps } from '../types/useCanvasBoardHandlersProps.ts'
export function useCanvasBoardHandlers({
  following,
  flow,
  sendPresence,
}: CanvasBoardHandlersProps) {
  const handlePointerMove = useCallback<
    (event: import('react').PointerEvent<HTMLDivElement>) => void
  >(
    (event) => {
      if (following) return
      if (flow)
        sendPresence({
          cursor: flow.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          }),
        })
    },
    [following, flow, sendPresence],
  )
  return { handlePointerMove }
}
