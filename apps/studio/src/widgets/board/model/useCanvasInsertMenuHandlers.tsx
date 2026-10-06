import { useCallback } from 'react'

import type { CanvasInsertMenuHandlersProps } from '../types/useCanvasInsertMenuHandlersProps.ts'
export function useCanvasInsertMenuHandlers({
  onClose,
}: CanvasInsertMenuHandlersProps) {
  const handleKeyDown = useCallback<
    (event: import('react').KeyboardEvent<HTMLDivElement>) => void
  >(
    (event) => {
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
    },
    [onClose],
  )
  return { handleKeyDown }
}
