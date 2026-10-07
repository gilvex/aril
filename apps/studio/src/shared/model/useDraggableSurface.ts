import { useEffect, useRef, type RefObject } from 'react'
import { useCompactLayout } from './useCompactLayout.ts'
import { createSurfaceMotionStore } from './createSurfaceMotionStore.ts'
import { surfaceMotionSlice } from './slices/surfaceMotionSlice.ts'
export function useDraggableSurface(
  ref: RefObject<HTMLElement | null>,
  resetKey?: unknown,
) {
  const compact = useCompactLayout()
  const storeRef = useRef<ReturnType<typeof createSurfaceMotionStore> | null>(
    null,
  )
  if (!storeRef.current) storeRef.current = createSurfaceMotionStore()
  const store = storeRef.current
  useEffect(() => {
    const element = ref.current
    if (!element) return
    element.setAttribute('data-floating-surface', '')
    const render = () => {
      const { x, y } = store.getState()
      element.style.translate = `${x}px ${y}px`
    }
    const reset = () =>
      store.dispatch(surfaceMotionSlice.actions.move({ x: 0, y: 0 }))
    const unsubscribe = store.subscribe(render)
    reset()
    if (compact)
      return () => {
        unsubscribe()
        element.style.removeProperty('translate')
      }
    let pointer: { id: number; x: number; y: number } | null = null
    const move = (dx: number, dy: number) => {
      const box = element.getBoundingClientRect(),
        position = store.getState()
      const bounds = element
        .closest('[data-surface-bounds]')
        ?.getBoundingClientRect()
      const left = (bounds?.left || 0) + 8
      const top = (bounds?.top || 0) + 8
      const right = bounds?.right ?? innerWidth
      const bottom = bounds?.bottom ?? innerHeight
      const x =
        position.x +
        Math.min(
          Math.max(dx, left - box.left),
          Math.max(left, right - box.width - 8) - box.left,
        )
      const y =
        position.y +
        Math.min(
          Math.max(dy, top - box.top),
          Math.max(top, bottom - box.height - 8) - box.top,
        )
      store.dispatch(surfaceMotionSlice.actions.move({ x, y }))
    }
    const down = (event: PointerEvent) => {
      const target = event.target as HTMLElement
      if (event.button !== 0 || !target.closest('header,h2,.surface-grip'))
        return
      if (
        target.closest(
          'input,textarea,select,a,button:not(.surface-grip),[contenteditable="true"]',
        )
      )
        return
      event.preventDefault()
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY }
      element.setPointerCapture(event.pointerId)
      element.setAttribute('data-dragging', 'true')
    }
    const drag = (event: PointerEvent) => {
      if (!pointer || pointer.id !== event.pointerId) return
      move(event.clientX - pointer.x, event.clientY - pointer.y)
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY }
    }
    const stop = () => {
      const captured = pointer
      pointer = null
      if (captured && element.hasPointerCapture(captured.id))
        element.releasePointerCapture(captured.id)
      element.removeAttribute('data-dragging')
    }
    const key = (event: KeyboardEvent) => {
      if (!(event.target as HTMLElement).closest('.surface-grip')) return
      const step = event.shiftKey ? 40 : 10
      if (event.key === 'Home') {
        event.preventDefault()
        reset()
      }
      if (
        !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)
      )
        return
      event.preventDefault()
      event.stopPropagation()
      move(
        event.key === 'ArrowLeft'
          ? -step
          : event.key === 'ArrowRight'
            ? step
            : 0,
        event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0,
      )
    }
    element.addEventListener('pointerdown', down)
    element.addEventListener('pointermove', drag)
    element.addEventListener('pointerup', stop)
    element.addEventListener('pointercancel', stop)
    element.addEventListener('lostpointercapture', stop)
    element.addEventListener('keydown', key)
    window.addEventListener('resize', reset)
    return () => {
      stop()
      unsubscribe()
      element.style.removeProperty('translate')
      element.removeEventListener('pointerdown', down)
      element.removeEventListener('pointermove', drag)
      element.removeEventListener('pointerup', stop)
      element.removeEventListener('pointercancel', stop)
      element.removeEventListener('lostpointercapture', stop)
      element.removeEventListener('keydown', key)
      window.removeEventListener('resize', reset)
    }
  }, [compact, ref, resetKey, store])
}
