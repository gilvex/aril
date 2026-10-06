import {
  useCallback,
  useRef,
  useEffect,
  type PointerEvent,
  type KeyboardEvent,
} from 'react'
import type { RequirementsViewProps } from '../types/requirementsViewProps.ts'
export function useRequirementResize({ model }: RequirementsViewProps) {
  const panel = useRef<HTMLElement>(null)
  const drag = useRef<{ x: number; width: number } | null>(null)
  const { setViewState, detailWidth, selectRequirement } = model
  const resize = useCallback(
    (value: number) =>
      setViewState({ detailWidth: Math.max(360, Math.min(850, value)) }),
    [setViewState],
  )
  const start = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      event.preventDefault()
      drag.current = {
        x: event.clientX,
        width: panel.current?.getBoundingClientRect().width || detailWidth,
      }
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [detailWidth],
  )
  const move = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (drag.current)
        resize(drag.current.width + drag.current.x - event.clientX)
    },
    [resize],
  )
  const end = useCallback(() => {
    drag.current = null
  }, [])
  const keys = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key))
        return
      event.preventDefault()
      resize(
        event.key === 'Home'
          ? 360
          : event.key === 'End'
            ? 850
            : detailWidth + (event.key === 'ArrowLeft' ? 24 : -24),
      )
    },
    [detailWidth, resize],
  )
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    if (window.matchMedia('(max-width: 760px)').matches) panel.current?.focus()
    const escape = (event: globalThis.KeyboardEvent) => {
      if (document.querySelector('[data-studio-select-menu]')) return
      if (event.key === 'Escape') selectRequirement(null)
    }
    window.addEventListener('keydown', escape)
    return () => {
      window.removeEventListener('keydown', escape)
      if (previous?.isConnected) previous.focus()
    }
  }, [selectRequirement])
  return {
    panel,
    start,
    move,
    end,
    keys,
    reset: useCallback(() => resize(560), [resize]),
  }
}
