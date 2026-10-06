import { useEffect, useRef } from 'react'
import { useCompactLayout } from '../../../shared/model/useCompactLayout.ts'
import { defaultWidth } from '../config/defaultWidth.ts'
import { maxWidth } from '../config/maxWidth.ts'
import { minWidth } from '../config/minWidth.ts'
import { storageKey } from '../config/storageKey.ts'
import { createResizableInspectorState } from '../model/createResizableInspectorState.ts'
import { useResizableInspectorModel } from '../model/useResizableInspectorModel.ts'
import type { ResizableInspectorProps } from '../types/resizableInspectorProps.ts'
export function ResizableInspector({
  id,
  className = '',
  children,
}: ResizableInspectorProps) {
  const compact = useCompactLayout()
  const panel = useRef<HTMLElement>(null)
  const drag = useRef<{ pointerId: number; x: number; width: number } | null>(
    null,
  )
  const { limit, setLimit, width, setWidth, resizing, setResizing } =
    useResizableInspectorModel(() => createResizableInspectorState())

  const visibleWidth = Math.min(width, limit)
  const resize = (next: number) => {
    const value = Math.max(minWidth, Math.min(limit, next))
    setWidth(value)
    return value
  }
  const remember = (value: number) => {
    try {
      localStorage.setItem(storageKey, String(value))
    } catch {
      // Resizing still works when browser storage is unavailable.
    }
  }

  useEffect(() => {
    const layout = panel.current?.parentElement
    if (!layout || compact) return
    const observer = new ResizeObserver(([entry]) => {
      setLimit(
        Math.max(minWidth, Math.min(maxWidth, entry.contentRect.width - 320)),
      )
    })
    observer.observe(layout)
    return () => observer.disconnect()
  }, [compact])

  return (
    <aside
      ref={panel}
      id={id}
      className={`inspector resizable-inspector ${className} ${resizing ? 'is-resizing' : ''}`}
      style={
        compact ? undefined : { width: visibleWidth, position: 'relative' }
      }
    >
      {!compact && (
        <div
          className="inspector-resize-handle"
          role="separator"
          tabIndex={0}
          aria-label="Resize details panel"
          aria-orientation="vertical"
          aria-controls={id}
          aria-valuemin={minWidth}
          aria-valuemax={limit}
          aria-valuenow={visibleWidth}
          aria-valuetext={`${visibleWidth} pixels wide`}
          title="Drag to resize · Arrow keys to adjust · Double-click to reset"
          onPointerDown={(event) => {
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
          }}
          onPointerMove={(event) => {
            if (drag.current?.pointerId !== event.pointerId) return
            resize(drag.current.width + drag.current.x - event.clientX)
          }}
          onPointerUp={(event) => {
            if (drag.current?.pointerId !== event.pointerId) return
            remember(
              resize(drag.current.width + drag.current.x - event.clientX),
            )
            drag.current = null
            setResizing(false)
            event.currentTarget.releasePointerCapture(event.pointerId)
          }}
          onLostPointerCapture={() => {
            drag.current = null
            setResizing(false)
          }}
          onDoubleClick={() => remember(resize(defaultWidth))}
          onKeyDown={(event) => {
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
          }}
        />
      )}
      <div className="inspector-scroll">{children}</div>
    </aside>
  )
}
