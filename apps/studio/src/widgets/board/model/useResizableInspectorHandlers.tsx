import { minWidth } from '@/widgets/board/config/minWidth.ts'
import { useCallback } from 'react'

import type { ResizableInspectorHandlersProps } from '../types/useResizableInspectorHandlersProps.ts'
export function useResizableInspectorHandlers({
  drag,
  visibleWidth,
  setResizing,
  resize,
  remember,
  limit,
}: ResizableInspectorHandlersProps) {
  const handleResizeDetailsPanelPointerDown = useCallback<
    (event: import('react').PointerEvent<HTMLDivElement>) => void
  >(
    (event) => {
      if (event.button !== 0) return
      event.preventDefault()
      event.currentTarget.focus()
      event.currentTarget.setPointerCapture(event.pointerId)
      drag.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        width: visibleWidth,
      }
      setResizing(true)
    },
    [drag, visibleWidth, setResizing],
  )
  const handleResizeDetailsPanelPointerMove = useCallback<
    (event: import('react').PointerEvent<HTMLDivElement>) => void
  >(
    (event) => {
      if (drag.current?.pointerId !== event.pointerId) return
      resize(drag.current.width + drag.current.x - event.clientX)
    },
    [drag, resize],
  )
  const handleResizeDetailsPanelPointerUp = useCallback<
    (event: import('react').PointerEvent<HTMLDivElement>) => void
  >(
    (event) => {
      if (drag.current?.pointerId !== event.pointerId) return
      remember(resize(drag.current.width + drag.current.x - event.clientX))
      drag.current = null
      setResizing(false)
      event.currentTarget.releasePointerCapture(event.pointerId)
    },
    [drag, remember, resize, setResizing],
  )
  const handleResizeDetailsPanelLostPointerCapture = useCallback<
    () => void
  >(() => {
    drag.current = null
    setResizing(false)
  }, [drag, setResizing])
  const handleResizeDetailsPanelKeyDown = useCallback<
    (event: import('react').KeyboardEvent<HTMLDivElement>) => void
  >(
    (event) => {
      const step = event.shiftKey ? 40 : 10
      const next =
        event.key === 'ArrowLeft'
          ? visibleWidth + step
          : event.key === 'ArrowRight'
            ? visibleWidth - step
            : event.key === 'Home'
              ? minWidth
              : event.key === 'End'
                ? limit
                : null
      if (next === null) return
      event.preventDefault()
      remember(resize(next))
    },
    [visibleWidth, limit, remember, resize],
  )
  return {
    handleResizeDetailsPanelPointerDown,
    handleResizeDetailsPanelPointerMove,
    handleResizeDetailsPanelPointerUp,
    handleResizeDetailsPanelLostPointerCapture,
    handleResizeDetailsPanelKeyDown,
  }
}
