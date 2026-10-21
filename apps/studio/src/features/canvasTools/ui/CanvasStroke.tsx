import { useCallback, type PointerEvent, type KeyboardEvent } from 'react'
import { strokePath } from '../utils/strokePath.ts'
import type { CanvasStrokeProps } from '../types/canvasStrokeProps.ts'
export function CanvasStroke({
  id,
  stroke,
  zoom,
  label,
  selected,
  selectable,
  select,
}: CanvasStrokeProps) {
  const pointer = useCallback(
    (event: PointerEvent<SVGPathElement>) => {
      if (!selectable || event.button !== 0) return
      event.preventDefault()
      event.stopPropagation()
      event.currentTarget.focus()
      select(id, event.shiftKey || event.ctrlKey || event.metaKey)
    },
    [id, selectable, select],
  )
  const keyboard = useCallback(
    (event: KeyboardEvent<SVGPathElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      select(id, event.shiftKey || event.ctrlKey || event.metaKey)
    },
    [id, select],
  )
  const path = strokePath(stroke)
  return (
    <g>
      {selected && (
        <path
          className="drawing-selection-halo"
          d={path}
          strokeWidth={stroke.width + 7 / zoom}
        />
      )}
      <path
        data-stroke-id={id}
        d={path}
        stroke={stroke.color}
        strokeWidth={stroke.width}
        opacity={stroke.opacity}
      />
      {selectable && (
        <path
          className="drawing-stroke-hit"
          data-stroke-id={id}
          d={path}
          stroke="transparent"
          strokeWidth={Math.max(stroke.width, 14 / zoom)}
          role="button"
          tabIndex={0}
          aria-label={label}
          aria-pressed={selected}
          onPointerDown={pointer}
          onKeyDown={keyboard}
        />
      )}
    </g>
  )
}
