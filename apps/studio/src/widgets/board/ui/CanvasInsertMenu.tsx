import { useTranslation } from '@/shared/i18n/index.ts'
import { useCanvasInsertMenuHandlers } from '../model/useCanvasInsertMenuHandlers.tsx'

import type { CanvasInsertMenuProps } from '@/widgets/board/types/canvasInsertMenuProps.ts'
import { useEffect, useLayoutEffect, useRef } from 'react'

export function CanvasInsertMenu({
  point,
  title,
  items,
  disabled,
  onClose,
}: CanvasInsertMenuProps) {
  const { t } = useTranslation()

  const menu = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const element = menu.current
    const parent = element?.parentElement
    if (!element || !parent) return
    element.style.left = `${Math.max(8, Math.min(point.x, parent.clientWidth - element.offsetWidth - 8))}px`
    element.style.top = `${Math.max(8, Math.min(point.y, parent.clientHeight - element.offsetHeight - 8))}px`
    const previous = document.activeElement
    ;(
      element.querySelector<HTMLButtonElement>('button:not(:disabled)') ||
      element
    ).focus()
    return () => {
      if (
        element.contains(document.activeElement) &&
        previous instanceof HTMLElement
      )
        previous.focus()
    }
  }, [point])
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!menu.current?.contains(event.target as Node)) onClose()
    }
    const dismissOnResize = () => onClose()
    document.addEventListener('pointerdown', dismiss)
    window.addEventListener('resize', dismissOnResize)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      window.removeEventListener('resize', dismissOnResize)
    }
  }, [onClose])

  const { handleKeyDown } = useCanvasInsertMenuHandlers({ onClose })
  return (
    <div
      ref={menu}
      className="canvas-insert-menu"
      role="menu"
      tabIndex={-1}
      aria-label={title}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={handleKeyDown}
    >
      <div className="canvas-insert-heading">{title}</div>
      {items.map((item) => (
        <button
          key={item.id}
          role="menuitem"
          disabled={disabled}
          onClick={() => {
            item.onSelect()
            onClose()
          }}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
      {disabled && <p>{t('This board has reached its 500-item limit.')}</p>}
    </div>
  )
}
