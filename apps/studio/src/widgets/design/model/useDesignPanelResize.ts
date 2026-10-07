import {
  useCallback,
  useRef,
  type PointerEvent,
  type KeyboardEvent,
} from 'react'
export function useDesignPanelResize(
  width: number,
  limit: number,
  side: 'left' | 'right' | 'bottom',
  change: (width: number) => void,
  defaultSize = side === 'left' ? 280 : 300,
) {
  const vertical = side === 'bottom'
  const minimum = Math.min(limit, vertical ? 180 : 220)
  const gesture = useRef<{ id: number; x: number; width: number } | null>(null)
  const resize = useCallback(
    (next: number) =>
      change(Math.round(Math.max(minimum, Math.min(limit, next)))),
    [change, limit, minimum],
  )
  const down = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return
      event.preventDefault()
      event.stopPropagation()
      event.currentTarget.focus()
      event.currentTarget.setPointerCapture(event.pointerId)
      gesture.current = {
        id: event.pointerId,
        x: vertical ? event.clientY : event.clientX,
        width,
      }
    },
    [width, vertical],
  )
  const move = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const drag = gesture.current
      if (!drag || drag.id !== event.pointerId) return
      resize(
        drag.width +
          ((vertical ? event.clientY : event.clientX) - drag.x) *
            (side === 'right' ? -1 : 1),
      )
    },
    [resize, side, vertical],
  )
  const end = useCallback((event: PointerEvent<HTMLDivElement>) => {
    gesture.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
  }, [])
  const key = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const step = (event.shiftKey ? 40 : 10) * (side === 'right' ? -1 : 1)
      const next =
        event.key === (vertical ? 'ArrowDown' : 'ArrowRight')
          ? width + step
          : event.key === (vertical ? 'ArrowUp' : 'ArrowLeft')
            ? width - step
            : event.key === 'Home'
              ? minimum
              : event.key === 'End'
                ? limit
                : null
      if (next === null) return
      event.preventDefault()
      event.stopPropagation()
      resize(next)
    },
    [limit, resize, side, width, vertical, minimum],
  )
  const reset = useCallback(() => resize(defaultSize), [resize, defaultSize])
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
