import {
  useCallback,
  useRef,
  type PointerEvent,
  type KeyboardEvent,
} from 'react'
export function useDesignPanelResize(
  width: number,
  limit: number,
  side: 'left' | 'right',
  change: (width: number) => void,
) {
  const gesture = useRef<{ id: number; x: number; width: number } | null>(null)
  const resize = useCallback(
    (next: number) => change(Math.round(Math.max(220, Math.min(limit, next)))),
    [change, limit],
  )
  const down = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return
      event.preventDefault()
      event.stopPropagation()
      event.currentTarget.focus()
      event.currentTarget.setPointerCapture(event.pointerId)
      gesture.current = { id: event.pointerId, x: event.clientX, width }
    },
    [width],
  )
  const move = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const drag = gesture.current
      if (!drag || drag.id !== event.pointerId) return
      resize(drag.width + (event.clientX - drag.x) * (side === 'left' ? 1 : -1))
    },
    [resize, side],
  )
  const end = useCallback((event: PointerEvent<HTMLDivElement>) => {
    gesture.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
  }, [])
  const key = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const step = (event.shiftKey ? 40 : 10) * (side === 'left' ? 1 : -1)
      const next =
        event.key === 'ArrowRight'
          ? width + step
          : event.key === 'ArrowLeft'
            ? width - step
            : event.key === 'Home'
              ? 220
              : event.key === 'End'
                ? limit
                : null
      if (next === null) return
      event.preventDefault()
      event.stopPropagation()
      resize(next)
    },
    [limit, resize, side, width],
  )
  const reset = useCallback(
    () => resize(side === 'left' ? 280 : 300),
    [resize, side],
  )
  return {
    onPointerDown: down,
    onPointerMove: move,
    onPointerUp: end,
    onPointerCancel: end,
    onLostPointerCapture: end,
    onKeyDown: key,
    onDoubleClick: reset,
  }
}
