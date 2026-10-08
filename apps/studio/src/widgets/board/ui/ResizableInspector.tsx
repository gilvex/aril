import { useTranslation } from '@/shared/i18n/index.ts'
import { useCompactLayout } from '@/shared/model/useCompactLayout.ts'
import { defaultWidth } from '@/widgets/board/config/defaultWidth.ts'
import { maxWidth } from '@/widgets/board/config/maxWidth.ts'
import { minWidth } from '@/widgets/board/config/minWidth.ts'
import { storageKey } from '@/widgets/board/config/storageKey.ts'
import { createResizableInspectorState } from '@/widgets/board/model/createResizableInspectorState.ts'
import { useResizableInspectorModel } from '@/widgets/board/model/useResizableInspectorModel.ts'
import type { ResizableInspectorProps } from '@/widgets/board/types/resizableInspectorProps.ts'
import { useEffect, useRef } from 'react'
import { useResizableInspectorHandlers } from '../model/useResizableInspectorHandlers.tsx'

export function ResizableInspector({
  id,
  scope,
  className = '',
  children,
}: ResizableInspectorProps) {
  const { t } = useTranslation()

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
  }, [compact, setLimit])

  const {
    handleResizeDetailsPanelPointerDown,
    handleResizeDetailsPanelPointerMove,
    handleResizeDetailsPanelPointerUp,
    handleResizeDetailsPanelLostPointerCapture,
    handleResizeDetailsPanelKeyDown,
  } = useResizableInspectorHandlers({
    drag,
    visibleWidth,
    setResizing,
    resize,
    remember,
    limit,
  })
  return (
    <aside
      ref={panel}
      id={id}
      data-collaboration-scope={scope}
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
          aria-label={t('Resize details panel')}
          aria-orientation="vertical"
          aria-controls={id}
          aria-valuemin={minWidth}
          aria-valuemax={limit}
          aria-valuenow={visibleWidth}
          aria-valuetext={`${visibleWidth} pixels wide`}
          title={t(
            'Drag to resize · Arrow keys to adjust · Double-click to reset',
          )}
          onPointerDown={handleResizeDetailsPanelPointerDown}
          onPointerMove={handleResizeDetailsPanelPointerMove}
          onPointerUp={handleResizeDetailsPanelPointerUp}
          onLostPointerCapture={handleResizeDetailsPanelLostPointerCapture}
          onDoubleClick={() => remember(resize(defaultWidth))}
          onKeyDown={handleResizeDetailsPanelKeyDown}
        />
      )}
      <div className="inspector-scroll">{children}</div>
    </aside>
  )
}
