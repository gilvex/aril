import { useCallback } from 'react'

import type { WireframeBoardHandlersProps } from '../types/useWireframeBoardHandlersProps.ts'
export function useWireframeBoardHandlers({
  following,
  flow,
  sendPresence,
}: WireframeBoardHandlersProps) {
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
