import {
  useCallback,
  useRef,
  type PointerEvent,
  type KeyboardEvent,
} from 'react'
import type { DesignPanelCornerProps } from '../types/designPanelCornerProps.ts'
export function useDesignPanelCornerResize({
  model,
  side,
  width,
  height,
  widthLimit,
  heightLimit,
}: DesignPanelCornerProps) {
  const { patch } = model
  const left = side === 'left'
  const gesture = useRef<{
    id: number
    x: number
    y: number
    width: number
    height: number
  } | null>(null)
  const resize = useCallback(
    (w: number, h: number) => {
      const nextWidth = Math.round(
        Math.max(
          Math.min(left ? 280 : 220, widthLimit),
          Math.min(widthLimit, w),
        ),
      )
      const nextHeight = Math.round(
        Math.max(Math.min(180, heightLimit), Math.min(heightLimit, h)),
      )
      patch(
        left
          ? { layersWidth: nextWidth, layersHeight: nextHeight }
          : { inspectorWidth: nextWidth, inspectorHeight: nextHeight },
      )
    },
    [heightLimit, left, patch, widthLimit],
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
        x: event.clientX,
        y: event.clientY,
        width,
        height,
      }
    },
    [height, width],
  )
  const move = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const drag = gesture.current
      if (!drag || drag.id !== event.pointerId) return
      resize(
        drag.width + (event.clientX - drag.x) * (left ? 1 : -1),
        drag.height + event.clientY - drag.y,
      )
    },
    [left, resize],
  )
  const end = useCallback((event: PointerEvent<HTMLDivElement>) => {
    gesture.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
  }, [])
  const reset = useCallback(
    () => resize(left ? 280 : 300, left ? 520 : 600),
    [left, resize],
  )
  const key = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (
        ![
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
          'Home',
          'End',
          'Enter',
          ' ',
        ].includes(event.key)
      )
        return
      event.preventDefault()
      event.stopPropagation()
      const step = event.shiftKey ? 40 : 10
      if (event.key === 'Enter' || event.key === ' ') return reset()
      if (event.key === 'Home') return resize(left ? 280 : 220, 180)
      if (event.key === 'End') return resize(widthLimit, heightLimit)
      resize(
        width +
          (event.key === 'ArrowRight'
            ? step
            : event.key === 'ArrowLeft'
              ? -step
              : 0) *
            (left ? 1 : -1),
        height +
          (event.key === 'ArrowDown'
            ? step
            : event.key === 'ArrowUp'
              ? -step
              : 0),
      )
    },
    [height, heightLimit, left, reset, resize, width, widthLimit],
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
