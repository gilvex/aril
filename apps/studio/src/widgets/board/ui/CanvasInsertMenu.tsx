import { useEffect, useLayoutEffect, useRef } from 'react'
import type { CanvasInsertMenuProps } from '../types/canvasInsertMenuProps.ts'
export function CanvasInsertMenu({
  point,
  title,
  items,
  disabled,
  onClose,
}: CanvasInsertMenuProps) {
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
  return (
    <div
      ref={menu}
      className="canvas-insert-menu"
      role="menu"
      tabIndex={-1}
      aria-label={title}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        event.stopPropagation()
        if (event.key === 'Escape' || event.key === 'Tab') {
          if (event.key === 'Escape') event.preventDefault()
          onClose()
          return
        }
        const buttons = [
          ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
            'button:not(:disabled)',
          ),
        ]
        const current = buttons.indexOf(
          document.activeElement as HTMLButtonElement,
        )
        const index =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? buttons.length - 1
              : event.key === 'ArrowDown'
                ? (current + 1) % buttons.length
                : event.key === 'ArrowUp'
                  ? (current - 1 + buttons.length) % buttons.length
                  : -1
        if (index >= 0) {
          event.preventDefault()
          buttons[index]?.focus()
        }
      }}
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
      {disabled && <p>This board has reached its 500-item limit.</p>}
    </div>
  )
}
