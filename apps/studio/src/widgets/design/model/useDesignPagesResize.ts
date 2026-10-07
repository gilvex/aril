import {
  useCallback,
  useRef,
  type PointerEvent,
  type KeyboardEvent,
} from 'react'
import type { DesignEditorModel } from '../types/designEditorModel.ts'
export function useDesignPagesResize(model: DesignEditorModel) {
  const drag = useRef<{ y: number; height: number; max: number } | null>(null)
  const start = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      drag.current = {
        y: event.clientY,
        height:
          event.currentTarget.previousElementSibling?.getBoundingClientRect()
            .height || model.pagesHeight,
        max: Math.max(
          72,
          Math.min(
            800,
            (event.currentTarget.parentElement?.clientHeight || 600) - 200,
          ),
        ),
      }
    },
    [model.pagesHeight],
  )
  const move = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (drag.current)
        model.patch({
          pagesHeight: Math.max(
            72,
            Math.min(
              drag.current.max,
              drag.current.height + event.clientY - drag.current.y,
            ),
          ),
        })
    },
    [model],
  )
  const end = useCallback(() => {
    drag.current = null
  }, [])
  const key = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const max = Math.max(
        72,
        Math.min(
          800,
          (event.currentTarget.parentElement?.clientHeight || 600) - 200,
        ),
      )
      const next =
        event.key === 'ArrowUp'
          ? model.pagesHeight - 24
          : event.key === 'ArrowDown'
            ? model.pagesHeight + 24
            : event.key === 'Home'
              ? 72
              : event.key === 'End'
                ? max
                : null
      if (next !== null) {
        event.preventDefault()
        model.patch({ pagesHeight: Math.max(72, Math.min(max, next)) })
      }
    },
    [model],
  )
  return { start, move, end, key }
}
